/**
 * Script de pruebas avanzado para todos los endpoints de Sessions
 * Ejecutar con: npm run test:endpoints o node test-endpoints-advanced.js
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_PHONE = process.env.TEST_PHONE || '573022949109';
const TIMEOUT = 10000; // 10 segundos de timeout

class EndpointTester {
  constructor() {
    this.results = [];
    this.createdSessionId = null;
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
    };
  }

  async makeRequest(
    method,
    endpoint,
    body = null,
    headers = {},
    expectedStatus = null,
  ) {
    const url = `${BASE_URL}${endpoint}`;
    const startTime = Date.now();

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: AbortSignal.timeout(TIMEOUT),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      console.log(
        `${this.colors.dim}→ ${method} ${endpoint}${this.colors.reset}`,
      );

      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      const data = await response.json().catch(() => ({}));

      const result = {
        method,
        endpoint,
        status: response.status,
        data,
        ok: response.ok,
        responseTime,
        expectedStatus: expectedStatus || (method === 'POST' ? 201 : 200),
        timestamp: new Date().toISOString(),
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result = {
        method,
        endpoint,
        status: 0,
        data: { error: error.message },
        ok: false,
        responseTime,
        expectedStatus: expectedStatus || 200,
        timestamp: new Date().toISOString(),
      };

      this.results.push(result);
      return result;
    }
  }
  printResult(testName, result) {
    const statusMatch = result.status === result.expectedStatus;
    const statusColor = statusMatch ? this.colors.green : this.colors.red;
    const resultIcon = statusMatch ? '✅' : '❌';

    console.log(`\n${this.colors.cyan}${testName}${this.colors.reset}`);
    console.log(
      `${resultIcon} Status: ${statusColor}${result.status}${this.colors.reset} (Expected: ${result.expectedStatus}) | Time: ${result.responseTime}ms`,
    );

    if (result.data) {
      if (result.data.success !== undefined) {
        const successIcon = result.data.success ? '✅' : '❌';
        console.log(`${successIcon} Success: ${result.data.success}`);
      }

      if (result.data.message) {
        console.log(`📝 Message: ${result.data.message}`);
      }

      if (result.data.error) {
        console.log(
          `${this.colors.red}❌ Error: ${result.data.error}${this.colors.reset}`,
        );
      }

      if (result.data.sessionId) {
        console.log(`🆔 Session ID: ${result.data.sessionId}`);
        if (!this.createdSessionId) {
          this.createdSessionId = result.data.sessionId;
        }
      }

      if (result.data.data && Array.isArray(result.data.data)) {
        console.log(`📊 Data Count: ${result.data.data.length}`);
      } else if (result.data.data && typeof result.data.data === 'object') {
        console.log(
          `📊 Data: ${JSON.stringify(result.data.data, null, 2).substring(0, 200)}...`,
        );
      }

      if (result.data.qrCode) {
        console.log(
          `📱 QR Code: ${result.data.qrCode.substring(0, 50)}... (${result.data.qrCode.length} chars)`,
        );
      }

      if (result.data.qrImage) {
        console.log(
          `🖼️ QR Image: ${result.data.qrImage.substring(0, 50)}... (${result.data.qrImage.length} chars)`,
        );
      }
    }

    console.log(`${'─'.repeat(80)}`);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async testCRUDEndpoints() {
    console.log(
      `${this.colors.bright}${this.colors.blue}📋 CRUD Endpoints${this.colors.reset}\n`,
    );

    // 1. Obtener todas las sesiones (inicial)
    let result = await this.makeRequest('GET', '/sessions');
    this.printResult('1. GET /sessions - Obtener todas las sesiones', result);

    // 2. Crear nueva sesión
    const createSessionBody = {
      session_name: `Test Session ${Date.now()}`,
      phone: TEST_PHONE,
    };

    result = await this.makeRequest(
      'POST',
      '/sessions/create',
      createSessionBody,
    );
    this.printResult('2. POST /sessions/create - Crear nueva sesión', result);

    await this.sleep(2000); // Esperar procesamiento

    // 3. Obtener sesión por ID
    if (this.createdSessionId) {
      result = await this.makeRequest(
        'GET',
        `/sessions/${this.createdSessionId}`,
      );
      this.printResult(
        '3. GET /sessions/:sessionId - Obtener sesión por ID',
        result,
      );
    }

    // 4. Obtener sesión por teléfono
    result = await this.makeRequest('GET', `/sessions/phone/${TEST_PHONE}`);
    this.printResult(
      '4. GET /sessions/phone/:phone - Obtener sesión por teléfono',
      result,
    );

    // 5. Obtener sesiones activas
    result = await this.makeRequest('GET', '/sessions/status/true');
    this.printResult(
      '5. GET /sessions/status/true - Obtener sesiones activas',
      result,
    );

    // 6. Obtener sesiones inactivas
    result = await this.makeRequest('GET', '/sessions/status/false');
    this.printResult(
      '6. GET /sessions/status/false - Obtener sesiones inactivas',
      result,
    );

    // 7. Actualizar sesión
    if (this.createdSessionId) {
      const updateSessionBody = {
        session_name: `Updated Test Session ${Date.now()}`,
        status: false,
      };

      result = await this.makeRequest(
        'PUT',
        `/sessions/${this.createdSessionId}`,
        updateSessionBody,
      );
      this.printResult(
        '7. PUT /sessions/:sessionId - Actualizar sesión',
        result,
      );
    }
  }

  async testWhatsAppEndpoints() {
    console.log(
      `\n${this.colors.bright}${this.colors.green}📱 WhatsApp Endpoints${this.colors.reset}\n`,
    );

    if (!this.createdSessionId) {
      console.log(
        `${this.colors.red}❌ No hay sessionId disponible para pruebas de WhatsApp${this.colors.reset}`,
      );
      return;
    }

    // 1. Iniciar sesión
    let result = await this.makeRequest(
      'POST',
      `/sessions/${this.createdSessionId}/start`,
    );
    this.printResult(
      '1. POST /sessions/:sessionId/start - Iniciar sesión WhatsApp',
      result,
    );

    await this.sleep(3000); // Esperar inicialización

    // 2. Obtener QR como texto
    result = await this.makeRequest(
      'GET',
      `/sessions/${this.createdSessionId}/qr`,
    );
    this.printResult(
      '2. GET /sessions/:sessionId/qr - Obtener QR como texto',
      result,
    );

    // 3. Obtener QR como imagen
    result = await this.makeRequest(
      'GET',
      `/sessions/${this.createdSessionId}/qr/image`,
    );
    this.printResult(
      '3. GET /sessions/:sessionId/qr/image - Obtener QR como imagen',
      result,
    );

    // 4. Pausar sesión
    result = await this.makeRequest(
      'POST',
      `/sessions/${this.createdSessionId}/pause`,
    );
    this.printResult(
      '4. POST /sessions/:sessionId/pause - Pausar sesión WhatsApp',
      result,
    );

    // 5. Reanudar sesión
    result = await this.makeRequest(
      'POST',
      `/sessions/${this.createdSessionId}/resume`,
    );
    this.printResult(
      '5. POST /sessions/:sessionId/resume - Reanudar sesión WhatsApp',
      result,
    );

    // 6. Reiniciar sesión
    result = await this.makeRequest(
      'POST',
      `/sessions/${this.createdSessionId}/restart`,
    );
    this.printResult(
      '6. POST /sessions/:sessionId/restart - Reiniciar sesión WhatsApp',
      result,
    );

    // 7. Eliminar sesión WhatsApp
    result = await this.makeRequest(
      'DELETE',
      `/sessions/${this.createdSessionId}/delete`,
    );
    this.printResult(
      '7. DELETE /sessions/:sessionId/delete - Eliminar sesión WhatsApp',
      result,
    );
  }

  async testErrorCases() {
    console.log(
      `\n${this.colors.bright}${this.colors.red}🚨 Error Cases${this.colors.reset}\n`,
    );

    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    // 1. Sesión no existente
    let result = await this.makeRequest(
      'GET',
      `/sessions/${nonExistentId}`,
      null,
      {},
      404,
    );
    this.printResult(
      '1. GET /sessions/:sessionId - Sesión no existente',
      result,
    );

    // 2. Teléfono no existente
    result = await this.makeRequest(
      'GET',
      '/sessions/phone/999999999999',
      null,
      {},
      404,
    );
    this.printResult(
      '2. GET /sessions/phone/:phone - Teléfono no existente',
      result,
    );

    // 3. Iniciar sesión inexistente
    result = await this.makeRequest(
      'POST',
      `/sessions/${nonExistentId}/start`,
      null,
      {},
      500,
    );
    this.printResult(
      '3. POST /sessions/:sessionId/start - Sesión inexistente',
      result,
    );

    // 4. Body inválido para crear sesión
    result = await this.makeRequest('POST', '/sessions/create', {}, null, 400);
    this.printResult('4. POST /sessions/create - Body inválido', result);

    // 5. QR de sesión inexistente
    result = await this.makeRequest(
      'GET',
      `/sessions/${nonExistentId}/qr`,
      null,
      {},
      500,
    );
    this.printResult(
      '5. GET /sessions/:sessionId/qr - Sesión inexistente',
      result,
    );
  }

  async testCleanup() {
    console.log(
      `\n${this.colors.bright}${this.colors.yellow}🧹 Cleanup${this.colors.reset}\n`,
    );

    if (this.createdSessionId) {
      // Eliminar sesión permanentemente
      const result = await this.makeRequest(
        'DELETE',
        `/sessions/${this.createdSessionId}/hard`,
      );
      this.printResult(
        '1. DELETE /sessions/:sessionId/hard - Eliminar sesión permanentemente',
        result,
      );
    }

    // Verificar estado final
    const result = await this.makeRequest('GET', '/sessions');
    this.printResult('2. GET /sessions - Estado final', result);
  }

  generateReport() {
    console.log(
      `\n${this.colors.bright}${this.colors.magenta}📊 REPORTE FINAL${this.colors.reset}\n`,
    );
    const totalTests = this.results.length;
    const passedTests = this.results.filter(
      (r) => r.status === r.expectedStatus,
    ).length;
    const failedTests = totalTests - passedTests;
    const avgResponseTime = Math.round(
      this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests,
    );

    console.log(`📈 Total de pruebas: ${totalTests}`);
    console.log(
      `${this.colors.green}✅ Exitosas: ${passedTests}${this.colors.reset}`,
    );
    console.log(
      `${this.colors.red}❌ Fallidas: ${failedTests}${this.colors.reset}`,
    );
    console.log(`⏱️ Tiempo promedio de respuesta: ${avgResponseTime}ms`);
    console.log(
      `🎯 Tasa de éxito: ${Math.round((passedTests / totalTests) * 100)}%`,
    );

    if (failedTests > 0) {
      console.log(
        `\n${this.colors.red}❌ PRUEBAS FALLIDAS:${this.colors.reset}`,
      );
      this.results
        .filter((r) => r.status !== r.expectedStatus)
        .forEach((r) => {
          console.log(
            `   • ${r.method} ${r.endpoint} - Status: ${r.status} (Expected: ${r.expectedStatus})`,
          );
          if (r.data.error) console.log(`     Error: ${r.data.error}`);
        });
    }

    // Verificar servidor
    console.log(`\n${this.colors.dim}Configuración:${this.colors.reset}`);
    console.log(`   • Base URL: ${BASE_URL}`);
    console.log(`   • Test Phone: ${TEST_PHONE}`);
    console.log(`   • Timeout: ${TIMEOUT}ms`);
  }

  async checkServerHealth() {
    console.log(
      `${this.colors.bright}${this.colors.blue}🏥 Verificando estado del servidor...${this.colors.reset}`,
    );

    try {
      const result = await this.makeRequest('GET', '/sessions');
      if (result.ok) {
        console.log(
          `${this.colors.green}✅ Servidor respondiendo correctamente${this.colors.reset}`,
        );
        return true;
      } else {
        console.log(
          `${this.colors.red}❌ Servidor respondió con error: ${result.status}${this.colors.reset}`,
        );
        return false;
      }
    } catch (error) {
      console.log(
        `${this.colors.red}❌ No se puede conectar al servidor: ${error.message}${this.colors.reset}`,
      );
      console.log(
        `${this.colors.yellow}💡 Asegúrate de que el servidor esté ejecutándose en ${BASE_URL}${this.colors.reset}`,
      );
      return false;
    }
  }

  async run() {
    console.log(
      `${this.colors.bright}${this.colors.blue}🚀 INICIANDO PRUEBAS COMPLETAS DE ENDPOINTS${this.colors.reset}`,
    );
    console.log(`${'═'.repeat(80)}\n`);

    // Verificar salud del servidor
    const serverOk = await this.checkServerHealth();
    if (!serverOk) {
      console.log(
        `${this.colors.red}❌ No se pueden ejecutar las pruebas sin servidor${this.colors.reset}`,
      );
      return;
    }

    console.log(`${'═'.repeat(80)}\n`);

    try {
      await this.testCRUDEndpoints();
      await this.testWhatsAppEndpoints();
      await this.testErrorCases();
      await this.testCleanup();

      this.generateReport();
    } catch (error) {
      console.error(
        `${this.colors.red}❌ Error durante las pruebas:${this.colors.reset}`,
        error,
      );
    }
  }
}

// Función principal
async function main() {
  // Verificar que fetch esté disponible (Node.js 18+)
  if (typeof fetch === 'undefined') {
    console.error('❌ Este script requiere Node.js 18+ con fetch nativo');
    console.log('💡 O instala node-fetch: npm install node-fetch');
    process.exit(1);
  }

  const tester = new EndpointTester();
  await tester.run();
}

// Manejo de señales para limpieza
process.on('SIGINT', () => {
  console.log('\n🛑 Pruebas interrumpidas por el usuario');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Ejecutar las pruebas
main();
