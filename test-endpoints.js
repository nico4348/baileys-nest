/**
 * Script de pruebas para todos los endpoints de Sessions
 * Ejecutar con: node test-endpoints.js
 */

const BASE_URL = 'http://localhost:3000';
let createdSessionId = null;
let testPhoneNumber = '573022949109'; // Número de teléfono para pruebas

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Función para hacer peticiones HTTP
async function makeRequest(method, endpoint, body = null, headers = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false,
    };
  }
}

// Función para imprimir resultados
function printResult(testName, result, expectedStatus = 200) {
  const statusColor = result.ok ? colors.green : colors.red;
  const resultIcon = result.ok ? '✅' : '❌';

  console.log(`\n${colors.cyan}${testName}${colors.reset}`);
  console.log(
    `${resultIcon} Status: ${statusColor}${result.status}${colors.reset} (Expected: ${expectedStatus})`,
  );

  if (result.data) {
    if (result.data.success !== undefined) {
      const successIcon = result.data.success ? '✅' : '❌';
      console.log(`${successIcon} Success: ${result.data.success}`);
    }

    if (result.data.message) {
      console.log(`📝 Message: ${result.data.message}`);
    }

    if (result.data.data) {
      console.log(`📊 Data: ${JSON.stringify(result.data.data, null, 2)}`);
    }

    if (result.data.sessionId) {
      console.log(`🆔 Session ID: ${result.data.sessionId}`);
    }

    if (result.data.qrCode) {
      console.log(`📱 QR Code: ${result.data.qrCode.substring(0, 50)}...`);
    }

    if (result.data.qrImage) {
      console.log(`🖼️ QR Image: ${result.data.qrImage.substring(0, 50)}...`);
    }
  }

  console.log(`${'─'.repeat(80)}`);
}

// Función para esperar
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log(
    `${colors.bright}${colors.blue}🚀 Iniciando pruebas de endpoints de Sessions${colors.reset}`,
  );
  console.log(`${colors.dim}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${'═'.repeat(80)}\n`);

  // 1. CRUD - Obtener todas las sesiones (inicialmente)
  let result = await makeRequest('GET', '/sessions');
  printResult('1. GET /sessions - Obtener todas las sesiones', result);

  // 2. CRUD - Crear nueva sesión
  const createSessionBody = {
    session_name: `Test Session ${Date.now()}`,
    phone: testPhoneNumber,
  };

  result = await makeRequest('POST', '/sessions/create', createSessionBody);
  printResult('2. POST /sessions/create - Crear nueva sesión', result);

  if (result.data && result.data.sessionId) {
    createdSessionId = result.data.sessionId;
    console.log(
      `${colors.green}✅ Sesión creada con ID: ${createdSessionId}${colors.reset}\n`,
    );
  } else {
    console.log(
      `${colors.red}❌ No se pudo crear la sesión, algunos tests pueden fallar${colors.reset}\n`,
    );
  }

  // Esperar un poco para que se procese la creación
  await sleep(2000);

  // 3. CRUD - Obtener sesión por ID
  if (createdSessionId) {
    result = await makeRequest('GET', `/sessions/${createdSessionId}`);
    printResult('3. GET /sessions/:sessionId - Obtener sesión por ID', result);
  }

  // 4. CRUD - Obtener sesión por teléfono
  result = await makeRequest('GET', `/sessions/phone/${testPhoneNumber}`);
  printResult(
    '4. GET /sessions/phone/:phone - Obtener sesión por teléfono',
    result,
  );

  // 5. CRUD - Obtener sesiones por estado (activas)
  result = await makeRequest('GET', '/sessions/status/true');
  printResult(
    '5. GET /sessions/status/true - Obtener sesiones activas',
    result,
  );

  // 6. CRUD - Obtener sesiones por estado (inactivas)
  result = await makeRequest('GET', '/sessions/status/false');
  printResult(
    '6. GET /sessions/status/false - Obtener sesiones inactivas',
    result,
  );

  if (createdSessionId) {
    // 7. WhatsApp - Obtener QR como texto
    result = await makeRequest('GET', `/sessions/${createdSessionId}/qr`);
    printResult(
      '7. GET /sessions/:sessionId/qr - Obtener QR como texto',
      result,
    );

    // 8. WhatsApp - Obtener QR como imagen
    result = await makeRequest('GET', `/sessions/${createdSessionId}/qr/image`);
    printResult(
      '8. GET /sessions/:sessionId/qr/image - Obtener QR como imagen',
      result,
    );

    // 9. WhatsApp - Iniciar sesión
    result = await makeRequest('POST', `/sessions/${createdSessionId}/start`);
    printResult(
      '9. POST /sessions/:sessionId/start - Iniciar sesión WhatsApp',
      result,
    );

    // Esperar un poco para que se procese
    await sleep(3000);

    // 10. WhatsApp - Pausar sesión
    result = await makeRequest('POST', `/sessions/${createdSessionId}/pause`);
    printResult(
      '10. POST /sessions/:sessionId/pause - Pausar sesión WhatsApp',
      result,
    );

    // 11. WhatsApp - Reanudar sesión
    result = await makeRequest('POST', `/sessions/${createdSessionId}/resume`);
    printResult(
      '11. POST /sessions/:sessionId/resume - Reanudar sesión WhatsApp',
      result,
    );

    // 12. WhatsApp - Reiniciar sesión
    result = await makeRequest('POST', `/sessions/${createdSessionId}/restart`);
    printResult(
      '12. POST /sessions/:sessionId/restart - Reiniciar sesión WhatsApp',
      result,
    );

    // 13. CRUD - Actualizar sesión
    const updateSessionBody = {
      session_name: `Updated Test Session ${Date.now()}`,
      status: false,
    };

    result = await makeRequest(
      'PUT',
      `/sessions/${createdSessionId}`,
      updateSessionBody,
    );
    printResult('13. PUT /sessions/:sessionId - Actualizar sesión', result);

    // 14. WhatsApp - Eliminar sesión WhatsApp
    result = await makeRequest(
      'DELETE',
      `/sessions/${createdSessionId}/delete`,
    );
    printResult(
      '14. DELETE /sessions/:sessionId/delete - Eliminar sesión WhatsApp',
      result,
    );

    // 15. CRUD - Eliminar sesión permanentemente (Hard Delete)
    result = await makeRequest('DELETE', `/sessions/${createdSessionId}/hard`);
    printResult(
      '15. DELETE /sessions/:sessionId/hard - Eliminar sesión permanentemente',
      result,
    );
  }

  // 16. Pruebas de errores - Sesión no existente
  const nonExistentId = '00000000-0000-0000-0000-000000000000';

  result = await makeRequest('GET', `/sessions/${nonExistentId}`);
  printResult(
    '16. GET /sessions/:sessionId - Sesión no existente (debe fallar)',
    result,
    404,
  );

  result = await makeRequest('GET', `/sessions/phone/999999999999`);
  printResult(
    '17. GET /sessions/phone/:phone - Teléfono no existente (debe fallar)',
    result,
    404,
  );

  result = await makeRequest('POST', `/sessions/${nonExistentId}/start`);
  printResult(
    '18. POST /sessions/:sessionId/start - Iniciar sesión inexistente (debe fallar)',
    result,
    500,
  );

  // 19. Obtener todas las sesiones (final)
  result = await makeRequest('GET', '/sessions');
  printResult('19. GET /sessions - Obtener todas las sesiones (final)', result);

  console.log(
    `\n${colors.bright}${colors.green}🎉 Pruebas completadas${colors.reset}`,
  );
  console.log(
    `${colors.dim}Revisa los resultados arriba para verificar el funcionamiento de cada endpoint${colors.reset}`,
  );
}

// Función principal
async function main() {
  try {
    await runTests();
  } catch (error) {
    console.error(
      `${colors.red}❌ Error durante las pruebas:${colors.reset}`,
      error,
    );
  }
}

// Verificar que fetch esté disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error(
    `${colors.red}❌ Este script requiere Node.js 18+ con fetch nativo o instalar node-fetch${colors.reset}`,
  );
  console.log(
    `${colors.yellow}💡 Instala node-fetch: npm install node-fetch${colors.reset}`,
  );
  process.exit(1);
}

// Ejecutar las pruebas
main();
