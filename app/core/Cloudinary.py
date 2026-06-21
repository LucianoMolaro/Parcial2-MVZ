import cloudinary
import cloudinary.uploader
from app.core.Config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_image(file_bytes: bytes, folder: str = "productos") -> str:
    result = cloudinary.uploader.upload(file_bytes, folder=folder)
    return result["secure_url"]
