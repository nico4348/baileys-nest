#!/usr/bin/env node

/**
 * 🧪 Test Suite Completo para Messages API
 *
 * Tests exhaustivos para todos los endpoints de mensajes,
 * con especial enfoque en /messages/send con todos los tipos de media
 *
 * Configuración:
 * - Número objetivo: 573022949109
 * - Sesión: 30ed47f1-eb16-4573-8696-4546ab37dce0
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TARGET_NUMBER: '573022949109',
  SESSION_ID: '30ed47f1-eb16-4573-8696-4546ab37dce0',
  DELAY_BETWEEN_TESTS: 3000, // 3 segundos entre tests (aumentado)
  TIMEOUT: 45000, // 45 segundos timeout (aumentado)
};

// ==================== UTILIDADES ====================
class TestRunner {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m', // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m', // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m', // Reset
    };

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async makeRequest(endpoint, method = 'GET', data = null, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this._performRequest(endpoint, method, data);
        return result;
      } catch (error) {
        if (attempt === retries) {
          return {
            status: 0,
            ok: false,
            error: `Failed after ${retries + 1} attempts: ${error.message}`,
          };
        }

        this.log(
          `⚠️ Intento ${attempt + 1} falló, reintentando en 2s...`,
          'warning',
        );
        await this.delay(2000);
      }
    }
  }

  async _performRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const postData = data ? JSON.stringify(data) : null;

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
        },
        timeout: CONFIG.TIMEOUT,
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const result = responseData ? JSON.parse(responseData) : {};
            resolve({
              status: res.statusCode,
              ok: res.statusCode >= 200 && res.statusCode < 300,
              data: result,
            });
          } catch (error) {
            resolve({
              status: res.statusCode,
              ok: false,
              data: { error: 'Invalid JSON response', raw: responseData },
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Request error: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }
  async runTest(testName, testFunction) {
    this.totalTests++;
    this.log(`🧪 Ejecutando: ${testName}`, 'info');

    try {
      const result = await testFunction();
      if (result.success) {
        this.passedTests++;
        this.log(`✅ PASS: ${testName}`, 'success');
        if (result.data) {
          console.log('   Respuesta:', JSON.stringify(result.data, null, 2));
        }
      } else {
        this.failedTests++;
        this.log(`❌ FAIL: ${testName} - ${result.error}`, 'error');
      }

      this.results.push({
        test: testName,
        success: result.success,
        error: result.error,
        data: result.data,
      });
    } catch (error) {
      this.failedTests++;
      this.log(`❌ ERROR: ${testName} - ${error.message}`, 'error');
      this.results.push({
        test: testName,
        success: false,
        error: error.message,
      });

      // Si es un error de conexión, intentar reconectar
      if (
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED')
      ) {
        this.log(
          '🔄 Detectado problema de conexión, esperando antes del siguiente test...',
          'warning',
        );
        await this.delay(5000); // Esperar 5 segundos adicionales
      }
    }

    await this.delay(CONFIG.DELAY_BETWEEN_TESTS);
  }
  generateReport() {
    this.log('\n📊 REPORTE FINAL DE TESTS', 'info');
    this.log('='.repeat(50), 'info');
    this.log(`Total de tests: ${this.totalTests}`, 'info');
    this.log(`✅ Exitosos: ${this.passedTests}`, 'success');
    this.log(`❌ Fallidos: ${this.failedTests}`, 'error');
    this.log(
      `📈 Tasa de éxito: ${((this.passedTests / this.totalTests) * 100).toFixed(2)}%`,
      'info',
    );

    // Guardar reporte en archivo
    const reportPath = path.join(__dirname, 'test-results.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          summary: {
            total: this.totalTests,
            passed: this.passedTests,
            failed: this.failedTests,
            successRate: (this.passedTests / this.totalTests) * 100,
          },
          results: this.results,
        },
        null,
        2,
      ),
    );

    this.log(`📄 Reporte guardado en: ${reportPath}`, 'info');
  }
}

// ==================== DEFINICIÓN DE TESTS ====================

const TESTS = {
  // ==================== TESTS DE SESIÓN ====================
  async testSessionStatus(runner) {
    const response = await runner.makeRequest(
      `/sessions/${CONFIG.SESSION_ID}/status`,
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Sesión no disponible: ${response.data?.message || 'Error desconocido'}`,
      };
    }

    return {
      success: true,
      data: response.data,
    };
  },

  // ==================== TESTS DE MENSAJES DE TEXTO ====================
  async testSendTextMessage(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'text',
      textData: {
        text: '🧪 Test de mensaje de texto simple desde el endpoint unificado',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  async testSendTextMessageWithEmojis(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'text',
      textData: {
        text: '🎉 Mensaje con emojis: 😀 😂 ❤️ 👍 🔥 💯 🚀 ✨ 🌟 ⭐',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  async testSendLongTextMessage(runner) {
    const longText =
      '📖 Este es un mensaje de texto largo para probar los límites del sistema. ' +
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. ' +
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum. ' +
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui. ' +
      'Officia deserunt mollit anim id est laborum. Fin del mensaje largo.';

    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'text',
      textData: {
        text: longText,
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  // ==================== TESTS DE MEDIA - IMÁGENES ====================
  async testSendImageJPG(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://picsum.photos/800/600.jpg',
        mediaType: 'image',
        caption: '📸 Imagen JPG de prueba (800x600)',
        mimeType: 'image/jpeg',
        fileName: 'test-image.jpg',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },
  async testSendImagePNG(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://httpbin.org/image/png',
        mediaType: 'image',
        caption: '🖼️ Imagen PNG de prueba (400x300)',
        mimeType: 'image/png',
        fileName: 'test-placeholder.png',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  async testSendImageWithoutCaption(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://picsum.photos/600/400.jpg',
        mediaType: 'image',
        mimeType: 'image/jpeg',
        fileName: 'no-caption-image.jpg',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  // ==================== TESTS DE MEDIA - DOCUMENTOS ====================
  async testSendPDFDocument(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        mediaType: 'document',
        caption: '📄 Documento PDF de prueba',
        mimeType: 'application/pdf',
        fileName: 'documento-prueba.pdf',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  async testSendTextDocument(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/04/sample-text-file.txt',
        mediaType: 'document',
        caption: '📝 Archivo de texto plano',
        mimeType: 'text/plain',
        fileName: 'archivo-texto.txt',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  // ==================== TESTS DE MEDIA - AUDIO ====================
  async testSendAudioMP3(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        mediaType: 'audio',
        caption: '🎵 Audio MP3 de prueba',
        mimeType: 'audio/mpeg',
        fileName: 'audio-prueba.mp3',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  async testSendVoiceNote(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        mediaType: 'voiceNote',
        mimeType: 'audio/wav',
        fileName: 'voice-note.wav',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  // ==================== TESTS DE MEDIA - VIDEO ====================
  async testSendVideoMP4(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        mediaType: 'video',
        caption: '🎥 Video MP4 de prueba (1280x720)',
        mimeType: 'video/mp4',
        fileName: 'video-prueba.mp4',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: response.data,
    };
  },

  // ==================== TESTS DE REACCIONES ====================
  async testSendReactionHeart(runner) {
    // Primero enviamos un mensaje para reaccionar
    const textData = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'text',
      textData: {
        text: '📩 Mensaje para reaccionar con corazón',
      },
    };
    const textResponse = await runner.makeRequest(
      '/messages/send',
      'POST',
      textData,
    );

    if (!textResponse.ok || !textResponse.data?.success) {
      return {
        success: false,
        error: 'No se pudo enviar el mensaje base para reaccionar',
      };
    }

    // Esperamos un poco antes de reaccionar
    await runner.delay(3000);

    // Ahora enviamos la reacción
    const reactionData = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'reaction',
      reactionData: {
        emoji: '❤️',
        targetMessageId: textResponse.data.messageId,
      },
    };

    const reactionResponse = await runner.makeRequest(
      '/messages/send',
      'POST',
      reactionData,
    );

    return {
      success: reactionResponse.ok && reactionResponse.data?.success,
      error: reactionResponse.data?.error || `HTTP ${reactionResponse.status}`,
      data: {
        originalMessage: textResponse.data,
        reaction: reactionResponse.data,
      },
    };
  },

  async testSendMultipleReactions(runner) {
    // Enviamos un mensaje base
    const textData = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'text',
      textData: {
        text: '🎭 Mensaje para múltiples reacciones',
      },
    };

    const textResponse = await runner.makeRequest(
      '/messages/send',
      'POST',
      textData,
    );

    if (!textResponse.ok || !textResponse.data?.success) {
      return {
        success: false,
        error: 'No se pudo enviar el mensaje base',
      };
    }

    await runner.delay(2000);

    // Enviamos varias reacciones
    const emojis = ['👍', '😂', '😮', '👎'];
    const reactions = [];

    for (const emoji of emojis) {
      const reactionData = {
        sessionId: CONFIG.SESSION_ID,
        to: CONFIG.TARGET_NUMBER,
        messageType: 'reaction',
        reactionData: {
          emoji: emoji,
          targetMessageId: textResponse.data.messageId,
        },
      };

      const reactionResponse = await runner.makeRequest(
        '/messages/send',
        'POST',
        reactionData,
      );
      reactions.push({
        emoji,
        success: reactionResponse.ok && reactionResponse.data?.success,
        data: reactionResponse.data,
      });

      await runner.delay(1000);
    }

    return {
      success: reactions.every((r) => r.success),
      data: {
        originalMessage: textResponse.data,
        reactions,
      },
    };
  },

  // ==================== TESTS DE VALIDACIÓN Y ERRORES ====================
  async testInvalidSessionId(runner) {
    const data = {
      sessionId: 'invalid-session-id',
      to: CONFIG.TARGET_NUMBER,
      messageType: 'text',
      textData: {
        text: 'Este mensaje debería fallar',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    // Este test es exitoso si la API retorna error correctamente
    return {
      success: !response.ok || !response.data?.success,
      error: response.data?.success
        ? 'La API debería haber fallado con sesión inválida'
        : null,
      data: response.data,
    };
  },

  async testInvalidPhoneNumber(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: 'invalid-phone',
      messageType: 'text',
      textData: {
        text: 'Este mensaje debería fallar',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: !response.ok || !response.data?.success,
      error: response.data?.success
        ? 'La API debería haber fallado con número inválido'
        : null,
      data: response.data,
    };
  },

  async testEmptyTextMessage(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'text',
      textData: {
        text: '',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: !response.ok || !response.data?.success,
      error: response.data?.success
        ? 'La API debería haber fallado con texto vacío'
        : null,
      data: response.data,
    };
  },

  async testInvalidMediaURL(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'invalid-url',
        mediaType: 'image',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: !response.ok || !response.data?.success,
      error: response.data?.success
        ? 'La API debería haber fallado con URL inválida'
        : null,
      data: response.data,
    };
  },

  async testUnsupportedMediaType(runner) {
    const data = {
      sessionId: CONFIG.SESSION_ID,
      to: CONFIG.TARGET_NUMBER,
      messageType: 'media',
      mediaData: {
        url: 'https://example.com/file.unknown',
        mediaType: 'unsupported',
      },
    };

    const response = await runner.makeRequest('/messages/send', 'POST', data);

    return {
      success: !response.ok || !response.data?.success,
      error: response.data?.success
        ? 'La API debería haber fallado con tipo de media no soportado'
        : null,
      data: response.data,
    };
  },

  // ==================== TESTS DE ENDPOINTS DE CONSULTA ====================
  async testGetAllMessages(runner) {
    const response = await runner.makeRequest('/messages');

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: {
        count: response.data?.data?.length || 0,
        sample: response.data?.data?.slice(0, 3), // Muestra solo los primeros 3
      },
    };
  },

  async testGetMessagesBySession(runner) {
    const response = await runner.makeRequest(
      `/messages?session_id=${CONFIG.SESSION_ID}`,
    );

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: {
        count: response.data?.data?.length || 0,
        sample: response.data?.data?.slice(0, 3),
      },
    };
  },

  async testGetTextMessages(runner) {
    const response = await runner.makeRequest(
      `/text-messages?session_id=${CONFIG.SESSION_ID}`,
    );

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: {
        count: response.data?.data?.length || 0,
      },
    };
  },

  async testGetMediaMessages(runner) {
    const response = await runner.makeRequest(
      `/media-messages?session_id=${CONFIG.SESSION_ID}`,
    );

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: {
        count: response.data?.data?.length || 0,
      },
    };
  },

  async testGetReactionMessages(runner) {
    const response = await runner.makeRequest(
      `/reaction-messages?session_id=${CONFIG.SESSION_ID}`,
    );

    return {
      success: response.ok && response.data?.success,
      error: response.data?.error || `HTTP ${response.status}`,
      data: {
        count: response.data?.data?.length || 0,
      },
    };
  },
};

// ==================== EJECUCIÓN PRINCIPAL ====================
async function runAllTests() {
  const runner = new TestRunner();
  runner.log('🚀 INICIANDO SUITE DE TESTS COMPLETA PARA MESSAGES API', 'info');
  runner.log(`📱 Número objetivo: ${CONFIG.TARGET_NUMBER}`, 'info');
  runner.log(`🔑 Sesión: ${CONFIG.SESSION_ID}`, 'info');
  runner.log(`🌐 Base URL: ${CONFIG.BASE_URL}`, 'info');
  runner.log('='.repeat(60), 'info');

  // Tests en orden lógico
  const testSequence = [
    // Verificación inicial
    { name: 'Verificar Estado de Sesión', test: TESTS.testSessionStatus },

    // Tests de texto
    { name: 'Enviar Mensaje de Texto Simple', test: TESTS.testSendTextMessage },
    {
      name: 'Enviar Mensaje con Emojis',
      test: TESTS.testSendTextMessageWithEmojis,
    },
    {
      name: 'Enviar Mensaje de Texto Largo',
      test: TESTS.testSendLongTextMessage,
    },

    // Tests de imágenes
    { name: 'Enviar Imagen JPG', test: TESTS.testSendImageJPG },
    { name: 'Enviar Imagen PNG', test: TESTS.testSendImagePNG },
    {
      name: 'Enviar Imagen sin Caption',
      test: TESTS.testSendImageWithoutCaption,
    },

    // Tests de documentos
    { name: 'Enviar Documento PDF', test: TESTS.testSendPDFDocument },
    { name: 'Enviar Archivo de Texto', test: TESTS.testSendTextDocument },

    // Tests de audio
    { name: 'Enviar Audio MP3', test: TESTS.testSendAudioMP3 },
    { name: 'Enviar Nota de Voz', test: TESTS.testSendVoiceNote },

    // Tests de video
    { name: 'Enviar Video MP4', test: TESTS.testSendVideoMP4 },

    // Tests de reacciones
    { name: 'Enviar Reacción con Corazón', test: TESTS.testSendReactionHeart },
    {
      name: 'Enviar Múltiples Reacciones',
      test: TESTS.testSendMultipleReactions,
    },

    // Tests de validación (errores esperados)
    { name: 'Test Sesión Inválida', test: TESTS.testInvalidSessionId },
    { name: 'Test Número Inválido', test: TESTS.testInvalidPhoneNumber },
    { name: 'Test Texto Vacío', test: TESTS.testEmptyTextMessage },
    { name: 'Test URL Media Inválida', test: TESTS.testInvalidMediaURL },
    {
      name: 'Test Tipo Media No Soportado',
      test: TESTS.testUnsupportedMediaType,
    },

    // Tests de consulta
    { name: 'Obtener Todos los Mensajes', test: TESTS.testGetAllMessages },
    {
      name: 'Obtener Mensajes por Sesión',
      test: TESTS.testGetMessagesBySession,
    },
    { name: 'Obtener Mensajes de Texto', test: TESTS.testGetTextMessages },
    { name: 'Obtener Mensajes de Media', test: TESTS.testGetMediaMessages },
    {
      name: 'Obtener Mensajes de Reacción',
      test: TESTS.testGetReactionMessages,
    },
  ];

  // Ejecutar todos los tests
  for (const { name, test } of testSequence) {
    await runner.runTest(name, () => test(runner));
  }
  // Generar reporte final
  runner.generateReport();

  // Mostrar resumen de conectividad si hubo problemas
  const connectionErrors = runner.results.filter(
    (r) =>
      r.error &&
      (r.error.includes('timeout') || r.error.includes('ECONNREFUSED')),
  );

  if (connectionErrors.length > 0) {
    runner.log(
      `⚠️ Se detectaron ${connectionErrors.length} errores de conexión. El servidor puede estar sobrecargado o reiniciándose.`,
      'warning',
    );
  }

  // Retornar código de salida apropiado (pero no forzar salida inmediata)
  const exitCode = runner.failedTests > 0 ? 1 : 0;
  runner.log(`🏁 Tests completados. Código de salida: ${exitCode}`, 'info');

  // Dar tiempo para que se muestren todos los logs antes de salir
  setTimeout(() => {
    process.exit(exitCode);
  }, 1000);
}

// ==================== MANEJO DE ARGUMENTOS ====================
function parseArguments() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 Test Suite Completa para Messages API

Uso: node test-messages-complete.js [opciones]

Opciones:
  --help, -h          Mostrar esta ayuda
  --quick, -q         Ejecutar solo tests básicos (más rápido)
  --url <url>         URL base del servidor (default: ${CONFIG.BASE_URL})
  --session <id>      ID de sesión (default: ${CONFIG.SESSION_ID})
  --number <number>   Número objetivo (default: ${CONFIG.TARGET_NUMBER})

Ejemplos:
  node test-messages-complete.js
  node test-messages-complete.js --quick
  node test-messages-complete.js --url http://localhost:4000
  node test-messages-complete.js --session otra-sesion --number 1234567890
`);
    process.exit(0);
  }

  // Procesar argumentos
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        CONFIG.BASE_URL = args[++i];
        break;
      case '--session':
        CONFIG.SESSION_ID = args[++i];
        break;
      case '--number':
        CONFIG.TARGET_NUMBER = args[++i];
        break;
      case '--quick':
      case '-q':
        CONFIG.DELAY_BETWEEN_TESTS = 500; // Más rápido
        break;
    }
  }
}

// ==================== INICIO ====================
if (require.main === module) {
  parseArguments();

  let testsStarted = false; // Flag para evitar ejecuciones duplicadas

  // Verificar si el servidor está disponible
  const serverCheck = http.request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/messages',
      method: 'GET',
      timeout: 10000, // Aumentamos a 10 segundos
    },
    (res) => {
      if (!testsStarted) {
        testsStarted = true;
        console.log('🌟 Server is running, starting complete test suite...\n');
        runAllTests().catch((error) => {
          console.error('❌ Error fatal en la ejecución de tests:', error);
          process.exit(1);
        });
      }
    },
  );

  serverCheck.on('error', (err) => {
    if (!testsStarted) {
      console.log('❌ Server not running. Please start the server first:');
      console.log('   npm start\n');
      process.exit(1);
    }
  });

  serverCheck.on('timeout', () => {
    if (!testsStarted) {
      testsStarted = true;
      console.log(
        '⏰ Server connection timeout during initial check. Attempting to continue with tests...',
      );
      runAllTests().catch((error) => {
        console.error('❌ Error fatal en la ejecución de tests:', error);
        process.exit(1);
      });
    }
  });

  serverCheck.end();
}

module.exports = { TestRunner, TESTS, CONFIG };
