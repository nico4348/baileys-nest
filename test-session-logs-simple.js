/**
 * SessionLogs API - Tests Rápidos
 *
 * Script simplificado para hacer pruebas básicas de los endpoints de SessionLogs
 *
 * Uso:
 * node test-session-logs-simple.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Función simple para hacer requests
function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);

    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Tests básicos
async function basicTests() {
  console.log('🚀 Iniciando tests básicos de SessionLogs API\n');

  // Test 1: Obtener todos los logs
  console.log('📋 Test 1: GET /session-logs');
  try {
    const result = await request('GET', '/session-logs');
    console.log(`   Status: ${result.status}`);
    console.log(`   Logs encontrados: ${result.data ? result.data.length : 0}`);

    if (result.data && result.data.length > 0) {
      console.log(
        `   Primer log: ${result.data[0].logType} - ${result.data[0].message}`,
      );
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Logs recientes
  console.log('\n🕒 Test 2: GET /session-logs/recent?limit=5');
  try {
    const result = await request('GET', '/session-logs/recent?limit=5');
    console.log(`   Status: ${result.status}`);
    console.log(`   Logs recientes: ${result.data ? result.data.length : 0}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Logs por sesión (usar primera sesión disponible)
  console.log('\n🔍 Test 3: Obtener sesiones y sus logs');
  try {
    const sessionsResult = await request('GET', '/sessions');
    if (
      sessionsResult.status === 200 &&
      sessionsResult.data &&
      sessionsResult.data.length > 0
    ) {
      const sessionId = sessionsResult.data[0].id;
      console.log(`   Usando sesión: ${sessionId}`);

      const logsResult = await request(
        'GET',
        `/session-logs/session/${sessionId}`,
      );
      console.log(`   Status: ${logsResult.status}`);
      console.log(
        `   Logs de la sesión: ${logsResult.data ? logsResult.data.length : 0}`,
      );

      if (logsResult.data && logsResult.data.length > 0) {
        const types = [...new Set(logsResult.data.map((log) => log.logType))];
        console.log(`   Tipos de logs: ${types.join(', ')}`);
      }
    } else {
      console.log('   ⚠️  No hay sesiones disponibles');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 4: Logs por tipo específico
  console.log('\n📊 Test 4: GET /session-logs/session/:id/type/SESSION_START');
  try {
    const sessionsResult = await request('GET', '/sessions');
    if (
      sessionsResult.status === 200 &&
      sessionsResult.data &&
      sessionsResult.data.length > 0
    ) {
      const sessionId = sessionsResult.data[0].id;

      const result = await request(
        'GET',
        `/session-logs/session/${sessionId}/type/SESSION_START`,
      );
      console.log(`   Status: ${result.status}`);
      console.log(
        `   Logs SESSION_START: ${result.data ? result.data.length : 0}`,
      );
    } else {
      console.log('   ⚠️  No hay sesiones disponibles');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 5: Cleanup simulation (solo verificar endpoint)
  console.log('\n🧹 Test 5: DELETE /session-logs/cleanup/old?days=999');
  console.log('   (Usando days=999 para no eliminar datos reales)');
  try {
    const result = await request(
      'DELETE',
      '/session-logs/cleanup/old?days=999',
    );
    console.log(`   Status: ${result.status}`);
    if (result.data) {
      console.log(`   Mensaje: ${result.data.message}`);
      console.log(`   Logs eliminados: ${result.data.deletedCount || 0}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n✅ Tests básicos completados');
}

// Ejecutar tests
basicTests().catch(console.error);
