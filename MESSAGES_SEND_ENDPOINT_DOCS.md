# 📨 Messages Send Endpoint - Documentación Completa

## 🚀 Endpoint Unificado para Envío de Mensajes de WhatsApp

### **URL del Endpoint:**

```
POST /messages/send
```

---

## 📋 **Descripción General**

El endpoint `/messages/send` es un endpoint unificado que permite enviar todos los tipos de mensajes de WhatsApp a través de una sola interface REST. Soporta mensajes de texto, media (imágenes, videos, documentos, etc.) y reacciones.

### **Características Principales:**

- ✅ **Endpoint Único** - Un solo endpoint para todos los tipos de mensaje
- ✅ **Arquitectura Limpia** - Implementado con principios SOLID y Clean Architecture
- ✅ **Validación Automática** - DTOs con validaciones usando class-validator
- ✅ **Persistencia Completa** - Almacena tanto en tabla padre como tablas hijas
- ✅ **Manejo de Errores** - Respuestas consistentes y manejo robusto de errores
- ✅ **Soporte de Quoted** - Permite responder a mensajes específicos

---

## 🎯 **Tipos de Mensaje Soportados**

### **1. Mensajes de Texto (`text`)**

- Texto simple
- Emojis
- Mensajes largos
- Soporte para quoted messages

### **2. Mensajes de Media (`media`)**

- **`image`** - Imágenes (JPG, PNG, GIF, WEBP)
- **`video`** - Videos (MP4, AVI, MOV, MKV)
- **`audio`** - Audios (MP3, WAV, OGG, M4A)
- **`document`** - Documentos (PDF, DOCX, TXT, etc.)
- **`voiceNote`** - Notas de voz (formato PTT)
- **`sticker`** - Stickers de WhatsApp

### **3. Reacciones (`reaction`)**

- Emojis: ❤️ 👍 👎 😂 😮 😢 🙏 😡 😍 🔥
- Reacciones a mensajes específicos
- Soporte para key de mensaje completo o ID simple

---

## 📡 **Estructura de Request**

### **Headers Requeridos:**

```http
Content-Type: application/json
```

### **Campos Base (Requeridos para todos los tipos):**

```typescript
{
  "sessionId": string,      // ID de la sesión de WhatsApp
  "to": string,            // Número de teléfono destino (sin @s.whatsapp.net)
  "messageType": string,   // "text" | "media" | "reaction"
  "quotedMessageId"?: object // Opcional: mensaje a citar (objeto completo o ID)
}
```

---

## 📝 **Ejemplos de Uso**

### **1. Enviar Mensaje de Texto**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-123",
    "to": "1234567890",
    "messageType": "text",
    "textData": {
      "text": "¡Hola! Este es un mensaje de prueba desde el endpoint unificado."
    }
  }'
```

**Con Quoted Message:**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-123",
    "to": "1234567890",
    "messageType": "text",
    "textData": {
      "text": "Esta es mi respuesta al mensaje anterior"
    },
    "quotedMessageId": {
      "remoteJid": "1234567890@s.whatsapp.net",
      "fromMe": false,
      "id": "mensaje-id-original"
    }
  }'
```

### **2. Enviar Mensaje con Imagen**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-123",
    "to": "1234567890",
    "messageType": "media",
    "mediaData": {
      "url": "https://example.com/imagen.jpg",
      "mediaType": "image",
      "caption": "¡Mira esta imagen increíble!",
      "mimeType": "image/jpeg",
      "fileName": "mi-imagen.jpg"
    }
  }'
```

### **3. Enviar Documento**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-123",
    "to": "1234567890",
    "messageType": "media",
    "mediaData": {
      "url": "https://example.com/documento.pdf",
      "mediaType": "document",
      "caption": "Aquí está el documento solicitado",
      "mimeType": "application/pdf",
      "fileName": "reporte-mensual.pdf"
    }
  }'
```

### **4. Enviar Nota de Voz**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-123",
    "to": "1234567890",
    "messageType": "media",
    "mediaData": {
      "url": "https://example.com/audio.ogg",
      "mediaType": "voiceNote",
      "mimeType": "audio/ogg"
    }
  }'
```

### **5. Enviar Reacción**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-123",
    "to": "1234567890",
    "messageType": "reaction",
    "reactionData": {
      "emoji": "❤️",
      "targetMessageId": "mensaje-objetivo-id"
    }
  }'
```

**Reacción con Key Completo:**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid-123",
    "to": "1234567890",
    "messageType": "reaction",
    "reactionData": {
      "emoji": "👍",
      "targetMessageId": {
        "key": {
          "remoteJid": "1234567890@s.whatsapp.net",
          "fromMe": false,
          "id": "mensaje-objetivo-id"
        }
      }
    }
  }'
```

---

## ✅ **Respuesta Exitosa**

```json
{
  "success": true,
  "messageId": "BAE5F4B0C7E45D89.._1234567890",
  "childMessageId": "uuid-del-registro-hijo",
  "timestamp": "2024-12-30T10:30:45.123Z",
  "messageType": "text"
}
```

### **Campos de Respuesta:**

- **`success`** - Indica si el envío fue exitoso
- **`messageId`** - ID del mensaje en WhatsApp (generado por Baileys)
- **`childMessageId`** - ID del registro hijo en la base de datos
- **`timestamp`** - Fecha y hora del envío
- **`messageType`** - Tipo de mensaje enviado

---

## ❌ **Respuesta de Error**

```json
{
  "success": false,
  "messageId": "",
  "timestamp": "2024-12-30T10:30:45.123Z",
  "messageType": "text",
  "error": "Descripción detallada del error"
}
```

### **Tipos de Error Comunes:**

- **`Session not found`** - Sesión no existe o no está conectada
- **`Invalid phone number`** - Número de teléfono inválido
- **`Text message cannot be empty`** - Mensaje de texto vacío
- **`Media URL is required`** - URL de media faltante
- **`Unsupported media type`** - Tipo de media no soportado
- **`Message key and emoji are required`** - Datos de reacción incompletos

---

## 🔄 **Validaciones Automáticas**

### **Validaciones Generales:**

- ✅ `sessionId` debe ser una cadena no vacía
- ✅ `to` debe ser un número válido
- ✅ `messageType` debe ser uno de: `text`, `media`, `reaction`

### **Validaciones por Tipo:**

#### **Texto:**

- ✅ `textData.text` requerido y no vacío
- ✅ Longitud máxima recomendada: 4096 caracteres

#### **Media:**

- ✅ `mediaData.url` requerido y formato URL válido
- ✅ `mediaData.mediaType` requerido
- ✅ `mediaData.mimeType` opcional pero recomendado
- ✅ `mediaData.fileName` opcional pero recomendado

#### **Reacción:**

- ✅ `reactionData.emoji` requerido
- ✅ `reactionData.targetMessageId` requerido
- ✅ Emoji debe ser válido (Unicode)

---

## 🏗️ **Arquitectura del Sistema**

### **Flujo de Ejecución:**

```
HTTP Request → MessagesController → SendMessage (Use Case) → MessagesOrchestrator
     ↓                    ↓                ↓                        ↓
DTO Validation → Route Handler → Business Logic → Coordination Logic
     ↓                    ↓                ↓                        ↓
JSON Parse → ValidationPipe → Strategy Pattern → Dependency Injection
                                                                   ↓
BaileysMessageSender → WhatsApp API → Database Persistence
         ↓                    ↓                ↓
Implementation Layer → External Service → Data Layer
```

### **Componentes Principales:**

#### **1. Controller Layer** (`MessagesController`)

- Maneja requests HTTP
- Validación de DTOs
- Manejo de errores HTTP

#### **2. Application Layer** (`SendMessage`)

- Lógica de negocio
- Validación de reglas
- Orquestación de procesos

#### **3. Orchestration Layer** (`MessagesOrchestrator`)

- Coordinación entre servicios
- Persistencia en base de datos
- Manejo transaccional

#### **4. Infrastructure Layer** (`BaileysMessageSender`)

- Integración con WhatsApp
- Implementación de puertos
- Adaptación de protocolos

---

## 💾 **Persistencia de Datos**

### **Estructura de Base de Datos:**

#### **Tabla Padre:** `messages`

```sql
- id (UUID)
- baileys_json (JSON completo de Baileys)
- message_type ('txt' | 'media' | 'react')
- quoted_message_id (JSON del mensaje citado)
- session_id (ID de sesión)
- to (número destino)
- created_at (timestamp)
```

#### **Tablas Hijas:**

- **`text_messages`** - Contenido de mensajes de texto
- **`media_messages`** - Metadatos de archivos media
- **`reaction_messages`** - Información de reacciones

### **Flujo de Persistencia:**

1. **Envío exitoso** → Obtener ID de WhatsApp
2. **Crear registro padre** → Tabla `messages`
3. **Crear registro hijo** → Tabla específica del tipo
4. **Relación establecida** → `message_id` como FK

---

## 🔐 **Seguridad y Mejores Prácticas**

### **Recomendaciones de Seguridad:**

- ✅ Validar números de teléfono antes del envío
- ✅ Sanitizar contenido de texto para evitar spam
- ✅ Implementar rate limiting por sesión
- ✅ Validar URLs de media antes de procesar
- ✅ Logging de todas las operaciones

### **Límites Recomendados:**

- **Texto:** Máximo 4096 caracteres
- **Media:** Máximo 100MB por archivo
- **Rate Limit:** 20 mensajes por minuto por sesión
- **Concurrent:** Máximo 5 envíos simultáneos

---

## 🧪 **Testing del Endpoint**

### **Script de Prueba Rápida:**

```javascript
// Archivo: test-send-endpoint.js
const BASE_URL = 'http://localhost:3000';

const testCases = [
  {
    name: 'Mensaje de Texto',
    data: {
      sessionId: 'test-session',
      to: '1234567890',
      messageType: 'text',
      textData: { text: 'Mensaje de prueba' },
    },
  },
  {
    name: 'Imagen con Caption',
    data: {
      sessionId: 'test-session',
      to: '1234567890',
      messageType: 'media',
      mediaData: {
        url: 'https://picsum.photos/400/300',
        mediaType: 'image',
        caption: 'Imagen de prueba',
      },
    },
  },
  {
    name: 'Reacción',
    data: {
      sessionId: 'test-session',
      to: '1234567890',
      messageType: 'reaction',
      reactionData: {
        emoji: '❤️',
        targetMessageId: 'mensaje-id-existente',
      },
    },
  },
];

// Ejecutar pruebas
testCases.forEach(async (test) => {
  try {
    const response = await fetch(`${BASE_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test.data),
    });
    const result = await response.json();
    console.log(`✅ ${test.name}:`, result);
  } catch (error) {
    console.error(`❌ ${test.name}:`, error);
  }
});
```

### **Casos de Prueba Recomendados:**

1. **Mensajes válidos** - Todos los tipos con datos correctos
2. **Validación de campos** - Campos faltantes o inválidos
3. **Sesiones inexistentes** - SessionId no válido
4. **URLs inválidas** - Media con URLs rotas
5. **Números inválidos** - Formatos de teléfono incorrectos
6. **Emojis inválidos** - Caracteres no válidos para reacciones
7. **Concurrencia** - Múltiples envíos simultáneos
8. **Rate limiting** - Envíos excesivos

---

## 🚨 **Troubleshooting**

### **Problemas Comunes y Soluciones:**

#### **Error: "Session not found"**

```json
{
  "success": false,
  "error": "Session session-123 not found or not connected"
}
```

**Solución:** Verificar que la sesión esté activa en `/sessions/{sessionId}/status`

#### **Error: "Media URL is required"**

```json
{
  "success": false,
  "error": "Media URL is required"
}
```

**Solución:** Asegurarse de incluir `mediaData.url` en mensajes de media

#### **Error: "Text message cannot be empty"**

```json
{
  "success": false,
  "error": "Text message cannot be empty"
}
```

**Solución:** Verificar que `textData.text` no esté vacío

#### **Error: "Unsupported media type"**

```json
{
  "success": false,
  "error": "Unsupported media type 'invalid'"
}
```

**Solución:** Usar tipos válidos: `image`, `video`, `audio`, `document`, `voiceNote`, `sticker`

### **Debug y Logging:**

- Los logs detallados aparecen en la consola del servidor
- Verificar connectivity de sesión antes del envío
- Validar formato de números (solo dígitos, sin código de país)
- Para media, verificar que las URLs sean accesibles públicamente

---

## 📚 **Recursos Adicionales**

### **Endpoints Relacionados:**

- **`GET /sessions`** - Listar sesiones activas
- **`GET /sessions/{id}/status`** - Estado de sesión específica
- **`GET /messages`** - Obtener historial de mensajes
- **`GET /text-messages`** - Obtener mensajes de texto
- **`GET /media-messages`** - Obtener mensajes de media
- **`GET /reaction-messages`** - Obtener reacciones

### **Archivos de Referencia:**

- `src/lib/Messages/messages.controller.ts` - Controller principal
- `src/lib/Messages/application/SendMessage.ts` - Caso de uso
- `src/lib/Messages/application/dto/` - DTOs de request/response
- `src/lib/Messages/README.md` - Documentación técnica adicional

---

## 📞 **Soporte**

Para problemas técnicos o preguntas sobre implementación:

1. Verificar logs del servidor
2. Revisar documentación de arquitectura
3. Consultar ejemplos en el archivo de pruebas
4. Validar configuración de sesiones de WhatsApp

---

**¡El endpoint `/messages/send` está listo para producción con arquitectura enterprise-grade!** 🚀
