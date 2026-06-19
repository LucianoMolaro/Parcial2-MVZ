"""
WebSocket Manager para FastAPI
Gestiona conexiones, eventos y comunicación en tiempo real entre servidor y clientes
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, Callable, Any, List
import json
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class WsEvent:
    """Modelo para eventos de WebSocket"""
    
    def __init__(self, event_type: str, data: Any = None, sender_id: str = None):
        self.event_type = event_type
        self.data = data
        self.sender_id = sender_id
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> Dict:
        """Convierte el evento a diccionario"""
        return {
            "event_type": self.event_type,
            "data": self.data,
            "sender_id": self.sender_id,
            "timestamp": self.timestamp
        }
    
    def to_json(self) -> str:
        """Convierte el evento a JSON"""
        return json.dumps(self.to_dict())


class WsConnection:
    """Representa una conexión WebSocket individual"""
    
    def __init__(self, websocket: WebSocket, client_id: str):
        self.websocket = websocket
        self.client_id = client_id
        self.rooms: Set[str] = set()
        self.connected = False
        self.metadata: Dict = {}
    
    async def send(self, event: WsEvent):
        """Envía un evento al cliente"""
        try:
            await self.websocket.send_text(event.to_json())
        except Exception as e:
            logger.error(f"Error enviando mensaje a {self.client_id}: {str(e)}")
    
    async def receive_text(self) -> str:
        """Recibe texto del cliente"""
        return await self.websocket.receive_text()
    
    def join_room(self, room: str):
        """Agrega el cliente a una sala"""
        self.rooms.add(room)
    
    def leave_room(self, room: str):
        """Remueve el cliente de una sala"""
        self.rooms.discard(room)
    
    def leave_all_rooms(self):
        """Remueve el cliente de todas las salas"""
        self.rooms.clear()


class WsManager:
    """
    Gestor principal de WebSockets
    Maneja conexiones, eventos y comunicación entre clientes
    """
    
    def __init__(self):
        self.active_connections: Dict[str, WsConnection] = {}
        self.rooms: Dict[str, Set[str]] = {}  # room_name -> set of client_ids
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.connection_handlers: List[Callable] = []
        self.disconnection_handlers: List[Callable] = []
    
    # ==================== Gestión de Conexiones ====================
    
    async def connect(self, websocket: WebSocket, client_id: str) -> WsConnection:
        """Registra una nueva conexión WebSocket"""
        try:
            await websocket.accept()
            connection = WsConnection(websocket, client_id)
            connection.connected = True
            self.active_connections[client_id] = connection
            
            logger.info(f"Cliente conectado: {client_id}")
            
            # Ejecutar handlers de conexión
            for handler in self.connection_handlers:
                await handler(client_id, connection.metadata)
            
            return connection
        except Exception as e:
            logger.error(f"Error conectando cliente {client_id}: {str(e)}")
            raise
    
    async def disconnect(self, client_id: str):
        """Desconecta un cliente"""
        if client_id in self.active_connections:
            connection = self.active_connections[client_id]
            connection.connected = False
            
            # Remover de todas las salas
            for room in list(connection.rooms):
                await self.leave_room(client_id, room)
            
            del self.active_connections[client_id]
            logger.info(f"Cliente desconectado: {client_id}")
            
            # Ejecutar handlers de desconexión
            for handler in self.disconnection_handlers:
                await handler(client_id)
    
    def get_connection(self, client_id: str) -> WsConnection:
        """Obtiene una conexión por ID de cliente"""
        return self.active_connections.get(client_id)
    
    def get_all_connections(self) -> List[str]:
        """Obtiene lista de IDs de todos los clientes conectados"""
        return list(self.active_connections.keys())
    
    def get_connection_count(self) -> int:
        """Obtiene el número total de conexiones activas"""
        return len(self.active_connections)
    
    # ==================== Gestión de Salas ====================
    
    async def join_room(self, client_id: str, room: str):
        """Agrega un cliente a una sala"""
        if client_id not in self.active_connections:
            return False
        
        if room not in self.rooms:
            self.rooms[room] = set()
        
        self.rooms[room].add(client_id)
        self.active_connections[client_id].join_room(room)
        logger.info(f"Cliente {client_id} unido a sala: {room}")
        return True
    
    async def leave_room(self, client_id: str, room: str):
        """Remueve un cliente de una sala"""
        if room in self.rooms:
            self.rooms[room].discard(client_id)
            if not self.rooms[room]:
                del self.rooms[room]
        
        if client_id in self.active_connections:
            self.active_connections[client_id].leave_room(room)
            logger.info(f"Cliente {client_id} salió de sala: {room}")
    
    def get_room_clients(self, room: str) -> List[str]:
        """Obtiene lista de clientes en una sala"""
        return list(self.rooms.get(room, set()))
    
    def get_client_rooms(self, client_id: str) -> Set[str]:
        """Obtiene las salas a las que pertenece un cliente"""
        if client_id in self.active_connections:
            return self.active_connections[client_id].rooms
        return set()
    
    # ==================== Envío de Eventos ====================
    
    async def send_to_client(self, client_id: str, event: WsEvent):
        """Envía un evento a un cliente específico"""
        connection = self.get_connection(client_id)
        if connection and connection.connected:
            await connection.send(event)
    
    async def send_to_room(self, room: str, event: WsEvent, exclude_sender: bool = False):
        """Envía un evento a todos los clientes en una sala"""
        clients = self.get_room_clients(room)
        for client_id in clients:
            if exclude_sender and client_id == event.sender_id:
                continue
            await self.send_to_client(client_id, event)
    
    async def send_to_all(self, event: WsEvent, exclude_sender: bool = False):
        """Envía un evento a todos los clientes conectados"""
        for client_id in list(self.active_connections.keys()):
            if exclude_sender and client_id == event.sender_id:
                continue
            await self.send_to_client(client_id, event)
    
    async def send_to_multiple(self, client_ids: List[str], event: WsEvent):
        """Envía un evento a múltiples clientes específicos"""
        for client_id in client_ids:
            await self.send_to_client(client_id, event)
    
    # ==================== Gestión de Handlers ====================
    
    def on_event(self, event_type: str, handler: Callable):
        """Registra un handler para un tipo de evento específico"""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler)
    
    def on_connection(self, handler: Callable):
        """Registra un handler para cuando un cliente se conecta"""
        self.connection_handlers.append(handler)
    
    def on_disconnection(self, handler: Callable):
        """Registra un handler para cuando un cliente se desconecta"""
        self.disconnection_handlers.append(handler)
    
    async def handle_event(self, client_id: str, event: WsEvent):
        """Ejecuta los handlers registrados para un evento"""
        handlers = self.event_handlers.get(event.event_type, [])
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(client_id, event)
                else:
                    handler(client_id, event)
            except Exception as e:
                logger.error(f"Error ejecutando handler para {event.event_type}: {str(e)}")
    
    # ==================== Procesamiento de Mensajes ====================
    
    async def process_message(self, client_id: str, message: str) -> WsEvent:
        """Procesa un mensaje recibido del cliente"""
        try:
            data = json.loads(message)
            event = WsEvent(
                event_type=data.get("event_type"),
                data=data.get("data"),
                sender_id=client_id
            )
            return event
        except json.JSONDecodeError:
            logger.error(f"Error decodificando mensaje de {client_id}")
            return None
    
    # ==================== Listener Principal ====================
    
    async def listen(self, client_id: str):
        """
        Escucha mensajes de un cliente y ejecuta los handlers apropiados
        Debe ejecutarse en un loop asyncio para cada cliente
        """
        connection = self.get_connection(client_id)
        if not connection:
            return
        
        try:
            while connection.connected:
                try:
                    message = await connection.receive_text()
                    event = await self.process_message(client_id, message)
                    
                    if event:
                        await self.handle_event(client_id, event)
                
                except WebSocketDisconnect:
                    await self.disconnect(client_id)
                    break
                except Exception as e:
                    logger.error(f"Error recibiendo mensaje de {client_id}: {str(e)}")
                    await self.disconnect(client_id)
                    break
        
        finally:
            await self.disconnect(client_id)
    
    # ==================== Utilidades ====================
    
    def get_stats(self) -> Dict:
        """Obtiene estadísticas del gestor de WebSockets"""
        return {
            "total_connections": self.get_connection_count(),
            "total_rooms": len(self.rooms),
            "connected_clients": self.get_all_connections(),
            "rooms_info": {
                room: {
                    "client_count": len(clients),
                    "clients": list(clients)
                }
                for room, clients in self.rooms.items()
            }
        }
    
    async def broadcast_stats(self):
        """Envía estadísticas a todos los clientes"""
        stats = self.get_stats()
        event = WsEvent(
            event_type="server_stats",
            data=stats
        )
        await self.send_to_all(event)


# Instancia global del manager
ws_manager = WsManager()


# ==================== Funciones Helper ====================

async def get_ws_manager() -> WsManager:
    """Dependencia de FastAPI para inyectar el WsManager"""
    return ws_manager
