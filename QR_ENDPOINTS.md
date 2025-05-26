# Endpoints de Código QR para WhatsApp

## Descripción

Se han agregado dos nuevos endpoints para obtener la información del código QR necesario para conectar una sesión de WhatsApp.

## Endpoints Disponibles

### 1. Obtener QR como String

**GET** `/sessions/{sessionId}/qr`

Devuelve el código QR en formato string (texto crudo).

#### Respuesta Exitosa:

```json
{
  "success": true,
  "message": "Código QR obtenido exitosamente.",
  "qrCode": "2@3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z..."
}
```

#### Respuesta cuando no hay QR:

```json
{
  "success": false,
  "message": "No hay código QR disponible para esta sesión.",
  "qrCode": null
}
```

### 2. Obtener QR como Imagen Base64

**GET** `/sessions/{sessionId}/qr/image`

Devuelve el código QR como una imagen en formato base64 (data URL).

#### Respuesta Exitosa:

```json
{
  "success": true,
  "message": "Imagen QR obtenida exitosamente.",
  "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### Respuesta cuando no hay QR:

```json
{
  "success": false,
  "message": "No hay código QR disponible para esta sesión.",
  "qrImage": null
}
```

## Flujo de Uso

1. **Crear una sesión**:

   ```bash
   POST /sessions
   {
     "session_name": "Mi Sesión",
     "phone": "1234567890"
   }
   ```

2. **Verificar QR disponible**:

   ```bash
   GET /sessions/{sessionId}/qr
   ```

3. **Mostrar QR al usuario**:

   - Para aplicaciones web: usar `/sessions/{sessionId}/qr/image` para obtener la imagen base64
   - Para aplicaciones móviles/consola: usar `/sessions/{sessionId}/qr` para obtener el string

4. **El QR se limpia automáticamente** cuando:
   - La sesión se conecta exitosamente
   - Se actualizan las credenciales
   - Se elimina la sesión

## Ejemplos de Uso

### JavaScript (Frontend)

```javascript
// Obtener QR como imagen
async function getQRImage(sessionId) {
  const response = await fetch(`/sessions/${sessionId}/qr/image`);
  const data = await response.json();

  if (data.success) {
    // Mostrar la imagen en un elemento img
    document.getElementById('qr-image').src = data.qrImage;
  } else {
    console.log('No hay QR disponible');
  }
}

// Polling para verificar QR
function pollForQR(sessionId) {
  const interval = setInterval(async () => {
    const response = await fetch(`/sessions/${sessionId}/qr`);
    const data = await response.json();

    if (data.success) {
      console.log('QR disponible:', data.qrCode);
      // Mostrar QR al usuario
      await getQRImage(sessionId);
    } else {
      console.log('Esperando QR...');
    }
  }, 2000);

  // Limpiar interval después de un tiempo o cuando se conecte
  setTimeout(() => clearInterval(interval), 60000);
}
```

### cURL

```bash
# Obtener QR como string
curl -X GET "http://localhost:3000/sessions/your-session-id/qr"

# Obtener QR como imagen
curl -X GET "http://localhost:3000/sessions/your-session-id/qr/image"
```

## Notas Importantes

1. **El QR solo está disponible** cuando la sesión necesita ser autenticada por primera vez
2. **El QR se regenera** cada vez que se reinicia una sesión no autenticada
3. **El QR tiene un tiempo de vida limitado** - WhatsApp lo expira después de un tiempo
4. **Usar polling** para verificar cuando el QR está disponible, ya que puede tardar unos segundos en generarse después de crear la sesión
5. **El QR se limpia automáticamente** una vez que se escanea exitosamente

## Estados de la Sesión

- **Sin QR**: La sesión está conectada o no necesita autenticación
- **Con QR**: La sesión necesita ser escaneada para autenticarse
- **QR Escaneado**: El QR se limpia y la sesión se conecta

## Manejo de Errores

- **404**: Sesión no encontrada
- **500**: Error interno del servidor
- **Sesión eliminada**: Error indicando que la sesión fue eliminada
