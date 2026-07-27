from fastapi import APIRouter, Depends, Form, UploadFile, File, status
from app.core.deps import require_role
from app.modules.Cloudinary.schema import UploadRead
from app.modules.Cloudinary import service as cloudinary_service

router = APIRouter(prefix="/cloudinary", tags=["Uploads"])

@router.post("/upload", response_model=UploadRead, status_code=status.HTTP_201_CREATED)
def subir_imagen(
    file: UploadFile = File(...),
    folder: str = Form(...),
    # _ = Depends(require_role["ADMIN"]),
):    
    return cloudinary_service.upload_image(file.file.read(), file.content_type, folder)

@router.delete("/delete/{public_id:path}", status_code=status.HTTP_200_OK)
def borrar_imagen(public_id: str):
    cloudinary_service.delete_image(public_id)
    return {"ok": True, "detail": "Imagen eliminada correctamente."}
