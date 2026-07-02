# Inventory — Arquitectura

Sistema de gestión de inventario escolar: movimientos, stock, solicitudes, órdenes de compra, y parsing de documentos con IA.

---

## Principios (no negociables)

1. **Simple.** Sin comentarios, sin manejo de errores inventados, sin código que no haga falta. Si lo puedes borrar sin romper nada, bórralo.
2. **Rápido y moderno.** Cursor pagination en todo listado. Feature-based estricto en ambos lados. Zero latencia innecesaria.
3. **Mínimo código.** Front solo con shadcn/ui. CRUDs unitarios y batch con el menor código posible. Sin validaciones que no vengan de un boundary real.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Python 3.12 · FastAPI · SQLAlchemy 2.0 async · Pydantic v2 · Alembic · Poetry |
| Frontend | React 19 · TypeScript strict · Vite · TanStack Query v5 · shadcn/ui · Tailwind |
| IA | FastAPI micro-service · Anthropic SDK (`claude-sonnet-4-6`) |
| Infra | Docker Compose · PostgreSQL 16 + pgvector · Amazon Lightsail · Cloudflare R2 (adjuntos) |

---

## Flujo

```
Browser
  └─ TanStack Query
       └─ shared/api/client.ts  (Axios, baseURL=/api/v1)
            └─ FastAPI  /api/v1/*
                 ├─ router → service → SQLAlchemy async → PostgreSQL
                 └─ (IA) POST http://ai_service:8100/parse → Claude claude-sonnet-4-6 → JSON
```

Servicios locales: frontend `:5173` · backend `:8000` · ai_service `:8100` · postgres `:5432`

---

## Modelo de datos

**AuditMixin** en todas las tablas operacionales: `created_at`, `updated_at`, `created_by_id`, `updated_by_id`.

### Usuarios y organización

| Tabla | Qué es |
|---|---|
| `users` | Auth + auditoría. Roles: `admin` · `storekeeper` · `requester` |
| `warehouses` | Almacenes físicos (enfermería, cocina, mantenimiento…) |
| `departments` | Áreas del colegio que solicitan materiales |

### Catálogo

| Tabla | Qué es |
|---|---|
| `categories` | Jerarquía propia vía self-join (`parent_id`) |
| `products` | SKU único · `min_stock` (punto de reorden) · `eoq` (qty sugerida en OC auto) · `cost_price` (último precio actualizado en cada IN) · `preferred_partner_id` · `image_url` · `supplier_sku` |
| `partners` | Entidad multi-rol: `types TEXT[]` puede contener `proveedor`, `cliente`, `requester` en cualquier combinación · `lead_days` (plazo de entrega) |

### Stock

| Tabla | Qué es |
|---|---|
| `stock` | Par único `(product, warehouse)`. Columna generada `qty_available` |

### Movimientos

| Tabla | Qué es |
|---|---|
| `movements` | Registro inmutable. Tipos: `IN · OUT · TRANSFER · ADJUST`. Fuente: `manual · request · po · ai` |
| `movement_lines` | Una línea por producto dentro de un movimiento · `unit_cost` para trail financiero |
| `movement_favorites` | Templates para despachos recurrentes ("Kit inicio de año"). `lines` en JSONB |

### Solicitudes y órdenes

| Tabla | Qué es |
|---|---|
| `stock_requests` | Solicitud formal de un departamento · `requester_id` FK a `partners` (tipo `requester`) |
| `stock_request_lines` | `qty_requested` · `qty_dispatched` · `is_reserved` |
| `purchase_orders` | OC auto-generada cuando stock < mínimo. Vinculada a `stock_request` y `partner` |
| `po_lines` | `qty_ordered` · `qty_received` · `unit_cost` |

### Finanzas e inteligencia

| Tabla | Qué es |
|---|---|
| `cost_ledger` | Trail financiero append-only. Una fila por `MovementLine` (qty × unit_cost). Nunca se toca |
| `ai_jobs` | Cola async. Input: `text · image · pdf`. Output: `movement · stock_request · po` |
| `reorder_alerts` | Se crea al bajar de `min_stock`. Índice en `is_open=true` para el dashboard |

### Estados

**StockRequest**
```
draft → pending → ready          → done
              ↘ waiting_stock → partial → done
              ↘ cancelled
```

**PurchaseOrder**
```
draft → sent → confirmed → partial → received
     ↘ cancelled
```

---

## Carpetas

```
backend/app/
  core/            database.py · config.py · deps.py · pagination.py
  models/          __init__.py  (todos los modelos)
  features/
    warehouses/    router.py · service.py · schemas.py
    departments/   router.py · service.py · schemas.py
    products/      router.py · service.py · schemas.py
    categories/    router.py · service.py · schemas.py
    partners/      router.py · service.py · schemas.py
    stock/         router.py · service.py · schemas.py
    movements/     router.py · service.py · schemas.py
    favorites/     router.py · service.py · schemas.py
    requests/      router.py · service.py · schemas.py
    orders/        router.py · service.py · schemas.py
    dashboard/     router.py · service.py · schemas.py
    ia/            router.py · service.py · schemas.py
    attachments/   router.py · service.py · schemas.py  (Cloudflare R2)
    agent/         router.py · service.py · schemas.py  (API key auth)
  main.py

frontend/src/
  shared/
    api/           client.ts
    ui/            componentes shadcn re-exportados
    hooks/         useCursorQuery.ts
  features/
    warehouses/    api.ts · hooks/ · components/ · pages/
    products/      api.ts · hooks/ · components/ · pages/
    movements/     api.ts · hooks/ · components/ · pages/
    stock/         api.ts · hooks/ · pages/
    requests/      api.ts · hooks/ · components/ · pages/
    orders/        api.ts · hooks/ · components/ · pages/
    dashboard/     api.ts · hooks/ · components/ · pages/
    ia/            api.ts · hooks/ · pages/
  app/             App.tsx · router.tsx · providers.tsx
```

**Regla:** features no se importan entre sí. Solo desde `app/` o `shared/`.  
**Backend:** `router` orquesta, `service` tiene lógica, acceso a DB solo en `service`.  
**Admin-only sin UI dedicada:** `departments`, `categories`, `partners`, `favorites` se gestionan desde modales genéricos en sus features consumidoras.

---

## Endpoints `/api/v1`

```
GET|POST              /warehouses
GET|PUT|DELETE        /warehouses/{id}

GET|POST              /departments
GET|PUT|DELETE        /departments/{id}

GET|POST              /categories
GET|PUT|DELETE        /categories/{id}

GET|POST              /partners               ?type=proveedor|cliente|requester
GET|PUT|DELETE        /partners/{id}

GET|POST              /products
GET|PUT|DELETE        /products/{id}

GET                   /stock?warehouse_id=
GET                   /stock/low
GET                   /stock/{product_id}/{warehouse_id}

GET                   /movements?cursor=&limit=
POST                  /movements           (unitario)
POST                  /movements/batch     (batch)
GET                   /movements/{id}

GET|POST              /favorites
GET|PUT|DELETE        /favorites/{id}

GET                   /requests?cursor=&limit=
POST                  /requests
GET                   /requests/{id}
PATCH                 /requests/{id}/status

GET                   /orders?cursor=&limit=
POST                  /orders
GET                   /orders/{id}
PATCH                 /orders/{id}/status

GET                   /dashboard/stats

POST                  /ia/ingest
GET                   /ia/jobs/{id}

GET                   /agent/context       (API key)
POST                  /agent/batch         (API key)

POST                  /attachments         (sube a Cloudflare R2)
GET                   /attachments/{id}
DELETE                /attachments/{id}
```

**Paginación:** cursor = `base64(created_at|id)`. Respuesta: `{ items, next_cursor, has_more }`.  
**Errores:** `{ "error": { "code": "...", "message": "..." } }`. Sin stacktraces en prod.

---

## Reglas

- TypeScript `strict: true`, cero `any`.
- Nombres en inglés en código. UI en español.
- Un PR = una feature. Commit: `feat(movements): add batch endpoint`.
- Soft-delete vía `is_active`. Ningún `DELETE` físico en producción.
- `CostLedger` es append-only. Nunca se actualiza ni elimina.

---

## Concurrencia

- Toda mutación de `stock` o `stock_request_lines` corre dentro de una transacción async con `SELECT ... FOR UPDATE` sobre las filas de `stock` involucradas.
- Reserva (`is_reserved`, `qty_reserved`) y despacho son atómicos: o pasa todo o nada.
- `Movement` se inserta al final de la transacción; si falla, el stock vuelve solo.

---

## Auth

- JWT en header `Authorization: Bearer ...`. Sesión stateless, expiración corta + refresh.
- `core/deps.py` expone `current_user` y `require_role("admin" | "storekeeper" | "requester")`.
- `agent/*` usa header `X-API-Key` validado contra tabla `api_keys` (hash, no plaintext).

---

## Adjuntos (Cloudflare R2)

- Backend genera presigned URL · el browser sube directo a R2 · el backend solo guarda metadata en `attachments` (`id`, `key`, `mime`, `size`, `uploaded_by_id`).
- Vinculados a `movements`, `stock_requests`, `purchase_orders` o `ai_jobs` vía `entity_type` + `entity_id`.
- Borrado soft; limpieza física en R2 vía job programado.

---

## Observabilidad

- Logs JSON estructurados (`structlog`) con `request_id`, `user_id`, `feature`.
- Errores no controlados → 500 con `error.code = "internal"` + log completo. Nunca stacktrace al cliente.
- `/health` y `/ready` públicos para el load balancer de Lightsail.

---

## Testing

- `pytest-asyncio` contra Postgres real (no SQLite, no mocks de DB).
- Se testea `service`, no `router`. Un test por camino feliz + un test por borde crítico (concurrencia, estado inválido).
- Frontend: sin tests unitarios. Type-check + build estricto = gate suficiente.

---

## IA (servicio aparte)

- `ai_service` es un FastAPI independiente en `:8100`, sin acceso a la DB del inventario.
- Backend encola en `ai_jobs` (status `pending → running → done | failed`) y llama HTTP al servicio.
- Polling desde el frontend vía `GET /ia/jobs/{id}` cada 2s hasta `done`.

---

## Migraciones

- Alembic. Una migración por PR que toque modelos.
- Nombre: `YYYYMMDD_HHMM_slug.py`. `alembic upgrade head` corre en el deploy de Lightsail.

Cadena actual:
```
78122fb73b5e → c754cdd90c0a → e8b4bc8c096f → 110352272f0d
  → 20260502_0001 (movement_lines.unit_cost)
  → 20260502_0002 (suppliers→partners · types TEXT[] · requester_id en stock_requests)  ← head
```

---

> Cómo correr el proyecto y orden de PRs viven en `README.md` y `ROADMAP.md`.
