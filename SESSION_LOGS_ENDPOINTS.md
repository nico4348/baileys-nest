# SessionLogs API Endpoints Documentation

## Overview

Esta API proporciona endpoints para gestionar y consultar los logs de sesiones del sistema Baileys WhatsApp. Los logs registran eventos importantes del ciclo de vida de las sesiones, incluyendo conexiones, autenticación, mensajes y errores.

## Base URL

```
http://localhost:3000/session-logs
```

## Endpoints

### 1. Obtener todos los logs de sesión

**GET** `/session-logs`

Obtiene todos los logs de sesión almacenados en el sistema.

**Response:**

```json
[
  {
    "id": "uuid-string",
    "sessionId": "session-uuid",
    "logType": "SESSION_START",
    "message": "Session started",
    "createdAt": "2025-05-27T12:00:00.000Z"
  }
]
```

**Status Codes:**

- `200` - Success
- `500` - Internal Server Error

---

### 2. Obtener logs recientes

**GET** `/session-logs/recent`

Obtiene los logs más recientes, limitados por el parámetro `limit`.

**Query Parameters:**

- `limit` (optional): Número máximo de logs a retornar (default: 100)

**Example:**

```
GET /session-logs/recent?limit=50
```

**Response:**

```json
[
  {
    "id": "uuid-string",
    "sessionId": "session-uuid",
    "logType": "CONNECTION",
    "message": "Session connected",
    "createdAt": "2025-05-27T12:00:00.000Z"
  }
]
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (invalid limit parameter)

---

### 3. Obtener logs por ID de sesión

**GET** `/session-logs/session/{sessionId}`

Obtiene todos los logs asociados a una sesión específica.

**Path Parameters:**

- `sessionId` (required): ID único de la sesión

**Example:**

```
GET /session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0
```

**Response:**

```json
[
  {
    "id": "log-uuid-1",
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "logType": "SESSION_START",
    "message": "Session started",
    "createdAt": "2025-05-27T12:00:00.000Z"
  },
  {
    "id": "log-uuid-2",
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "logType": "CONNECTION",
    "message": "Session connected",
    "createdAt": "2025-05-27T12:01:00.000Z"
  }
]
```

**Status Codes:**

- `200` - Success
- `500` - Internal Server Error

---

### 4. Obtener logs por sesión y tipo

**GET** `/session-logs/session/{sessionId}/type/{logType}`

Obtiene logs específicos de una sesión filtrados por tipo de log.

**Path Parameters:**

- `sessionId` (required): ID único de la sesión
- `logType` (required): Tipo de log a filtrar

**Log Types disponibles:**

- `CONNECTION` - Eventos de conexión
- `DISCONNECTION` - Eventos de desconexión
- `QR_GENERATED` - Generación de códigos QR
- `AUTH_SUCCESS` - Autenticación exitosa
- `AUTH_FAILURE` - Fallos de autenticación
- `ERROR` - Errores
- `WARNING` - Advertencias
- `INFO` - Información general
- `SESSION_START` - Inicio de sesión
- `SESSION_STOP` - Parada de sesión
- `SESSION_PAUSE` - Pausa de sesión
- `SESSION_RESUME` - Reanudación de sesión
- `RECONNECTION` - Reconexión
- `MESSAGE_SENT` - Mensaje enviado
- `MESSAGE_RECEIVED` - Mensaje recibido
- `MESSAGE_FAILED` - Mensaje fallido

**Example:**

```
GET /session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0/type/ERROR
```

**Response:**

```json
[
  {
    "id": "log-uuid",
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "logType": "ERROR",
    "message": "Connection error occurred",
    "createdAt": "2025-05-27T12:05:00.000Z"
  }
]
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (invalid logType)

---

### 5. Obtener log por ID

**GET** `/session-logs/{id}`

Obtiene un log específico por su ID único.

**Path Parameters:**

- `id` (required): ID único del log

**Example:**

```
GET /session-logs/log-uuid-123
```

**Response:**

```json
{
  "id": "log-uuid-123",
  "sessionId": "session-uuid",
  "logType": "AUTH_SUCCESS",
  "message": "Authentication successful",
  "createdAt": "2025-05-27T12:00:00.000Z"
}
```

**Status Codes:**

- `200` - Success
- `404` - Not Found (log doesn't exist)
- `500` - Internal Server Error

---

### 6. Eliminar log por ID

**DELETE** `/session-logs/{id}`

Elimina un log específico por su ID.

**Path Parameters:**

- `id` (required): ID único del log a eliminar

**Example:**

```
DELETE /session-logs/log-uuid-123
```

**Response:**

```json
{
  "message": "Session log log-uuid-123 deleted successfully"
}
```

**Status Codes:**

- `200` - Success
- `500` - Internal Server Error

---

### 7. Eliminar logs por ID de sesión

**DELETE** `/session-logs/session/{sessionId}`

Elimina todos los logs asociados a una sesión específica.

**Path Parameters:**

- `sessionId` (required): ID único de la sesión

**Example:**

```
DELETE /session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0
```

**Response:**

```json
{
  "message": "All session logs for session 30ed47f1-eb16-4573-8696-4546ab37dce0 deleted successfully"
}
```

**Status Codes:**

- `200` - Success
- `500` - Internal Server Error

---

### 8. Limpiar logs antiguos

**DELETE** `/session-logs/cleanup/old`

Elimina logs antiguos del sistema basado en la antigüedad especificada.

**Query Parameters:**

- `days` (optional): Número de días de antigüedad para considerar logs como antiguos (default: 30)

**Example:**

```
DELETE /session-logs/cleanup/old?days=7
```

**Response:**

```json
{
  "message": "Cleanup completed successfully",
  "deletedCount": 150
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (invalid days parameter)

---

## Error Responses

Todos los endpoints pueden retornar los siguientes errores:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Failed to get recent session logs: Invalid limit parameter",
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Session log with id log-uuid-123 not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Failed to get session logs: Database connection error",
  "error": "Internal Server Error"
}
```

---

## Ejemplos de Uso

### Monitorear logs de una sesión específica

```bash
# Obtener todos los logs de una sesión
curl -X GET "http://localhost:3000/session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0"

# Obtener solo errores de esa sesión
curl -X GET "http://localhost:3000/session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0/type/ERROR"
```

### Obtener logs recientes para debugging

```bash
# Últimos 20 logs
curl -X GET "http://localhost:3000/session-logs/recent?limit=20"
```

### Limpiar logs antiguos

```bash
# Eliminar logs de más de 7 días
curl -X DELETE "http://localhost:3000/session-logs/cleanup/old?days=7"
```

### Eliminar todos los logs de una sesión

```bash
# Útil al eliminar una sesión completamente
curl -X DELETE "http://localhost:3000/session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0"
```

---

## Tipos de Logs y su Significado

| Tipo               | Descripción            | Cuándo se genera                   |
| ------------------ | ---------------------- | ---------------------------------- |
| `SESSION_START`    | Inicio de sesión       | Al crear/iniciar una nueva sesión  |
| `SESSION_STOP`     | Fin de sesión          | Al detener una sesión activa       |
| `SESSION_PAUSE`    | Pausa de sesión        | Al pausar temporalmente una sesión |
| `SESSION_RESUME`   | Reanudación            | Al reanudar una sesión pausada     |
| `CONNECTION`       | Conexión establecida   | Cuando se conecta a WhatsApp       |
| `DISCONNECTION`    | Conexión perdida       | Cuando se pierde la conexión       |
| `RECONNECTION`     | Reconexión             | Al intentar reconectar             |
| `QR_GENERATED`     | QR generado            | Nuevo código QR disponible         |
| `AUTH_SUCCESS`     | Autenticación exitosa  | Login exitoso                      |
| `AUTH_FAILURE`     | Fallo de autenticación | Error en login                     |
| `MESSAGE_SENT`     | Mensaje enviado        | Mensaje enviado exitosamente       |
| `MESSAGE_RECEIVED` | Mensaje recibido       | Nuevo mensaje recibido             |
| `MESSAGE_FAILED`   | Mensaje fallido        | Error al enviar mensaje            |
| `ERROR`            | Error general          | Cualquier error no específico      |
| `WARNING`          | Advertencia            | Situaciones que requieren atención |
| `INFO`             | Información            | Eventos informativos generales     |

---

## Integración con Sessions

Los SessionLogs están completamente integrados con el módulo Sessions. Cuando ocurren eventos en las sesiones (inicio, parada, conexión, etc.), automáticamente se generan logs correspondientes que pueden ser consultados a través de esta API.

---

## Consideraciones de Rendimiento

- Los logs se almacenan en base de datos y pueden crecer rápidamente
- Se recomienda usar el endpoint de limpieza (`/cleanup/old`) regularmente
- Para consultas de logs masivos, considerar usar paginación
- Los logs más recientes tienen mejor rendimiento de consulta
