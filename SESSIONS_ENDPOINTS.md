# Sessions Controller Endpoints

## Endpoints Disponibles

### 1. Gestión de Sesiones CRUD

#### Obtener todas las sesiones

- **GET** `/sessions`
- **Descripción**: Obtiene todas las sesiones de la base de datos
- **Use Case**: `SessionsGetAll`
- **Respuesta**: Lista de sesiones

#### Obtener sesión por ID

- **GET** `/sessions/:sessionId`
- **Descripción**: Obtiene una sesión específica por su ID
- **Use Case**: `SessionsGetOneById`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Datos de la sesión

#### Obtener sesión por teléfono

- **GET** `/sessions/phone/:phone`
- **Descripción**: Obtiene una sesión específica por número de teléfono
- **Use Case**: `SessionsGetOneByPhone`
- **Parámetros**: `phone` (string)
- **Respuesta**: Datos de la sesión

#### Obtener sesiones por estado

- **GET** `/sessions/status/:status`
- **Descripción**: Obtiene sesiones filtradas por estado (true/false)
- **Use Case**: `SessionsGetByStatus`
- **Parámetros**: `status` (string: "true" o "false")
- **Respuesta**: Lista de sesiones con el estado especificado

### 1.1. Endpoints de Consulta Avanzada

#### Filtrar sesiones por teléfono

- **GET** `/sessions/filter/phone?phone=X`
- **Descripción**: Obtiene todas las sesiones asociadas a un número de teléfono específico
- **Use Case**: `SessionsGetByPhone`
- **Query Parameters**: `phone` (required)
- **Respuesta**: Lista de sesiones con el teléfono especificado

#### Filtrar sesiones por estado

- **GET** `/sessions/filter/status?status=true/false`
- **Descripción**: Obtiene sesiones filtradas por su estado de actividad
- **Use Case**: `SessionsGetByStatus`
- **Query Parameters**: `status` (required: "true" o "false")
- **Respuesta**: Lista de sesiones con el estado especificado

#### Filtrar sesiones por estado de eliminación

- **GET** `/sessions/filter/deleted?is_deleted=true/false`
- **Descripción**: Obtiene sesiones basadas en su estado de eliminación (soft delete)
- **Use Case**: `SessionsGetByIsDeleted`
- **Query Parameters**: `is_deleted` (required: "true" o "false")
- **Respuesta**: Lista de sesiones según estado de eliminación

#### Filtrar sesiones por rango de fecha de creación

- **GET** `/sessions/filter/created-at?start_date=X&end_date=Y`
- **Descripción**: Obtiene sesiones creadas dentro de un rango de fechas específico
- **Use Case**: `SessionsGetByDateRange.runByCreatedAt`
- **Query Parameters**:
  - `start_date` (required): Fecha inicio en formato ISO
  - `end_date` (required): Fecha fin en formato ISO
- **Respuesta**: Lista de sesiones creadas en el rango especificado

#### Filtrar sesiones por rango de fecha de actualización

- **GET** `/sessions/filter/updated-at?start_date=X&end_date=Y`
- **Descripción**: Obtiene sesiones actualizadas dentro de un rango de fechas específico
- **Use Case**: `SessionsGetByDateRange.runByUpdatedAt`
- **Query Parameters**:
  - `start_date` (required): Fecha inicio en formato ISO
  - `end_date` (required): Fecha fin en formato ISO
- **Respuesta**: Lista de sesiones actualizadas en el rango especificado

#### Crear nueva sesión

- **POST** `/sessions/create`
- **Descripción**: Crea una nueva sesión e inicia WhatsApp automáticamente
- **Use Case**: `SessionsCreate` + `WhatsAppSessionManager.startSession`
- **Body**:
  ```json
  {
    "session_name": "string",
    "phone": "string"
  }
  ```
- **Respuesta**: ID de sesión creada y estado de inicio de WhatsApp

#### Actualizar sesión

- **PUT** `/sessions/:sessionId`
- **Descripción**: Actualiza los datos de una sesión existente
- **Use Case**: `SessionsUpdate`
- **Parámetros**: `sessionId` (string)
- **Body** (opcional):
  ```json
  {
    "session_name": "string",
    "phone": "string",
    "status": boolean
  }
  ```
- **Respuesta**: Datos de la sesión actualizada

#### Eliminar sesión (Soft Delete)

- **DELETE** `/sessions/:sessionId`
- **Descripción**: Elimina lógicamente una sesión (soft delete)
- **Use Case**: `SessionsDelete`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Confirmación de eliminación

#### Eliminar sesión permanentemente (Hard Delete)

- **DELETE** `/sessions/:sessionId/hard`
- **Descripción**: Elimina permanentemente una sesión de la base de datos
- **Use Case**: `SessionsHardDelete`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Confirmación de eliminación permanente

### 2. Gestión de WhatsApp

#### Iniciar sesión de WhatsApp

- **POST** `/sessions/:sessionId/start`
- **Descripción**: Inicia una sesión de WhatsApp (genera QR si es necesario)
- **Use Case**: `WhatsAppSessionManager.startSession`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Confirmación de inicio (con instrucciones de QR)
- **Nota**: Actualiza `updatedAt` automáticamente

#### Reanudar sesión de WhatsApp

- **POST** `/sessions/:sessionId/resume`
- **Descripción**: Reanuda una sesión de WhatsApp pausada
- **Use Case**: `WhatsAppSessionManager.resumeSession`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Confirmación de reanudación

#### Reiniciar sesión de WhatsApp

- **POST** `/sessions/:sessionId/restart`
- **Descripción**: Reinicia completamente una sesión de WhatsApp (regenera QR)
- **Use Case**: `WhatsAppSessionManager.recreateSession`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Confirmación de reinicio
- **Nota**: Actualiza `updatedAt` automáticamente

#### Pausar/Detener sesión de WhatsApp

- **POST** `/sessions/:sessionId/pause`
- **Descripción**: Pausa/detiene una sesión de WhatsApp activa
- **Use Case**: `WhatsAppSessionManager.stopSession`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Confirmación de pausa

#### Eliminar sesión de WhatsApp

- **DELETE** `/sessions/:sessionId/delete`
- **Descripción**: Elimina completamente una sesión de WhatsApp y sus datos
- **Use Case**: `WhatsAppSessionManager.deleteSession`
- **Parámetros**: `sessionId` (string)
- **Respuesta**: Confirmación de eliminación

### 3. Gestión de QR Codes

#### Obtener código QR (texto)

- **GET** `/sessions/:sessionId/qr`
- **Descripción**: Obtiene el código QR en formato texto para escanear
- **Use Case**: `WhatsAppSessionManager.getSessionQR`
- **Parámetros**: `sessionId` (string)
- **Respuesta**:
  ```json
  {
    "success": true,
    "message": "string",
    "qrCode": "string | null"
  }
  ```

#### Obtener código QR como imagen

- **GET** `/sessions/:sessionId/qr/image`
- **Descripción**: Obtiene el código QR como imagen en Base64
- **Use Case**: `WhatsAppSessionManager.getSessionQRAsBase64`
- **Parámetros**: `sessionId` (string)
- **Respuesta**:
  ```json
  {
    "success": true,
    "message": "string",
    "qrImage": "string | null"
  }
  ```

## Funcionalidades Implementadas

### ✅ Campos excluidos en respuestas GET

- Los campos `isDeleted` y `deletedAt` no se incluyen en las respuestas de los endpoints GET
- Solo se muestran en operaciones internas para lógica de soft delete

### ✅ Actualización automática de `updatedAt`

- Los endpoints que generan QR codes (`start` y `restart`) actualizan automáticamente el campo `updatedAt`
- Utiliza el use case `SessionsUpdate` para mantener registro de cuándo se usan los códigos QR

### ✅ Arquitectura Hexagonal

- Separación clara entre controladores, use cases y repositorios
- Inyección de dependencias correctamente configurada
- Principios SOLID aplicados

### ✅ Gestión de Errores

- Manejo de excepciones con mensajes descriptivos
- Códigos de estado HTTP apropiados
- Validaciones de existencia de sesiones

### ✅ Flexibilidad de Eliminación

- Soft delete para mantener historial
- Hard delete para limpieza permanente
- Validaciones antes de eliminar

## Use Cases Utilizados

1. **SessionsCreate** - Crear sesiones
2. **SessionsGetAll** - Obtener todas las sesiones
3. **SessionsGetOneById** - Obtener sesión por ID
4. **SessionsGetOneByPhone** - Obtener sesión por teléfono
5. **SessionsGetByStatus** - Obtener sesiones por estado
6. **SessionsGetByPhone** - Filtrar sesiones por teléfono (query)
7. **SessionsGetByIsDeleted** - Filtrar sesiones por estado de eliminación
8. **SessionsGetByDateRange** - Filtrar sesiones por rangos de fecha
9. **SessionsUpdate** - Actualizar sesiones (incluye updatedAt para QR)
10. **SessionsDelete** - Eliminación lógica (soft delete)
11. **SessionsHardDelete** - Eliminación física (hard delete)
12. **WhatsAppSessionManager** - Gestión completa de sesiones WhatsApp

## Notas Técnicas

- Todos los endpoints incluyen manejo de errores apropiado
- Las respuestas siguen un formato consistente con `success`, `message` y `data`
- Los QR codes se actualizan automáticamente cuando se generan nuevos códigos
- La arquitectura permite fácil extensión de funcionalidades
