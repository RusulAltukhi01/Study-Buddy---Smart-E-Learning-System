from flask import Flask, request, jsonify
import io, re, gc, torch
from pypdf import PdfReader

@app.route("/generate-summary", methods=["POST"])
def generate_summary():
    
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded = request.files["file"]

    try:
        file_bytes = uploaded.read()
        
        # Extract
        reader = PdfReader(io.BytesIO(file_bytes))
        pages = [p.extract_text() for p in reader.pages if p.extract_text()]
        raw_text = "\n".join(pages)
        
        if not raw_text.strip():
            return jsonify({"error": "No selectable text found in PDF"}), 422

        # Clean → Chunk → Generate 
        cleaned = clean_text_for_summarization(raw_text)
        chunks = chunk_text(cleaned, tokenizer)

        summaries = []
        for chunk in chunks:
            summaries.append(generate_chunk_summary(model, tokenizer, chunk))
            torch.cuda.empty_cache()
            gc.collect()

        return jsonify({"summary": "\n\n".join(summaries)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500