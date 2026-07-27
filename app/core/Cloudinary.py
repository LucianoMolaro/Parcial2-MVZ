import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, status
from app.core.Config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

def upload_image_to_cloud(file_bytes: bytes, folder: str) -> dict:
    try:
        result = cloudinary.uploader.upload(file_bytes, folder=folder)
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"] 
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el proveedor de nube: {str(e)}"
        )
    
def delete_image_from_cloud(public_id: str):
    try:
        result = cloudinary.uploader.destroy(public_id)
        if result["result"] == "not found":
            raise HTTPException(
                status_code=404,
                detail="La imagen no existe."
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el proveedor de nube: {str(e)}"
        )