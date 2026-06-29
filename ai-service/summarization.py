
import os
import re
import gc
import io
import torch
from flask import Blueprint, request, jsonify
from pypdf import PdfReader
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel


summarization_bp = Blueprint("summarization", __name__)


BASE_MODEL_NAME   = "cognitivetech/Mistral-7B-Inst-0.2-Bulleted-Notes"
LORA_ADAPTER_PATH = os.path.join(os.path.dirname(__file__), "mistral-bullet-lora-final")
DEVICE            = "cuda" if torch.cuda.is_available() else "cpu"
CHUNK_SIZE        = 1024
STRIDE            = 256
MAX_NEW_TOKENS    = 96


_model     = None
_tokenizer = None


def load_summarization_model():

    global _model, _tokenizer

    if _model is not None:
        print("[summarization] Model already loaded – skipping.")
        return

    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    print("[summarization] Loading base model in FP16 …")
    base = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True,
        attn_implementation="eager",
    )

    print(f"[summarization] Loading LoRA adapter from {LORA_ADAPTER_PATH} …")
    _model = PeftModel.from_pretrained(base, LORA_ADAPTER_PATH)
    _model.eval()
    _model.config.use_cache = True

    _tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME, trust_remote_code=True)
    _tokenizer.pad_token      = _tokenizer.eos_token
    _tokenizer.padding_side   = "left"

    print("[summarization] Model ready.")



def _clean_text(text: str) -> str:
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    replacements = {
        'rn': 'm', 'cl': 'd', 'vv': 'w', 'ﬁ': 'fi', 'ﬂ': 'fl',
        '\u2014': '-', '\u2013': '-',
        '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"',
        '\u2026': '...',
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'\S+@\S+\.\S+', '', text)
    text = re.sub(r'\b\d{1,4}\b', '', text)
    text = re.sub(r'[-\s]*\bpage\s*\d+\b[-\s]*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'[-\s]+\d+[-\s]+', '', text)
    text = re.sub(r'^\s*\d+\s+', '', text, flags=re.MULTILINE)
    lines, cleaned_lines = text.split('\n'), []
    for line in lines:
        s = line.strip()
        if not s:
            cleaned_lines.append('')
        elif len(s) <= 2 and not s.isalnum():
            continue
        elif re.match(r'^[•\-*_]+$', s):
            continue
        else:
            cleaned_lines.append(line)
    text = '\n'.join(cleaned_lines)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    sentences, seen, unique = re.split(r'(?<=[.!?])\s+', text), set(), []
    for sent in sentences:
        norm = re.sub(r'[^\w\s]', '', sent.strip().lower())
        if norm and norm not in seen:
            seen.add(norm)
            unique.append(sent.strip())
    return ' '.join(unique).strip()


def _extract_pdf_text(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages  = [p.extract_text() for p in reader.pages if p.extract_text()]
    return '\n'.join(pages)


def _chunk_text(text: str):
    ids    = _tokenizer.encode(text, add_special_tokens=False)
    chunks = []
    for start in range(0, len(ids), CHUNK_SIZE - STRIDE):
        chunk_ids = ids[start: start + CHUNK_SIZE]
        if len(chunk_ids) < 100:
            continue
        chunks.append(_tokenizer.decode(chunk_ids, skip_special_tokens=True))
    return chunks


def _build_prompt(chunk: str) -> str:
    return (
        "<s>[INST] You are an expert academic summarizer.\n\n"

        "Your task:\n"
        "Convert the text into a structured summary with clear sections.\n\n"

        "STRICT FORMAT:\n"
        "## Section Name\n"
        "- Point 1\n"
        "- Point 2\n"
        "   - Sub-point (if needed)\n\n"

        "Rules:\n"
        "- ALWAYS create section headings using '##'\n"
        "- Group related ideas under the SAME section\n"
        "- Use '-' for bullet points\n"
        "- Use 3 spaces indentation for sub-points\n"
        "- DO NOT write paragraphs\n"
        "- DO NOT repeat phrases like 'Here are the key points'\n"
        "- Keep it clean and readable\n\n"

        f"Text:\n{chunk}\n\n"
        "Structured Summary:\n[/INST]"
    )
    return (
        "<s>[INST] You are an expert academic summarizer.\n\n"

        "Convert the text into a structured summary.\n\n"

        "STRICT FORMAT:\n"
        "## Section Title\n"
        "- Main point\n"
        "   - Sub-point\n\n"

        "Rules:\n"
        "- ALWAYS use '##' for section titles\n"
        "- Group related ideas under the same section\n"
        "- Use '-' for bullets\n"
        "- Use 3 spaces indentation for sub-points\n"
        "- NO paragraphs\n"
        "- NO repeated phrases like 'Here are the key points'\n\n"

        f"Text:\n{chunk}\n\n"
        "Structured Summary:\n[/INST]"
    )


import re
import unicodedata

def _clean_output(text: str) -> str:
    import re
    import unicodedata

    text = unicodedata.normalize('NFKC', text)


    text = re.sub(r'Here are.*?:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'(let me know|i hope|feel free).*', '', text, flags=re.IGNORECASE)


    text = re.sub(r'[\uf000-\uffff]', '', text)
    text = re.sub(r'[\x00-\x1f\x7f]', '', text)

    lines = text.split('\n')
    cleaned = []
    current_section = None

    for line in lines:
        s = line.strip()
        if not s:
            continue

     
        if s.startswith("##"):
            current_section = s
            cleaned.append(s)
            continue


        if current_section is None:
            current_section = "## General"
            cleaned.append(current_section)

 
        s = re.sub(r'^[\*\-•\.\s]+', '', s)

     
        if any(s.lower().startswith(k) for k in [
            "example", "types", "steps", "methods"
        ]):
            cleaned.append(f"   - {s}")
        else:
            cleaned.append(f"- {s}")

    return "\n".join(cleaned).strip()


    import re

    text = re.sub(r'Here are.*?:', '', text, flags=re.IGNORECASE)

    lines = text.split('\n')
    cleaned = []
    current_section = None

    for line in lines:
        s = line.strip()
        if not s:
            continue

   
        if s.startswith("##"):
            current_section = s
            cleaned.append(s)
            continue


        if current_section is None:
            current_section = "## General"
            cleaned.append(current_section)

        s = re.sub(r'^[\*\-•\.\s]+', '', s)


        if any(s.lower().startswith(k) for k in [
            "example", "types", "steps", "methods"
        ]):
            cleaned.append(f"   - {s}")
        else:
            cleaned.append(f"- {s}")

    return "\n".join(cleaned)
    import re
    import unicodedata


    text = unicodedata.normalize('NFKC', text)

   
    text = re.sub(r'Here are.*?:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'(let me know|i hope|feel free).*', '', text, flags=re.IGNORECASE)

 
    text = re.sub(r'[\uf000-\uffff]', '', text)
    text = re.sub(r'[\x00-\x1f\x7f]', '', text)

    lines = text.split('\n')
    cleaned = []

    for line in lines:
        s = line.strip()

        if not s:
            continue

 
        if ':' in s and len(s.split()) <= 6:
            cleaned.append(f"## {s.replace(':','')}")
            continue


        s = re.sub(r'^[\*\-•\.\s]+', '', s)

    
        if any(s.lower().startswith(k) for k in [
            "trend", "seasonality", "cyclical", "example",
            "types", "steps", "methods"
        ]):
            cleaned.append(f"   - {s}")
        else:
            cleaned.append(f"- {s}")

    result = '\n'.join(cleaned)

    # Remove duplicates
    seen = set()
    final = []
    for line in result.split('\n'):
        key = line.strip().lower()
        if key not in seen:
            seen.add(key)
            final.append(line)

    return '\n'.join(final).strip()

    # Heuristic: if a space is between two letters, remove it
    text = re.sub(r'(?<=[a-zA-Z]) +(?=[a-zA-Z])', '', text)

    # Step 2: Remove invalid Unicode / private-use characters
    text = re.sub(r'[\uf000-\uffff]', '', text)
    text = re.sub(r'\\u[0-9a-fA-F]{0,3}(?![0-9a-fA-F])', '', text)
    text = unicodedata.normalize('NFKC', text)

    # Step 3: Strip common PDF artifacts
    text = re.sub(r'%[þÉý¢£¥§©®™]', '', text)
    text = re.sub(r'[þðã¢¥§©®™]', '', text)
    text = re.sub(r'%\s*', '', text)

    # Step 4: Remove control characters and RTL markers
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    text = re.sub(r'[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]', '', text)

    # Step 5: Remove model‑specific artifacts
    text = re.sub(r'```|\[/?INST\]|<\/?s>|<start_of_turn>|<end_of_turn>', '', text)

    # Step 6: Standardize bullet symbols
    text = re.sub(r'[🡪🡺➔→⇒⇨▸▹►]', '-', text)
    text = re.sub(r'[•◦▪‣⁃◼◻■□●○◆◇]', '-', text)
    text = re.sub(r'^\s*[*·]\s+', '- ', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*[-–—]\s*', '- ', text, flags=re.MULTILINE)

    # Step 7: Remove preamble / closing fluff (if any)
    preamble = r'^(here are|here is|the following|below|key points|summary[:\s]*|bullet.?points?)'
    text = re.sub(preamble, '', text, flags=re.IGNORECASE | re.MULTILINE)
    closing = r'(let me know|please|i hope|feel free|if you need|hope this helps).*$'
    text = re.sub(closing, '', text, flags=re.IGNORECASE | re.MULTILINE)

    # Step 8: Line‑by‑line cleanup
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if re.match(r'^[\s\-•◦▪‣⁃\d]+$', s):   # only symbols/digits
            continue
        if len(s) <= 2 and not s[0].isalpha():
            continue
        # Ensure bullet lines start with "- "
        if not s.startswith('- ') and not s.startswith('##'):
            s = '- ' + s
        cleaned.append(s)

    result = '\n'.join(cleaned)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()


def _remove_duplicate_blocks(text: str) -> str:
    seen = set()
    result = []

    for block in text.split('\n\n'):
        key = block.strip().lower()
        if key not in seen:
            seen.add(key)
            result.append(block)

    return '\n\n'.join(result)

def _generate_chunk_summary(chunk: str) -> str:
    prompt = _build_prompt(chunk)
    inputs = _tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=CHUNK_SIZE,
    ).to(DEVICE)
    with torch.inference_mode():
        output_ids = _model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=False,
            repetition_penalty=1.1,
            no_repeat_ngram_size=3,
            early_stopping=True,
            eos_token_id=_tokenizer.eos_token_id,
            pad_token_id=_tokenizer.eos_token_id,
        )
    new_ids = output_ids[0][inputs["input_ids"].shape[1]:]
    raw     = _tokenizer.decode(new_ids, skip_special_tokens=True)
    return _clean_output(raw)




@summarization_bp.route("/generate-summary", methods=["POST"])
def generate_summary():
    """
    Accepts multipart/form-data with:
        file   – PDF file (required)

    Returns JSON:
        { "summary": "<bullet-point text>" }
    """
    if _model is None or _tokenizer is None:
        return jsonify({"error": "Summarization model not loaded"}), 503

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded = request.files["file"]
    if not uploaded.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        file_bytes = uploaded.read()

        # 1. Extract
        raw_text = _extract_pdf_text(file_bytes)
        if not raw_text.strip():
            return jsonify({"error": "No selectable text found in PDF"}), 422

        # 2. Clean
        cleaned = _clean_text(raw_text)
        if not cleaned:
            return jsonify({"error": "Text empty after cleaning"}), 422

        # 3. Chunk
        chunks = _chunk_text(cleaned)
        if not chunks:
            return jsonify({"error": "Document too short to summarize"}), 422

        # 4. Generate
        summaries = []
        for chunk in chunks:
            summaries.append(_generate_chunk_summary(chunk))
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect()

        final_summary = _remove_duplicate_blocks("\n\n".join(summaries))
        return jsonify({"summary": final_summary})

    except Exception as e:
        print(f"[summarization] Error: {e}")
        return jsonify({"error": str(e)}), 500