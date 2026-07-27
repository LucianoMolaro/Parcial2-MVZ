from io import BytesIO
from PIL import Image
from fastapi import HTTPException, status
from app.core.Cloudinary import delete_image_from_cloud, upload_image_to_cloud

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def upload_image(file_bytes: bytes, mime_type: str, folder: str) -> dict:

    try:
        Image.open(BytesIO(file_bytes)).verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="El archivo no es una imagen válida."
        )
    
    if not mime_type:
        raise HTTPException(
            status_code=400,
            detail="No se pudo determinar el tipo del archivo."
        )
        
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La imagen es muy pesada. El tamaño máximo permitido es de 5MB."
        )
    
    return upload_image_to_cloud(file_bytes, folder)


def delete_image(public_id: str) -> dict:

    if not public_id.strip():
        raise HTTPException(
            status_code=400,
            detail="El public_id es obligatorio."
        )
    
    return delete_image_from_cloud(public_id)     

