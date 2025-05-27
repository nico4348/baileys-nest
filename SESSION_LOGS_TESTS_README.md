# SessionLogs Tests - README

## Descripción

Esta carpeta contiene scripts de testing para los endpoints de SessionLogs del sistema Baileys WhatsApp NestJS.

## Archivos de Test

### 1. `test-session-logs-endpoints.js` (Test Completo)

**Descripción:** Script comprehensive que prueba todos los endpoints de SessionLogs con casos de éxito, error y edge cases.

**Características:**

- ✅ Tests de todos los endpoints GET, DELETE
- ✅ Validación de parámetros y respuestas
- ✅ Tests de performance y concurrencia
- ✅ Integración con módulo Sessions
- ✅ Manejo de errores y casos edge
- ✅ Output colorizado y detallado
- ✅ Protección contra operaciones destructivas

**Uso:**

```bash
node test-session-logs-endpoints.js
```

**Endpoints testeados:**

- `GET /session-logs` - Todos los logs
- `GET /session-logs/recent` - Logs recientes
- `GET /session-logs/session/:sessionId` - Logs por sesión
- `GET /session-logs/session/:sessionId/type/:logType` - Logs por sesión y tipo
- `GET /session-logs/:id` - Log específico por ID
- `DELETE /session-logs/:id` - Eliminar log por ID
- `DELETE /session-logs/session/:sessionId` - Eliminar logs por sesión
- `DELETE /session-logs/cleanup/old` - Limpiar logs antiguos

### 2. `test-session-logs-simple.js` (Test Rápido)

**Descripción:** Script simplificado para pruebas rápidas y verificación básica de funcionamiento.

**Características:**

- ✅ Tests básicos de endpoints principales
- ✅ Verificación rápida de conectividad
- ✅ Output simple y claro
- ✅ Tiempo de ejecución mínimo

**Uso:**

```bash
node test-session-logs-simple.js
```

## Configuración

### Prerrequisitos

1. **Servidor ejecutándose:**

   ```bash
   npm start
   # o
   npm run start:dev
   ```

2. **Puerto configurado:** Los tests asumen que el servidor corre en `http://localhost:3000`

3. **Base de datos:** Debe tener al menos algunas sesiones y logs para tests completos

### Variables de Configuración

Puedes modificar estas variables en los scripts:

```javascript
const BASE_URL = 'http://localhost:3000'; // URL del servidor
const API_PREFIX = '/session-logs'; // Prefijo de la API
```

## Tipos de Tests

### Tests de Funcionalidad

| Endpoint                               | Método | Descripción               | Test |
| -------------------------------------- | ------ | ------------------------- | ---- |
| `/session-logs`                        | GET    | Obtener todos los logs    | ✅   |
| `/session-logs/recent`                 | GET    | Logs recientes con límite | ✅   |
| `/session-logs/session/:id`            | GET    | Logs de sesión específica | ✅   |
| `/session-logs/session/:id/type/:type` | GET    | Logs filtrados por tipo   | ✅   |
| `/session-logs/:id`                    | GET    | Log específico por ID     | ✅   |
| `/session-logs/:id`                    | DELETE | Eliminar log específico   | ⚠️   |
| `/session-logs/session/:id`            | DELETE | Eliminar logs de sesión   | ⚠️   |
| `/session-logs/cleanup/old`            | DELETE | Limpiar logs antiguos     | ✅   |

**Leyenda:**

- ✅ Test completo ejecutado
- ⚠️ Test simulado (sin operaciones destructivas)

### Tests de Validación

- **Parámetros inválidos:** Límites, IDs, tipos de log
- **Casos edge:** Sesiones inexistentes, logs vacíos
- **Tipos de log:** Validación de enum SessionLogType
- **Respuestas de error:** 400, 404, 500

### Tests de Performance

- **Límites altos:** Requests con limit=1000
- **Concurrencia:** Múltiples requests simultáneos
- **Tiempo de respuesta:** Medición de latencia

### Tests de Integración

- **Conexión con Sessions:** Verificar logs de sesiones existentes
- **Consistencia de datos:** Validar relaciones entre sessions y logs
- **Tipos de logs:** Verificar que se generan los logs esperados

## Interpretación de Resultados

### Códigos de Estado Esperados

| Endpoint                | Success | Error         | Notas                         |
| ----------------------- | ------- | ------------- | ----------------------------- |
| GET endpoints           | 200     | 400, 500      | 200 con array vacío es válido |
| DELETE endpoints        | 200     | 400, 404, 500 | Mensaje de confirmación       |
| Parámetros inválidos    | -       | 400           | Bad Request                   |
| Recursos no encontrados | -       | 404           | Not Found                     |

### Output del Test

```bash
=== Test: GET /session-logs - Obtener todos los logs ===
✅ Respuesta exitosa: 200
ℹ️  Total de logs encontrados: 15
ℹ️  Ejemplo de log: ID=abc-123, Type=SESSION_START, Session=xyz-789

⚠️  NOTA: Este test eliminará un log real si está disponible
ℹ️  Para proteger datos, no se eliminarán logs reales en este test
```

### Códigos de Color

- 🟢 **Verde (✅):** Test exitoso
- 🔴 **Rojo (❌):** Error en test
- 🟡 **Amarillo (⚠️):** Advertencia o test simulado
- 🔵 **Azul (ℹ️):** Información adicional

## Troubleshooting

### Problemas Comunes

1. **Connection refused:**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:3000
   ```

   **Solución:** Verificar que el servidor esté ejecutándose

2. **No hay datos para test:**

   ```
   ⚠️  No hay sessionId disponible, usando uno de prueba
   ```

   **Solución:** Crear al menos una sesión antes de ejecutar tests

3. **Tests de eliminación fallan:**
   ```
   Tests de eliminación no ejecutan operaciones destructivas por seguridad
   ```
   **Esto es normal:** Los tests protegen datos reales

### Debug Adicional

Para más información de debug:

1. **Ver logs del servidor** durante la ejecución de tests
2. **Revisar base de datos** para estado actual de logs
3. **Modificar scripts** para habilitar operaciones destructivas en entorno de test

## Ejecutar Tests en CI/CD

### GitHub Actions Example

```yaml
- name: Test SessionLogs API
  run: |
    npm start &
    sleep 10
    node test-session-logs-simple.js
    kill %1
```

### Docker Testing

```bash
# En contenedor
docker exec -it baileys-nest node test-session-logs-endpoints.js
```

## Datos de Test Recomendados

Para tests completos, asegúrate de tener:

1. **Al menos 2-3 sesiones activas**
2. **Logs de diferentes tipos:**

   - SESSION_START
   - CONNECTION
   - AUTH_SUCCESS
   - ERROR
   - MESSAGE_SENT

3. **Logs con diferentes antigüedades** para test de cleanup

## Extensión de Tests

### Agregar Nuevos Tests

```javascript
async function testNewFeature() {
  logTest('Test: Nueva funcionalidad');

  try {
    const response = await makeRequest('GET', '/new-endpoint');
    // Validaciones
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

// Agregar al array de tests
const tests = [
  // ... tests existentes
  { name: 'Nueva funcionalidad', fn: testNewFeature },
];
```

### Tests con Datos Específicos

```javascript
// Crear logs de test
const testData = {
  sessionId: 'test-session-123',
  logType: 'TEST_TYPE',
  message: 'Test message',
};
```

## Contribuir

1. **Fork** del repositorio
2. **Crear** nuevos tests en archivos separados
3. **Documentar** nuevos endpoints o casos de test
4. **Submit** pull request con descripción detallada

---

**Nota:** Estos tests están diseñados para ser seguros y no destructivos. En un entorno de producción, siempre usar datos de test dedicados.
