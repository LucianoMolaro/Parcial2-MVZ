
import uuid

from fastapi import APIRouter, WebSocket

from app.core.WsManager import WsEvent, ws_manager
from app.modules import Rol


router = APIRouter(prefix="/ws")

@router.websocket("/prueba")
async def websocket_prueba(websocket: WebSocket):

    client_id = str(uuid.uuid4())

    await ws_manager.connect(websocket, client_id)

    try:
        await ws_manager.listen(client_id)
    finally:
        await ws_manager.disconnect(client_id)



@router.get("/mensaje", status_code=200)
async def prueba():
    rol = Rol("codigo", "nombre", "decripcion")
    await ws_manager.send_to_all(
    WsEvent(
        event_type="hola",
        data=rol
    )
)
    return {"ok": True}