# 🧪 Scripts de Pruebas para Endpoints de Sessions

Este conjunto de scripts permite probar y validar todos los endpoints del controlador de Sessions de forma completa y automatizada.

## 📋 Scripts Disponibles

### 1. **test-endpoints.js** - Script Básico

Script simple y directo para pruebas rápidas.

```bash
node test-endpoints.js
```

**Características:**

- ✅ Pruebas de todos los endpoints CRUD
- ✅ Pruebas de endpoints de WhatsApp
- ✅ Pruebas de QR codes
- ✅ Validación de casos de error
- ✅ Reporte básico de resultados

### 2. **test-endpoints-advanced.js** - Script Avanzado

Script completo con análisis detallado y métricas.

```bash
node test-endpoints-advanced.js
```

**Características:**

- ✅ Todas las funciones del script básico
- ✅ Verificación de salud del servidor
- ✅ Métricas de tiempo de respuesta
- ✅ Reporte detallado con estadísticas
- ✅ Manejo de errores mejorado
- ✅ Configuración mediante variables de entorno

### 3. **test-endpoints.ps1** - Script de PowerShell (Windows)

Script de PowerShell para usuarios de Windows.

```powershell
.\test-endpoints.ps1
```

**Parámetros opcionales:**

```powershell
.\test-endpoints.ps1 -BaseUrl "http://localhost:3001" -TestPhone "591234567890"
.\test-endpoints.ps1 -Help
```

### 4. **test-endpoints.spec.js** - Pruebas con Jest

Pruebas formales de integración usando Jest.

```bash
npm test test-endpoints.spec.js
```

## 🚀 Configuración y Uso

### Prerrequisitos

1. **Node.js 18+** (para soporte nativo de `fetch`)
2. **Servidor ejecutándose** en el puerto 3000 (o configurado)

```bash
# Iniciar el servidor
npm run start:dev
```

### Variables de Entorno

Puedes configurar las pruebas usando variables de entorno:

```bash
# Windows (PowerShell)
$env:TEST_BASE_URL = "http://localhost:3001"
$env:TEST_PHONE = "591234567890"

# Linux/Mac
export TEST_BASE_URL="http://localhost:3001"
export TEST_PHONE="591234567890"
```

### Scripts NPM

Los scripts están integrados en `package.json`:

```bash
# Script básico
npm run test:endpoints

# Script avanzado
npm run test:endpoints:advanced

# Ambos scripts
npm run test:endpoints:all
```

## 📊 Endpoints Probados

### CRUD Operations

- ✅ `GET /sessions` - Obtener todas las sesiones
- ✅ `POST /sessions/create` - Crear nueva sesión
- ✅ `GET /sessions/:sessionId` - Obtener sesión por ID
- ✅ `GET /sessions/phone/:phone` - Obtener sesión por teléfono
- ✅ `GET /sessions/status/:status` - Obtener sesiones por estado
- ✅ `PUT /sessions/:sessionId` - Actualizar sesión
- ✅ `DELETE /sessions/:sessionId/hard` - Eliminación permanente

### WhatsApp Operations

- ✅ `POST /sessions/:sessionId/start` - Iniciar sesión WhatsApp
- ✅ `POST /sessions/:sessionId/pause` - Pausar sesión WhatsApp
- ✅ `POST /sessions/:sessionId/resume` - Reanudar sesión WhatsApp
- ✅ `POST /sessions/:sessionId/restart` - Reiniciar sesión WhatsApp
- ✅ `DELETE /sessions/:sessionId/delete` - Eliminar sesión WhatsApp

### QR Code Operations

- ✅ `GET /sessions/:sessionId/qr` - Obtener QR como texto
- ✅ `GET /sessions/:sessionId/qr/image` - Obtener QR como imagen

### Error Cases

- ✅ Sesiones no existentes (404)
- ✅ Teléfonos no existentes (404)
- ✅ Datos inválidos (400/500)
- ✅ Operaciones en sesiones inexistentes (500)

## 📈 Interpretación de Resultados

### Códigos de Estado Esperados

- `200` - Operaciones GET exitosas
- `201` - Operaciones POST exitosas
- `404` - Recursos no encontrados (esperado para casos de error)
- `500` - Errores del servidor (esperado para algunos casos de error)

### Indicadores Visuales

- ✅ **Verde** - Prueba exitosa
- ❌ **Rojo** - Prueba fallida
- 📝 **Azul** - Información adicional
- ⚠️ **Amarillo** - Advertencias

### Ejemplo de Salida Exitosa

```
✅ Status: 200 (Expected: 200) | Time: 45ms
✅ Success: true
📝 Message: Sesión obtenida exitosamente.
🆔 Session ID: 123e4567-e89b-12d3-a456-426614174000
```

## 🛠️ Solución de Problemas

### Error: "fetch is not defined"

```bash
# Actualizar a Node.js 18+
node --version

# O instalar node-fetch para versiones anteriores
npm install node-fetch
```

### Error: "Cannot connect to server"

```bash
# Verificar que el servidor esté ejecutándose
npm run start:dev

# Verificar el puerto correcto
curl http://localhost:3000/sessions
```

### Error: "Session creation failed"

```bash
# Verificar la base de datos
# Verificar los logs del servidor
# Verificar la configuración de WhatsApp
```

## 🔧 Personalización

### Modificar URL Base

```javascript
// En los scripts .js
const BASE_URL = 'http://localhost:3001';

// O usar variable de entorno
process.env.TEST_BASE_URL = 'http://localhost:3001';
```

### Modificar Número de Teléfono

```javascript
// En los scripts .js
const TEST_PHONE = '591234567890';

// O usar variable de entorno
process.env.TEST_PHONE = '591234567890';
```

### Añadir Nuevas Pruebas

```javascript
// Ejemplo de nueva prueba en test-endpoints.js
result = await makeRequest('GET', '/new-endpoint');
printResult('Nueva Prueba', result);
```

## 📋 Lista de Verificación

Antes de ejecutar las pruebas:

- [ ] Servidor ejecutándose (`npm run start:dev`)
- [ ] Base de datos disponible
- [ ] Node.js 18+ instalado
- [ ] Variables de entorno configuradas (opcional)
- [ ] Puerto 3000 disponible (o configurado)

## 🆘 Soporte

Si encuentras problemas:

1. **Verifica los logs del servidor** para errores de backend
2. **Revisa la configuración** de base de datos
3. **Confirma** que todos los servicios estén ejecutándose
4. **Verifica** las dependencias de WhatsApp (Baileys)

## 📝 Notas Adicionales

- Los scripts crean y eliminan sesiones de prueba automáticamente
- Las pruebas son **no destructivas** para datos existentes
- Se incluye **cleanup automático** al final de las pruebas
- Los **QR codes** pueden no generarse inmediatamente (es normal)
- Las pruebas de **WhatsApp** dependen de la configuración de Baileys
