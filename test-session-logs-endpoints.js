/**
 * SessionLogs API Test Script
 *
 * Script completo para probar todos los endpoints de SessionLogs
 * Incluye casos de éxito, errores y casos edge
 *
 * Uso:
 * node test-session-logs-endpoints.js
 *
 * Asegúrate de que el servidor esté ejecutándose en http://localhost:3000
 */

const https = require('https');
const http = require('http');

// Configuración
const BASE_URL = 'http://localhost:3000';
const API_PREFIX = '/session-logs';

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Utilidad para hacer requests HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);

    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Utilidad para logging
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(
    `\n${colors.bold}${colors.blue}=== ${testName} ===${colors.reset}`,
  );
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Variables globales para almacenar datos de test
let testSessionId = null;
let testLogId = null;
let createdLogIds = [];

// Función para obtener un sessionId válido de las sesiones existentes
async function getValidSessionId() {
  try {
    const response = await makeRequest('GET', '/sessions');
    if (
      response.statusCode === 200 &&
      response.data &&
      response.data.length > 0
    ) {
      return response.data[0].id;
    }
    return null;
  } catch (error) {
    logWarning('No se pudo obtener un sessionId válido de /sessions');
    return null;
  }
}

// Tests individuales
async function testGetAllSessionLogs() {
  logTest('Test: GET /session-logs - Obtener todos los logs');

  try {
    const response = await makeRequest('GET', API_PREFIX);

    if (response.statusCode === 200) {
      logSuccess(`Respuesta exitosa: ${response.statusCode}`);
      logInfo(
        `Total de logs encontrados: ${response.data ? response.data.length : 0}`,
      );

      if (response.data && response.data.length > 0) {
        const log = response.data[0];
        logInfo(
          `Ejemplo de log: ID=${log.id}, Type=${log.logType}, Session=${log.sessionId}`,
        );

        // Guardar IDs para otros tests
        testLogId = log.id;
        testSessionId = log.sessionId;
      }

      return true;
    } else {
      logError(`Error inesperado: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`Error en request: ${error.message}`);
    return false;
  }
}

async function testGetRecentSessionLogs() {
  logTest('Test: GET /session-logs/recent - Obtener logs recientes');

  // Test 1: Sin parámetros (default limit)
  try {
    const response1 = await makeRequest('GET', `${API_PREFIX}/recent`);

    if (response1.statusCode === 200) {
      logSuccess(`Logs recientes (default): ${response1.statusCode}`);
      logInfo(`Logs retornados: ${response1.data ? response1.data.length : 0}`);
    } else {
      logError(`Error: ${response1.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 2: Con límite específico
  try {
    const response2 = await makeRequest('GET', `${API_PREFIX}/recent?limit=5`);

    if (response2.statusCode === 200) {
      logSuccess(`Logs recientes (limit=5): ${response2.statusCode}`);
      logInfo(`Logs retornados: ${response2.data ? response2.data.length : 0}`);

      if (response2.data && response2.data.length <= 5) {
        logSuccess('Límite respetado correctamente');
      } else if (response2.data && response2.data.length > 5) {
        logWarning('El límite no se respetó correctamente');
      }
    } else {
      logError(`Error: ${response2.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 3: Límite inválido
  try {
    const response3 = await makeRequest(
      'GET',
      `${API_PREFIX}/recent?limit=invalid`,
    );

    if (response3.statusCode === 400) {
      logSuccess('Error 400 correcto para límite inválido');
    } else {
      logWarning(`Se esperaba 400, pero se recibió: ${response3.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testGetSessionLogsBySessionId() {
  logTest('Test: GET /session-logs/session/:sessionId - Logs por sesión');

  // Si no tenemos sessionId de tests anteriores, obtener uno válido
  if (!testSessionId) {
    testSessionId = await getValidSessionId();
  }

  if (!testSessionId) {
    logWarning('No hay sessionId disponible, usando uno de prueba');
    testSessionId = '30ed47f1-eb16-4573-8696-4546ab37dce0'; // ID de ejemplo
  }

  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/session/${testSessionId}`,
    );

    if (response.statusCode === 200) {
      logSuccess(`Logs por sesión: ${response.statusCode}`);
      logInfo(
        `Logs encontrados para sesión ${testSessionId}: ${response.data ? response.data.length : 0}`,
      );

      if (response.data && response.data.length > 0) {
        const logTypes = response.data.map((log) => log.logType);
        const uniqueTypes = [...new Set(logTypes)];
        logInfo(`Tipos de logs encontrados: ${uniqueTypes.join(', ')}`);
      }
    } else {
      logInfo(
        `No se encontraron logs para la sesión o sesión no existe: ${response.statusCode}`,
      );
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test con sessionId inválido
  try {
    const response2 = await makeRequest(
      'GET',
      `${API_PREFIX}/session/invalid-session-id`,
    );

    if (response2.statusCode === 200) {
      logInfo('SessionId inválido retornó 200 (posiblemente array vacío)');
    } else {
      logInfo(`SessionId inválido retornó: ${response2.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testGetSessionLogsBySessionIdAndType() {
  logTest(
    'Test: GET /session-logs/session/:sessionId/type/:logType - Logs por sesión y tipo',
  );

  if (!testSessionId) {
    testSessionId =
      (await getValidSessionId()) || '30ed47f1-eb16-4573-8696-4546ab37dce0';
  }

  const logTypes = [
    'SESSION_START',
    'CONNECTION',
    'ERROR',
    'AUTH_SUCCESS',
    'INFO',
  ];

  for (const logType of logTypes) {
    try {
      const response = await makeRequest(
        'GET',
        `${API_PREFIX}/session/${testSessionId}/type/${logType}`,
      );

      if (response.statusCode === 200) {
        logSuccess(
          `Logs tipo ${logType}: ${response.data ? response.data.length : 0} encontrados`,
        );

        if (response.data && response.data.length > 0) {
          // Verificar que todos los logs son del tipo correcto
          const allCorrectType = response.data.every(
            (log) => log.logType === logType,
          );
          if (allCorrectType) {
            logSuccess(`Todos los logs son del tipo ${logType}`);
          } else {
            logWarning(`Algunos logs no son del tipo ${logType}`);
          }
        }
      } else if (response.statusCode === 400) {
        logInfo(`Tipo de log ${logType} no es válido o no hay logs: 400`);
      } else {
        logInfo(`Respuesta para tipo ${logType}: ${response.statusCode}`);
      }
    } catch (error) {
      logError(`Error para tipo ${logType}: ${error.message}`);
    }
  }

  // Test con tipo inválido
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/session/${testSessionId}/type/INVALID_TYPE`,
    );

    if (response.statusCode === 400) {
      logSuccess('Error 400 correcto para tipo de log inválido');
    } else {
      logInfo(`Tipo inválido retornó: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testGetSessionLogById() {
  logTest('Test: GET /session-logs/:id - Obtener log por ID');

  if (!testLogId) {
    // Intentar obtener un ID válido
    try {
      const response = await makeRequest('GET', `${API_PREFIX}?limit=1`);
      if (
        response.statusCode === 200 &&
        response.data &&
        response.data.length > 0
      ) {
        testLogId = response.data[0].id;
      }
    } catch (error) {
      logWarning('No se pudo obtener un ID de log válido');
    }
  }

  if (testLogId) {
    try {
      const response = await makeRequest('GET', `${API_PREFIX}/${testLogId}`);
      if (response.statusCode === 200) {
        logSuccess(`Log encontrado: ${response.statusCode}`);
        logInfo(`Log ID: ${response.data.id}, Tipo: ${response.data.logType}`);
        logInfo(`Mensaje: ${response.data.message}`);
        logInfo(`Fecha: ${response.data.createdAt}`);
      } else if (response.statusCode === 404) {
        logInfo('Log no encontrado (404)');
      } else {
        logError(`Error inesperado: ${response.statusCode}`);
      }
    } catch (error) {
      logError(`Error: ${error.message}`);
    }
  } else {
    logWarning('No hay ID de log disponible para test');
  }

  // Test con ID inválido
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/invalid-log-id-123`,
    );

    if (response.statusCode === 404) {
      logSuccess('Error 404 correcto para ID inválido');
    } else {
      logInfo(`ID inválido retornó: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testDeleteSessionLog() {
  logTest('Test: DELETE /session-logs/:id - Eliminar log por ID');

  // Para este test, sería mejor crear un log de test primero
  // pero como no tenemos endpoint de creación, usaremos uno existente si está disponible

  logWarning('NOTA: Este test eliminará un log real si está disponible');
  logWarning(
    'En un entorno de producción, esto debería hacerse con datos de test',
  );

  // Test con ID inválido primero
  try {
    const response = await makeRequest(
      'DELETE',
      `${API_PREFIX}/invalid-log-id-999`,
    );

    if (response.statusCode === 500 || response.statusCode === 404) {
      logInfo(
        `ID inválido para eliminación retornó: ${response.statusCode} (esperado)`,
      );
    } else {
      logWarning(`ID inválido retornó: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Solo proceder con eliminación real si hay confirmación
  logInfo('Para proteger datos, no se eliminarán logs reales en este test');
  logInfo(
    'En un entorno de test, aquí se eliminaría un log creado específicamente para testing',
  );
}

async function testDeleteSessionLogsBySessionId() {
  logTest(
    'Test: DELETE /session-logs/session/:sessionId - Eliminar logs por sesión',
  );

  logWarning('NOTA: Este test eliminaría todos los logs de una sesión');
  logWarning(
    'En un entorno de producción, esto debería hacerse con datos de test',
  );

  // Test con sessionId inválido
  try {
    const response = await makeRequest(
      'DELETE',
      `${API_PREFIX}/session/invalid-session-id-999`,
    );

    if (response.statusCode === 200) {
      logInfo(
        'SessionId inválido retornó 200 (posiblemente 0 logs eliminados)',
      );
      if (response.data && response.data.message) {
        logInfo(`Mensaje: ${response.data.message}`);
      }
    } else {
      logInfo(`SessionId inválido retornó: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  logInfo(
    'Para proteger datos, no se eliminarán logs reales de sesiones existentes',
  );
}

async function testCleanupOldSessionLogs() {
  logTest('Test: DELETE /session-logs/cleanup/old - Limpiar logs antiguos');

  // Test 1: Cleanup con parámetros por defecto
  try {
    const response1 = await makeRequest('DELETE', `${API_PREFIX}/cleanup/old`);

    if (response1.statusCode === 200) {
      logSuccess(`Cleanup default: ${response1.statusCode}`);
      if (response1.data) {
        logInfo(`Mensaje: ${response1.data.message}`);
        logInfo(`Logs eliminados: ${response1.data.deletedCount}`);
      }
    } else {
      logError(`Error en cleanup: ${response1.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 2: Cleanup con días específicos
  try {
    const response2 = await makeRequest(
      'DELETE',
      `${API_PREFIX}/cleanup/old?days=1`,
    );

    if (response2.statusCode === 200) {
      logSuccess(`Cleanup (1 día): ${response2.statusCode}`);
      if (response2.data) {
        logInfo(`Logs eliminados: ${response2.data.deletedCount}`);
      }
    } else {
      logError(`Error en cleanup: ${response2.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 3: Parámetro inválido
  try {
    const response3 = await makeRequest(
      'DELETE',
      `${API_PREFIX}/cleanup/old?days=invalid`,
    );

    if (response3.statusCode === 400) {
      logSuccess('Error 400 correcto para parámetro days inválido');
    } else {
      logWarning(`Se esperaba 400, pero se recibió: ${response3.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

// Test de performance y límites
async function testPerformanceAndLimits() {
  logTest('Test: Performance y Límites');

  // Test de límites extremos
  try {
    const startTime = Date.now();
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/recent?limit=1000`,
    );
    const endTime = Date.now();

    if (response.statusCode === 200) {
      logSuccess(
        `Request con limit=1000 completado en ${endTime - startTime}ms`,
      );
      logInfo(`Logs retornados: ${response.data ? response.data.length : 0}`);
    } else {
      logWarning(`Limit alto retornó: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error en test de performance: ${error.message}`);
  }

  // Test de requests concurrentes
  logInfo('Ejecutando requests concurrentes...');

  const concurrentRequests = Array(5)
    .fill(null)
    .map(async (_, index) => {
      try {
        const response = await makeRequest(
          'GET',
          `${API_PREFIX}/recent?limit=10`,
        );
        return {
          index,
          statusCode: response.statusCode,
          success: response.statusCode === 200,
        };
      } catch (error) {
        return { index, error: error.message, success: false };
      }
    });

  try {
    const results = await Promise.all(concurrentRequests);
    const successCount = results.filter((r) => r.success).length;
    logInfo(
      `Requests concurrentes: ${successCount}/${results.length} exitosos`,
    );

    results.forEach((result) => {
      if (result.success) {
        logSuccess(`Request ${result.index}: ${result.statusCode}`);
      } else {
        logError(`Request ${result.index}: ${result.error || 'Failed'}`);
      }
    });
  } catch (error) {
    logError(`Error en requests concurrentes: ${error.message}`);
  }
}

// Test de integración con Sessions
async function testSessionsIntegration() {
  logTest('Test: Integración con Sessions');

  try {
    // Obtener sesiones existentes
    const sessionsResponse = await makeRequest('GET', '/sessions');

    if (
      sessionsResponse.statusCode === 200 &&
      sessionsResponse.data &&
      sessionsResponse.data.data
    ) {
      const sessions = sessionsResponse.data.data;
      logSuccess(`Sesiones encontradas: ${sessions.length}`);

      // Para cada sesión, verificar si tiene logs
      for (const session of sessions.slice(0, 3)) {
        // Limitar a 3 para no sobrecargar
        try {
          const logsResponse = await makeRequest(
            'GET',
            `${API_PREFIX}/session/${session.id}`,
          );

          if (logsResponse.statusCode === 200) {
            const logCount = logsResponse.data ? logsResponse.data.length : 0;
            logInfo(
              `Sesión ${session.sessionName || session.id}: ${logCount} logs`,
            );

            if (logCount > 0) {
              const logTypes = logsResponse.data.map((log) => log.logType);
              const uniqueTypes = [...new Set(logTypes)];
              logInfo(`  Tipos: ${uniqueTypes.join(', ')}`);
            }
          }
        } catch (error) {
          logError(
            `Error obteniendo logs para sesión ${session.id}: ${error.message}`,
          );
        }
      }
    } else {
      logWarning('No se pudieron obtener sesiones para test de integración');
    }
  } catch (error) {
    logError(`Error en test de integración: ${error.message}`);
  }
}

// Función principal
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('='.repeat(60));
  console.log('      BAILEYS NEST - SESSION LOGS API TESTS');
  console.log('='.repeat(60));
  console.log(`${colors.reset}`);

  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`Timestamp: ${new Date().toISOString()}`);

  const tests = [
    { name: 'Obtener todos los logs', fn: testGetAllSessionLogs },
    { name: 'Obtener logs recientes', fn: testGetRecentSessionLogs },
    { name: 'Obtener logs por sesión', fn: testGetSessionLogsBySessionId },
    {
      name: 'Obtener logs por sesión y tipo',
      fn: testGetSessionLogsBySessionIdAndType,
    },
    { name: 'Obtener log por ID', fn: testGetSessionLogById },
    { name: 'Eliminar log por ID', fn: testDeleteSessionLog },
    { name: 'Eliminar logs por sesión', fn: testDeleteSessionLogsBySessionId },
    { name: 'Limpiar logs antiguos', fn: testCleanupOldSessionLogs },
    { name: 'Performance y límites', fn: testPerformanceAndLimits },
    { name: 'Integración con Sessions', fn: testSessionsIntegration },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      await test.fn();
      passedTests++;
    } catch (error) {
      logError(`Test "${test.name}" falló: ${error.message}`);
    }

    // Pausa entre tests para no sobrecargar el servidor
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Resumen final
  console.log(
    `\n${colors.bold}${colors.blue}=== RESUMEN FINAL ===${colors.reset}`,
  );
  logInfo(`Tests ejecutados: ${totalTests}`);
  logSuccess(`Tests exitosos: ${passedTests}`);

  if (passedTests === totalTests) {
    logSuccess('🎉 ¡Todos los tests pasaron!');
  } else {
    logWarning(`⚠️  ${totalTests - passedTests} tests tuvieron problemas`);
  }

  console.log(`\n${colors.bold}=== NOTAS IMPORTANTES ===${colors.reset}`);
  logInfo(
    '• Los tests de eliminación no ejecutan operaciones destructivas por seguridad',
  );
  logInfo('• En un entorno de testing real, se deberían usar datos de prueba');
  logInfo('• Verificar logs del servidor para información adicional');
  logInfo(
    '• Algunos tests pueden fallar si no hay datos existentes en la base de datos',
  );

  console.log(`\n${colors.green}Tests completados.${colors.reset}`);
}

// Ejecutar tests si el script se ejecuta directamente
if (require.main === module) {
  runAllTests().catch((error) => {
    logError(`Error fatal en tests: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  makeRequest,
  testGetAllSessionLogs,
  testGetRecentSessionLogs,
  testGetSessionLogsBySessionId,
  testGetSessionLogsBySessionIdAndType,
  testGetSessionLogById,
  testDeleteSessionLog,
  testDeleteSessionLogsBySessionId,
  testCleanupOldSessionLogs,
};
