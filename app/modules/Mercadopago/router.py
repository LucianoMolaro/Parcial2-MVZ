from fastapi import APIRouter, Depends, Form, UploadFile, File, status
from app.core.deps import require_role
from app.modules.Cloudinary import service as cloudinary_service


router = APIRouter(prefix="/webhook", tags=["Uploads"])

@router.post("/mercadopago", status_code=status.HTTP_201_CREATED)
def registrar_pago():
    return

@router.delete("/delete/{public_id}", status_code=status.HTTP_200_OK)
def borrar_imagen(
    public_id: str = Form(...),
    _ = Depends(require_role["ADMIN"]),
):
    cloudinary_service.delete_image(public_id)    
    return {"detail": "Imagen eliminada correctamente."}
