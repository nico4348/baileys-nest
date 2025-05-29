# Messages API - Unified Send Endpoint

## 📨 Endpoint Unificado para Envío de Mensajes

### **POST `/messages/send`**

Endpoint único que maneja el envío de todos los tipos de mensaje de WhatsApp siguiendo principios de arquitectura limpia.

---

## 🚀 **Ejemplos de Uso**

### **1. Enviar Mensaje de Texto**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "to": "1234567890",
    "messageType": "text",
    "textData": {
      "text": "¡Hola! Este es un mensaje de prueba."
    },
    "quotedMessageId": "mensaje-padre-opcional"
  }'
```

### **2. Enviar Mensaje con Media**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "to": "1234567890", 
    "messageType": "media",
    "mediaData": {
      "url": "https://example.com/image.jpg",
      "mediaType": "image",
      "caption": "Mira esta imagen increíble!",
      "mimeType": "image/jpeg",
      "fileName": "imagen.jpg"
    }
  }'
```

### **3. Enviar Reacción**

```bash
curl -X POST http://localhost:3000/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-uuid",
    "to": "1234567890",
    "messageType": "reaction", 
    "reactionData": {
      "emoji": "❤️",
      "targetMessageId": "mensaje-objetivo-id"
    }
  }'
```

---

## 📋 **Tipos de Mensaje Soportados**

### **Tipos de Media:**
- `image` - Imágenes (JPG, PNG, GIF)
- `video` - Videos (MP4, AVI, MOV)
- `audio` - Audios (MP3, WAV, OGG)
- `document` - Documentos (PDF, DOCX, TXT)
- `voiceNote` - Notas de voz (OGG, M4A)
- `sticker` - Stickers de WhatsApp

### **Emojis para Reacciones:**
- ❤️ 👍 👎 😂 😮 😢 🙏 y más...

---

## ✅ **Respuesta Exitosa**

```json
{
  "success": true,
  "messageId": "whatsapp-message-id",
  "childMessageId": "database-child-id",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "messageType": "text"
}
```

## ❌ **Respuesta de Error**

```json
{
  "success": false,
  "messageId": "",
  "timestamp": "2024-01-01T12:00:00.000Z", 
  "messageType": "text",
  "error": "Descripción del error"
}
```

---

## 🏗️ **Arquitectura**

### **Flujo de Ejecución:**

1. **Controller** → Valida DTOs y maneja HTTP
2. **SendMessage (Use Case)** → Orquesta el proceso 
3. **MessagesOrchestrator** → Coordina envío y persistencia
4. **MessageSender (Port)** → Interface para envío externo
5. **BaileysMessageSender (Adapter)** → Implementación con Baileys
6. **MessageHandlerFactory** → Selecciona handler apropiado
7. **Specific Handler** → Procesa y persiste mensaje específico

### **Principios Aplicados:**

- ✅ **Hexagonal Architecture** - Puertos y adaptadores
- ✅ **Clean Architecture** - Separación por capas
- ✅ **SOLID Principles** - Responsabilidad única, inversión de dependencias
- ✅ **Strategy Pattern** - Diferentes tipos de mensaje
- ✅ **Factory Pattern** - Creación de handlers
- ✅ **Repository Pattern** - Abstracción de persistencia

---

## 🔄 **Estados y Validaciones**

### **Validaciones Automáticas:**
- Campos requeridos según tipo de mensaje
- Formato de números de teléfono
- URLs válidas para media
- Longitud de texto y emojis

### **Manejo de Errores:**
- Validación de entrada con class-validator
- Manejo de errores de WhatsApp
- Rollback automático en caso de fallo
- Logs detallados para debugging

### **Persistencia:**
- Registro padre en tabla `messages`
- Registro hijo en tabla específica (`text_messages`, `media_messages`, `reaction_messages`)
- Consistencia transaccional
- IDs de WhatsApp como referencia

---

## 🧪 **Testing**

### **Casos de Prueba Recomendados:**

1. **Envío exitoso** de cada tipo de mensaje
2. **Validación de DTOs** con datos inválidos
3. **Manejo de errores** de conexión WhatsApp
4. **Persistencia correcta** en base de datos
5. **Rollback** en caso de fallo parcial