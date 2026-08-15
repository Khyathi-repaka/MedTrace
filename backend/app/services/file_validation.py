import os
from fastapi import UploadFile, HTTPException
from app.core.config import get_settings

ALLOWED_EXT = {".pdf", ".jpg", ".jpeg", ".png"}


def validate_upload(file: UploadFile, content: bytes) -> str:
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_EXT)}")

    max_bytes = get_settings().MAX_UPLOAD_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(400, f"File exceeds {get_settings().MAX_UPLOAD_MB}MB limit")

    if len(content) == 0:
        raise HTTPException(400, "Uploaded file is empty")

    return ext
