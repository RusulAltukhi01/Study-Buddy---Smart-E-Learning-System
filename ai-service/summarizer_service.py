import os
import re
import gc
import torch
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from pypdf import PdfReader
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import traceback

app = Flask(__name__)
CORS(app)


MODEL_NAME = "cognitivetech/Mistral-7B-Inst-0.2-Bulleted-Notes"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
CHUNK_SIZE = 1024
STRIDE = 256
MAX_NEW_TOKENS = 96


LORA_ADAPTER_PATH = "./models/mistral-bullet-lora-final"


model = None
tokenizer = None


def clean_text_for_summarization(text: str) -> str:
    """Clean extracted PDF text before summarization"""
    # Remove control characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    
    # Fix common OCR errors
    replacements = {
        'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl',
        '\u2014': '-', '\u2013': '-',
        '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"',
        '\u2026': '...',
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    
    # Remove bullet symbols
    text = re.sub(r'[◼◻■□▪▫●○◆◇►▶‣⁃]', '', text)
    
    # Replace arrows with dash
    text = re.sub(r'[🡪🡺➔→⇒⇨▸▹►]', '-', text)
    
    # Remove URLs and emails
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\S+@\S+\.\S+', '', text)
    
    # Remove standalone numbers (page numbers)
    text = re.sub(r'\b\d{1,4}\b', '', text)
    text = re.sub(r'[-\s]*\bpage\s*\d+\b[-\s]*', '', text, flags=re.IGNORECASE)
    
    # Clean up lines
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if len(stripped) == 0:
            cleaned_lines.append('')
        elif len(stripped) <= 2 and not stripped.isalnum():
            continue
        elif re.match(r'^[•\-*_=]+$', stripped):
            continue
        else:
            cleaned_lines.append(line)
    
    text = '\n'.join(cleaned_lines)
    
    # Collapse whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    # Deduplicate sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    seen = set()
    unique_sentences = []
    for sent in sentences:
        norm_sent = re.sub(r'[^\w\s]', '', sent.strip().lower())
        if norm_sent and norm_sent not in seen:
            seen.add(norm_sent)
            unique_sentences.append(sent.strip())
    
    return ' '.join(unique_sentences).strip()

def clean_bullet_summary(text: str) -> str:
    text = re.sub(r'[\x00-\x1f\x7f]', '', text)
    
    # Remove Gemma turn artifacts (replacing the Mistral [INST] removal)
    text = re.sub(r'<start_of_turn>|<end_of_turn>|<\/?s>', '', text)
    text = re.sub(r'\[/?INST\]', '', text)  # keep for safety
    
    # Replace arrows and bullets
    text = re.sub(r'[🡪🡺➔→⇒⇨▸▹►]', '-', text)
    text = re.sub(r'[•◦▪‣⁃◼◻■□●○◆◇]', '-', text)
    
    lines, cleaned = text.split('\n'), []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if re.match(r'^[\s\-=_\d.:;,!?()]+$', s):
            continue
        s = re.sub(r'^[-–]\s*', '- ', s)
        cleaned.append(s)
    
    result = '\n'.join(cleaned)
    return re.sub(r'\n{3,}', '\n\n', result).strip()
    """Clean the generated summary output"""
    # Remove control characters
    text = re.sub(r'[\x00-\x1f\x7f]', '', text)
    
    # Remove RTL markers
    text = re.sub(r'[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]', '', text)
    
    # Replace arrows and bullets
    text = re.sub(r'[🡪🡺➔→⇒⇨▸▹►]', '-', text)
    text = re.sub(r'[•◦▪‣⁃◼◻■□●○◆◇]', '-', text)
    
    # Remove model artifacts
    text = re.sub(r'```|\[/?INST\]|<\/?s>', '', text)
    
    # Clean up lines
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if re.match(r'^[\s\-=_\d.:;,!?()]+$', stripped):
            continue
        stripped = re.sub(r'^[-–]\s*', '- ', stripped)
        cleaned.append(stripped)
    
    result = '\n'.join(cleaned)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()


def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    reader = PdfReader(pdf_path)
    text_pages = []
    for page in reader.pages:
        txt = page.extract_text()
        if txt and txt.strip():
            text_pages.append(txt)
    if not text_pages:
        return ""
    return "\n".join(text_pages)

def chunk_text(text, tokenizer, max_length=CHUNK_SIZE, stride=STRIDE):
    """Split text into overlapping chunks"""
    token_ids = tokenizer.encode(text, add_special_tokens=False)
    chunks = []
    for start in range(0, len(token_ids), max_length - stride):
        end = start + max_length
        chunk_ids = token_ids[start:end]
        if len(chunk_ids) < 100:
            continue
        chunks.append(tokenizer.decode(chunk_ids, skip_special_tokens=True))
    return chunks

# ==============================================================
# Prompt Building
# ==============================================================
# def build_prompt(chunk_text, format_type="bullets"):
    """Build prompt based on format preference"""
    if format_type == "bullets":
        instruction = "Extract the key points from the following text and present them as a concise bullet-point list. Use only information from the text."
    elif format_type == "paragraphs":
        instruction = "Summarize the following text in 2-3 concise paragraphs. Focus on the main ideas and key takeaways."
    else:  # outline
        instruction = "Create a structured outline of the key concepts from the following text. Use hierarchical bullet points."
    
    return f"<s>[INST] {instruction}\n\nText:\n{chunk_text}\n\nSummary:\n[/INST]"

def build_prompt(chunk_text, format_type="bullets"):
    if format_type == "bullets":
        instruction = "Extract the key points from the following text as a concise bullet-point list."
    elif format_type == "paragraphs":
        instruction = "Summarize the following text in 2-3 concise paragraphs."
    else:
        instruction = "Create a structured outline of the key concepts from the following text."

    return (
        "<start_of_turn>user\n"
        f"{instruction}\n\n"
        f"Text:\n{chunk_text}\n\n"
        "Bullet points:\n"
        "<end_of_turn>\n"
        "<start_of_turn>model\n"
    )

def generate_chunk_summary(model, tokenizer, chunk_text, format_type="bullets", max_new_tokens=MAX_NEW_TOKENS):
    """Generate summary for a single chunk"""
    prompt = build_prompt(chunk_text, format_type)
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=CHUNK_SIZE).to(DEVICE)
    
    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            repetition_penalty=1.1,
            no_repeat_ngram_size=3,
            early_stopping=True,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )
    
    generated_ids = outputs[0][inputs['input_ids'].shape[1]:]
    raw = tokenizer.decode(generated_ids, skip_special_tokens=True)
    return clean_bullet_summary(raw)

def load_model():
    """Load the model and LoRA adapter"""
    global model, tokenizer
    
    print("Loading base model...")
    base_model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True,
        attn_implementation="eager"
    )
    
    print("Loading LoRA adapter...")
    model = PeftModel.from_pretrained(base_model, LORA_ADAPTER_PATH)
    model.eval()
    model.config.use_cache = True
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "left"
    
    print("Model loaded successfully!")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': DEVICE
    })

@app.route("/generate-summary", methods=["POST"])
def generate_summary():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded = request.files["file"]
    if not uploaded.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        file_bytes = uploaded.read()

        reader = PdfReader(io.BytesIO(file_bytes))
        pages = [p.extract_text() for p in reader.pages if p.extract_text()]
        raw_text = "\n".join(pages)

        if not raw_text.strip():
            return jsonify({"error": "No selectable text found in PDF"}), 422

        cleaned = clean_text_for_summarization(raw_text)
        chunks = chunk_text(cleaned, tokenizer)  # uses tokenizer.encode internally

        summaries = []
        for chunk in chunks:
            summaries.append(generate_chunk_summary(model, tokenizer, chunk))
            torch.cuda.empty_cache()
            gc.collect()

        return jsonify({"summary": "\n\n".join(summaries)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    """Generate summary from uploaded PDF"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check file type
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'success': False, 'error': 'Only PDF files are supported'}), 400
        
        # Get format preference (default to bullets)
        format_type = request.form.get('format', 'bullets')
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        try:
            # Extract text from PDF
            print(f"Extracting text from: {file.filename}")
            raw_text = extract_text_from_pdf(tmp_path)
            
            if not raw_text.strip():
                return jsonify({'success': False, 'error': 'No text could be extracted from PDF'}), 400
            
            # Clean text
            print("Cleaning text...")
            cleaned_text = clean_text_for_summarization(raw_text)
            
            # Chunk text
            print("Chunking document...")
            chunks = chunk_text(cleaned_text, tokenizer)
            print(f"Split into {len(chunks)} chunks")
            
            # Generate summaries for each chunk
            print("Generating summaries...")
            all_summaries = []
            for i, chunk in enumerate(chunks):
                print(f"Processing chunk {i+1}/{len(chunks)}...")
                summary = generate_chunk_summary(model, tokenizer, chunk, format_type)
                all_summaries.append(summary)
                
                # Clear GPU cache
                torch.cuda.empty_cache()
                gc.collect()
            
            # Combine summaries
            final_summary = "\n\n".join(all_summaries)
            
            return jsonify({
                'success': True,
                'summary': final_summary,
                'chunks_processed': len(chunks),
                'filename': file.filename
            })
            
        finally:
            # Clean up temp file
            os.unlink(tmp_path)
            
    except Exception as e:
        print(f"Error generating summary: {traceback.format_exc()}")
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    load_model()
    app.run(host='0.0.0.0', port=8000, debug=False) 