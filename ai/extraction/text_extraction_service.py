"""
Entry point used by the document pipeline: figures out file type, extracts
text via PyMuPDF, falls back to OCR for scans/images. Never assumes a PDF
has a selectable text layer.
"""
import os
from ai.extraction.pdf_extract import extract_pdf_text
from ai.extraction.ocr_extract import ocr_image_file, ocr_pdf_file


def extract_text_from_document(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        text, needs_ocr = extract_pdf_text(file_path)
        if needs_ocr:
            ocr_text = ocr_pdf_file(file_path)
            return ocr_text if len(ocr_text.strip()) > len(text) else text
        return text

    if ext in {".jpg", ".jpeg", ".png"}:
        return ocr_image_file(file_path)

    raise ValueError(f"Unsupported file type for extraction: {ext}")
