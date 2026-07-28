
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.WsManager import WsEvent, ws_manager
from app.modules import Rol


router = APIRouter(prefix="/ws")

@router.websocket("/conectar")
async def websocket_endpoint(websocket: WebSocket):
    client_id = "1234"
    await ws_manager.connect(websocket, client_id)
    print("WS conectado")
    try:
        await websocket.receive()
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)
        print("WS desconectado")




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