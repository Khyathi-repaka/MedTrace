"""Real PDF text extraction via PyMuPDF. Detects text-poor (scanned) PDFs
so the caller can fall back to OCR instead of assuming every PDF has a text layer."""
import fitz  # PyMuPDF

MIN_CHARS_PER_PAGE_FOR_TEXT_PDF = 20


def extract_pdf_text(file_path: str) -> tuple[str, bool]:
    """Returns (text, needs_ocr)."""
    doc = fitz.open(file_path)
    pages_text = []
    for page in doc:
        pages_text.append(page.get_text("text"))
    doc.close()

    full_text = "\n".join(pages_text).strip()
    avg_chars = len(full_text) / max(len(pages_text), 1)
    needs_ocr = avg_chars < MIN_CHARS_PER_PAGE_FOR_TEXT_PDF
    return full_text, needs_ocr


def render_pdf_pages_as_images(file_path: str, dpi: int = 200) -> list["Image.Image"]:
    from PIL import Image
    import io
    doc = fitz.open(file_path)
    images = []
    for page in doc:
        pix = page.get_pixmap(dpi=dpi)
        images.append(Image.open(io.BytesIO(pix.tobytes("png"))))
    doc.close()
    return images
