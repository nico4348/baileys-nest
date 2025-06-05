# Pruebas de Carga para Baileys-Nest

Este directorio contiene scripts para realizar pruebas de carga y estrés en el sistema de mensajería.

## Herramientas Disponibles

### 1. K6 (Recomendado)

#### Instalación

```powershell
# Usando Chocolatey
choco install k6

# O descarga el binario desde: https://k6.io/downloads/
```

#### Scripts Disponibles

##### Script Completo (`load-test.js`)

Prueba de carga completa que simula:

- 50% mensajes de texto
- 30% mensajes multimedia
- 15% reacciones
- 5% operaciones CRUD

```powershell
# Ejecutar prueba completa
k6 run load-test.js

# Con más usuarios virtuales
k6 run --vus 50 --duration 60s load-test.js
```

##### Script Rápido (`quick-load-test.js`)

Prueba simple de 30 segundos con 10 usuarios:

```powershell
k6 run quick-load-test.js
```

#### Configuración de Escenarios

Puedes modificar los parámetros en `load-test.js`:

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Escalado gradual
    { duration: '5m', target: 50 }, // Carga sostenida
    { duration: '2m', target: 100 }, // Pico de carga
    { duration: '5m', target: 100 }, // Estrés sostenido
    { duration: '2m', target: 0 }, // Reducción gradual
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% < 1 segundo
    http_req_failed: ['rate<0.1'], // < 10% errores
  },
};
```

### 2. Artillery

#### Instalación

```powershell
npm install -g artillery
```

#### Uso

```powershell
# Ejecutar prueba con Artillery
artillery run artillery-load-test.yml

# Con reporte HTML
artillery run artillery-load-test.yml --output report.json
artillery report report.json
```

## Métricas Importantes

### Métricas de Rendimiento

- **Throughput**: Solicitudes por segundo
- **Latencia**: Tiempo de respuesta promedio
- **P95**: 95% de requests bajo X ms
- **Error Rate**: Porcentaje de errores

### Métricas de Sistema

- **CPU Usage**: Uso de procesador
- **Memory Usage**: Uso de memoria
- **Queue Depth**: Profundidad de cola de mensajes
- **Database Connections**: Conexiones a BD activas

## Monitoreo Durante las Pruebas

### 1. Logs de la aplicación

```powershell
# En otra terminal, monitorea los logs
npm run start:dev
```

### 2. Recursos del sistema

```powershell
# Monitorear uso de recursos
Get-Process -Name "node" | Select-Object CPU,WorkingSet,ProcessName
```

### 3. Base de datos

- Monitorea conexiones activas
- Verifica el rendimiento de queries
- Observa el crecimiento de tablas

## Escenarios de Prueba

### 1. Prueba de Carga Normal

- 10-50 usuarios concurrentes
- Duración: 5-10 minutos
- Objetivo: Verificar rendimiento normal

### 2. Prueba de Estrés

- 100-500 usuarios concurrentes
- Duración: 10-30 minutos
- Objetivo: Encontrar punto de ruptura

### 3. Prueba de Picos

- Incremento súbito de usuarios
- Objetivo: Verificar escalabilidad

### 4. Prueba de Resistencia

- Carga sostenida por horas
- Objetivo: Detectar memory leaks

## Interpretación de Resultados

### ✅ Resultados Buenos

- P95 < 500ms para endpoints críticos
- Error rate < 1%
- CPU < 80% sostenido
- Memory estable

### ⚠️ Resultados Preocupantes

- P95 > 1000ms
- Error rate > 5%
- CPU > 90% sostenido
- Memory creciendo constantemente

### ❌ Resultados Críticos

- Timeouts frecuentes
- Error rate > 10%
- Sistema no responde
- Out of memory errors

## Optimizaciones Sugeridas

### Código

- Implementar pooling de conexiones
- Agregar rate limiting
- Optimizar queries de BD
- Implementar caching

### Infraestructura

- Aumentar recursos del servidor
- Implementar load balancing
- Usar CDN para media
- Configurar auto-scaling

### Base de Datos

- Agregar índices apropiados
- Optimizar queries lentas
- Implementar read replicas
- Configurar connection pooling

## Troubleshooting

### Error "ECONNREFUSED"

```bash
# Verificar que la app esté corriendo
curl http://localhost:3000/messages
```

### Errores de Timeout

- Aumentar timeouts en k6
- Verificar recursos del servidor
- Revisar logs de la aplicación

### Memory Leaks

- Usar herramientas como clinic.js
- Monitorear con process.memoryUsage()
- Implementar garbage collection forzado

## Comandos Útiles

```powershell
# Verificar puertos abiertos
netstat -an | findstr :3000

# Monitorear memoria
Get-Process node | Measure-Object WorkingSet -Sum

# Matar procesos node si es necesario
Get-Process -Name "node" | Stop-Process -Force
```
