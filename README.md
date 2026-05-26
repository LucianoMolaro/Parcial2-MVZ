# Parcial 1 - Programación IV

Aplicación Fullstack con **FastAPI + React** para la gestión de productos, categorías e ingredientes.

## Video de presentación

> [Link al video - agregar acá]

## Tecnologías

- **Backend**: FastAPI, SQLModel, SQLite (sin configuración externa)
- **Frontend**: React, TypeScript, TanStack Query, Tailwind CSS, React Router DOM

## Arquitectura del Backend

El backend sigue el patrón **Unit of Work**:
- `routers/` → solo reciben el request HTTP y devuelven la respuesta
- `services/` → contienen toda la lógica de negocio
- `uow/unit_of_work.py` → maneja la sesión y las transacciones

Cada operación de base de datos ocurre dentro de un `with UnitOfWork() as uow:`, garantizando que si algo falla, todo se revierte automáticamente.

## Cómo levantar el proyecto

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

La API queda en: http://localhost:8000  
Documentación automática: http://localhost:8000/docs  
> La base de datos SQLite (`parcial1.db`) se crea sola al iniciar.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en: http://localhost:5173

## Módulos

- **Categorías**: CRUD completo
- **Ingredientes**: CRUD completo
- **Productos**: CRUD completo con relaciones N:N a Categorías e Ingredientes
- **Detalle de Producto**: Ruta dinámica `/productos/:id`

## Estructura del proyecto

```
parcial1/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── models/
│   │   └── models.py        ← SQLModel (Categoria, Ingrediente, Producto + tablas N:N)
│   ├── schemas/
│   │   └── schemas.py       ← Schemas de entrada/salida separados
│   ├── uow/
│   │   └── unit_of_work.py  ← Patrón Unit of Work
│   ├── services/
│   │   ├── categoria_service.py
│   │   ├── ingrediente_service.py
│   │   └── producto_service.py
│   └── routers/
│       ├── categorias.py
│       ├── ingredientes.py
│       └── productos.py
└── frontend/
    └── src/
        ├── api/api.ts
        ├── components/
        ├── pages/
        └── types.ts
```
