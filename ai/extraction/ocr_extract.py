"""OCR for scanned PDFs and JPG/PNG uploads via Tesseract."""
import os
import shutil
import sys

import pytesseract
from PIL import Image
from ai.extraction.pdf_extract import render_pdf_pages_as_images


def _configure_tesseract_binary() -> None:
    """Point pytesseract at the tesseract binary if it isn't already on PATH.

    On Windows, `pip install pytesseract` only installs the Python wrapper —
    the actual Tesseract OCR engine has to be installed separately (e.g. via
    https://github.com/UB-Mannheim/tesseract/wiki) and is usually NOT added
    to PATH automatically. Without this, calls fail with:
        FileNotFoundError: [WinError 2] The system cannot find the file specified
    """
    if shutil.which("tesseract"):
        return  # already resolvable on PATH, nothing to do

    if sys.platform.startswith("win"):
        candidates = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
        for path in candidates:
            if os.path.isfile(path):
                pytesseract.pytesseract.tesseract_cmd = path
                return


_configure_tesseract_binary()


def ocr_image_file(file_path: str) -> str:
    try:
        image = Image.open(file_path)
        return pytesseract.image_to_string(image)
    except pytesseract.TesseractNotFoundError as exc:
        raise RuntimeError(
            "Tesseract OCR engine is not installed or not on PATH. "
            "Install it from https://github.com/UB-Mannheim/tesseract/wiki "
            "(Windows) or `apt install tesseract-ocr` (Linux/Mac), then "
            "restart the backend."
        ) from exc


def ocr_pdf_file(file_path: str) -> str:
    try:
        images = render_pdf_pages_as_images(file_path)
        return "\n".join(pytesseract.image_to_string(img) for img in images)
    except pytesseract.TesseractNotFoundError as exc:
        raise RuntimeError(
            "Tesseract OCR engine is not installed or not on PATH. "
            "Install it from https://github.com/UB-Mannheim/tesseract/wiki "
            "(Windows) or `apt install tesseract-ocr` (Linux/Mac), then "
            "restart the backend."
        ) from exc