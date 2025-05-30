# 📚 API Endpoints Documentation - WhatsApp Baileys NestJS

## 🚀 Documentación Completa con Ejemplos de Uso

Esta documentación proporciona una guía completa de todos los endpoints disponibles en la API de WhatsApp Baileys NestJS, con ejemplos prácticos de uso.

---

## 📨 MESSAGES - Endpoints de Mensajería

### 1. 🎯 **Envío Unificado de Mensajes** - `POST /messages/send`

**El endpoint principal para enviar todos los tipos de mensajes de WhatsApp.**

#### 📤 Enviar Mensaje de Texto

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "text",
    "textData": {
      "text": "¡Hola! Este es un mensaje de prueba desde la API."
    }
  }'
```

#### 📷 Enviar Imagen con Caption

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "media",
    "mediaData": {
      "url": "https://picsum.photos/800/600.jpg",
      "mediaType": "image",
      "caption": "🌄 ¡Mira esta imagen increíble!",
      "mimeType": "image/jpeg",
      "fileName": "paisaje.jpg"
    }
  }'
```

#### 📄 Enviar Documento PDF

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "media",
    "mediaData": {
      "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      "mediaType": "document",
      "caption": "📄 Documento importante adjunto",
      "mimeType": "application/pdf",
      "fileName": "documento.pdf"
    }
  }'
```

#### 🎵 Enviar Audio

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "media",
    "mediaData": {
      "url": "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      "mediaType": "audio",
      "caption": "🎵 Archivo de audio",
      "mimeType": "audio/mpeg",
      "fileName": "audio.mp3"
    }
  }'
```

#### 🎬 Enviar Video

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "media",
    "mediaData": {
      "url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "mediaType": "video",
      "caption": "🎬 Video de demostración",
      "mimeType": "video/mp4",
      "fileName": "video.mp4"
    }
  }'
```

#### ❤️ Enviar Reacción

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "reaction",
    "reactionData": {
      "emoji": "❤️",
      "targetMessageId": "f7e6df74-ace4-47a4-8fc3-d02951a48ea1"
    }
  }'
```

#### 💬 Enviar Mensaje Citado (Quoted Message)

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "text",
    "textData": {
      "text": "Esta es mi respuesta al mensaje anterior."
    },
    "quotedMessageId": "6a20a6e3-53f1-442f-b278-a1f97caae149"
  }'
```

#### ✅ Respuesta Exitosa del Endpoint

```json
{
  "success": true,
  "messageId": "f7e6df74-ace4-47a4-8fc3-d02951a48ea1",
  "childMessageId": "3EB0F0173CE9DC7BDA8EFD",
  "timestamp": "2025-05-30T16:02:25.134Z",
  "messageType": "text"
}
```

### 2. 📋 **Consultar Mensajes** - `GET /messages`

#### Obtener Todos los Mensajes

```bash
curl -X GET http://localhost:3000/messages
```

#### Filtrar Mensajes por Sesión

```bash
curl -X GET "http://localhost:3000/messages?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"
```

#### Obtener Mensaje Específico

```bash
curl -X GET http://localhost:3000/messages/f7e6df74-ace4-47a4-8fc3-d02951a48ea1
```

---

## 🏢 SESSIONS - Gestión de Sesiones de WhatsApp

### 1. 📊 **Consultar Sesiones**

#### Obtener Todas las Sesiones

```bash
curl -X GET http://localhost:3000/sessions
```

#### Obtener Sesión por ID

```bash
curl -X GET http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0
```

#### Obtener Estado de Sesión

```bash
curl -X GET http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/status
```

#### Buscar Sesión por Teléfono

```bash
curl -X GET http://localhost:3000/sessions/phone/573022949109
```

#### Filtrar Sesiones por Estado

```bash
curl -X GET "http://localhost:3000/sessions/filter/status?status=true"
```

#### Filtrar Sesiones por Teléfono (Query)

```bash
curl -X GET "http://localhost:3000/sessions/filter/phone?phone=573022949109"
```

### 2. 🔧 **Gestión de Sesiones**

#### Crear Nueva Sesión

```bash
curl -X POST http://localhost:3000/sessions/create \
  -H "Content-Type: application/json" \
  -d '{
    "session_name": "Mi Sesión de Prueba",
    "phone": "573022949109"
  }'
```

#### Actualizar Sesión

```bash
curl -X PUT http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0 \
  -H "Content-Type: application/json" \
  -d '{
    "session_name": "Sesión Actualizada",
    "phone": "573022949109",
    "status": true
  }'
```

### 3. 📱 **Control de WhatsApp**

#### Iniciar Sesión de WhatsApp

```bash
curl -X POST http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/start
```

#### Reiniciar Sesión de WhatsApp

```bash
curl -X POST http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/restart
```

#### Pausar Sesión de WhatsApp

```bash
curl -X POST http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/pause
```

#### Reanudar Sesión de WhatsApp

```bash
curl -X POST http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/resume
```

#### Eliminar Sesión de WhatsApp

```bash
curl -X DELETE http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/delete
```

### 4. 📱 **Códigos QR**

#### Obtener QR Code (Texto)

```bash
curl -X GET http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/qr
```

#### Obtener QR Code (Imagen Base64)

```bash
curl -X GET http://localhost:3000/sessions/30ed47f1-eb16-4573-8696-4546ab37dce0/qr/image
```

---

## 💬 TEXT MESSAGES - Mensajes de Texto Específicos

### Consultar Mensajes de Texto

#### Obtener Todos los Mensajes de Texto

```bash
curl -X GET http://localhost:3000/text-messages
```

#### Filtrar por ID de Mensaje

```bash
curl -X GET "http://localhost:3000/text-messages?message_id=f7e6df74-ace4-47a4-8fc3-d02951a48ea1"
```

#### Filtrar por Sesión

```bash
curl -X GET "http://localhost:3000/text-messages?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"
```

#### Obtener Mensaje de Texto Específico

```bash
curl -X GET http://localhost:3000/text-messages/abc123-def456-ghi789
```

---

## 🎬 MEDIA MESSAGES - Mensajes Multimedia

### Consultar Mensajes de Media

#### Obtener Todos los Mensajes de Media

```bash
curl -X GET http://localhost:3000/media-messages
```

#### Filtrar por Tipo de Media

```bash
curl -X GET "http://localhost:3000/media-messages?media_type=image"
```

#### Filtrar por Sesión

```bash
curl -X GET "http://localhost:3000/media-messages?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"
```

#### Obtener Mensaje de Media Específico

```bash
curl -X GET http://localhost:3000/media-messages/xyz789-abc123-def456
```

#### Descargar Media

```bash
curl -X POST http://localhost:3000/media-messages/xyz789-abc123-def456/download
```

---

## ⚡ REACTION MESSAGES - Reacciones

### Consultar Reacciones

#### Obtener Todas las Reacciones

```bash
curl -X GET http://localhost:3000/reaction-messages
```

#### Filtrar por Emoji

```bash
curl -X GET "http://localhost:3000/reaction-messages?emoji=❤️"
```

#### Filtrar por Mensaje Objetivo

```bash
curl -X GET "http://localhost:3000/reaction-messages?target_message_id=f7e6df74-ace4-47a4-8fc3-d02951a48ea1"
```

#### Filtrar por Sesión

```bash
curl -X GET "http://localhost:3000/reaction-messages?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"
```

---

## 📊 EVENT LOGS - Registros de Eventos

### Consultar Eventos

#### Obtener Todos los Eventos

```bash
curl -X GET http://localhost:3000/event-logs
```

#### Filtrar por Sesión

```bash
curl -X GET "http://localhost:3000/event-logs?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"
```

#### Filtrar por Tipo de Evento

```bash
curl -X GET "http://localhost:3000/event-logs?event_id=connection_update"
```

#### Obtener Eventos Recientes

```bash
curl -X GET "http://localhost:3000/event-logs/recent?limit=50"
```

---

## 🗂️ SESSION LOGS - Registros de Sesión

### Consultar Logs de Sesión

#### Obtener Todos los Logs

```bash
curl -X GET http://localhost:3000/session-logs
```

#### Obtener Logs Recientes

```bash
curl -X GET "http://localhost:3000/session-logs/recent?limit=100"
```

#### Filtrar por Sesión

```bash
curl -X GET http://localhost:3000/session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0
```

#### Filtrar por Sesión y Tipo

```bash
curl -X GET "http://localhost:3000/session-logs/session/30ed47f1-eb16-4573-8696-4546ab37dce0/type/connection"
```

---

## 🔄 EVENTS - Gestión de Eventos

### Consultar Tipos de Eventos

#### Obtener Todos los Tipos de Eventos

```bash
curl -X GET http://localhost:3000/events
```

#### Crear Nuevo Tipo de Evento

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "custom_event",
    "description": "Evento personalizado para mi aplicación"
  }'
```

---

## 🧪 EJEMPLOS DE USO PRÁCTICO

### 📱 **Flujo Completo: Crear Sesión y Enviar Mensaje**

```bash
# 1. Crear nueva sesión
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/sessions/create \
  -H "Content-Type: application/json" \
  -d '{
    "session_name": "Sesión API Test",
    "phone": "573022949109"
  }')

# 2. Extraer sessionId de la respuesta
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.sessionId')

# 3. Obtener QR code para escanear
curl -X GET "http://localhost:3000/sessions/$SESSION_ID/qr"

# 4. Verificar estado de conexión
curl -X GET "http://localhost:3000/sessions/$SESSION_ID/status"

# 5. Enviar mensaje de texto
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"to\": \"573022949109\",
    \"messageType\": \"text\",
    \"textData\": {
      \"text\": \"¡Hola! Mensaje enviado desde la API automatizada.\"
    }
  }"
```

### 🔄 **Workflow de Reacciones y Quoted Messages**

```bash
# 1. Enviar mensaje inicial
INITIAL_MSG=$(curl -s -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "30ed47f1-eb16-4573-8696-4546ab37dce0",
    "to": "573022949109",
    "messageType": "text",
    "textData": {
      "text": "Este es el mensaje inicial para reaccionar."
    }
  }')

# 2. Extraer messageId
MESSAGE_ID=$(echo $INITIAL_MSG | jq -r '.messageId')

# 3. Enviar reacción al mensaje
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"30ed47f1-eb16-4573-8696-4546ab37dce0\",
    \"to\": \"573022949109\",
    \"messageType\": \"reaction\",
    \"reactionData\": {
      \"emoji\": \"❤️\",
      \"targetMessageId\": \"$MESSAGE_ID\"
    }
  }"

# 4. Enviar mensaje citado
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"30ed47f1-eb16-4573-8696-4546ab37dce0\",
    \"to\": \"573022949109\",
    \"messageType\": \"text\",
    \"textData\": {
      \"text\": \"Esta es mi respuesta al mensaje anterior.\"
    },
    \"quotedMessageId\": \"$MESSAGE_ID\"
  }"
```

### 📊 **Monitoreo y Análisis**

```bash
# Obtener estadísticas de mensajes por sesión
curl -X GET "http://localhost:3000/messages?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"

# Obtener mensajes de texto específicos
curl -X GET "http://localhost:3000/text-messages?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"

# Obtener todas las reacciones de una sesión
curl -X GET "http://localhost:3000/reaction-messages?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"

# Obtener logs recientes para debugging
curl -X GET "http://localhost:3000/session-logs/recent?limit=50"

# Obtener eventos de una sesión específica
curl -X GET "http://localhost:3000/event-logs?session_id=30ed47f1-eb16-4573-8696-4546ab37dce0"
```

---

## ⚠️ MANEJO DE ERRORES COMUNES

### Errores de Sesión

```json
{
  "success": false,
  "messageId": "",
  "timestamp": "2025-05-30T16:03:18.663Z",
  "messageType": "text",
  "error": "Session invalid-session-id not found or not connected"
}
```

### Errores de Media

```json
{
  "success": false,
  "messageId": "",
  "timestamp": "2025-05-30T16:02:32.353Z",
  "messageType": "media",
  "error": "getaddrinfo ENOTFOUND invalid-url.com"
}
```

### Errores de Validación

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "sessionId should not be empty",
    "to should not be empty",
    "messageType must be one of: text, media, reaction"
  ]
}
```

---

## 🔧 CONFIGURACIÓN Y NOTAS TÉCNICAS

### Base URL

```
http://localhost:3000
```

### Headers Requeridos

```http
Content-Type: application/json
```

### Formatos de Datos

- **Session ID**: UUID v4 format
- **Phone Numbers**: Solo dígitos (ej: `573022949109`)
- **Timestamps**: ISO 8601 format
- **File URLs**: URLs públicas accesibles

### Tipos de Media Soportados

- **Imágenes**: JPG, PNG, GIF, WEBP
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3, WAV, OGG, AAC
- **Documentos**: PDF, DOC, DOCX, TXT, XLS, etc.

### Rate Limiting

- Se recomienda un delay de **3 segundos** entre envíos
- Para testing masivo, usar delays apropiados

---

## 📚 RECURSOS ADICIONALES

### Scripts de Testing

- `test-messages-quick.js` - Tests rápidos básicos
- `test-messages-complete.js` - Suite completa de tests
- `test-uuid-workflow.js` - Workflow de UUIDs y quoted messages

### Documentación Técnica

- `IMPLEMENTATION_SUMMARY.md` - Resumen de implementación
- `MESSAGES_SEND_ENDPOINT_DOCS.md` - Documentación detallada del endpoint de envío
- `SESSIONS_ENDPOINTS.md` - Documentación de endpoints de sesiones

### Archivos de Configuración

- `src/lib/Messages/README.md` - Documentación del módulo de mensajes
- `src/lib/Sessions/sessions.controller.ts` - Controlador de sesiones
- `src/lib/Messages/messages.controller.ts` - Controlador de mensajes

---

> **💡 Tip**: Para automatización y scripting, todos los endpoints siguen patrones consistentes de respuesta con campos `success`, `message` y `data`. Esto facilita la integración y el manejo de errores programático.

---

**🚀 Happy Coding! Esta API te permite integrar fácilmente WhatsApp en tus aplicaciones con un diseño robusto y escalable.**
