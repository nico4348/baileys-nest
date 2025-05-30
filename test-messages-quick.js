#!/usr/bin/env node

/**
 * 🚀 Test Rápido para Messages Send Endpoint
 *
 * Script simplificado para pruebas rápidas del endpoint /messages/send
 * Enfocado en los casos más comunes y tipos de media principales
 */

const fetch = require('node-fetch');

// Configuración
const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TARGET_NUMBER: '573022949109',
  SESSION_ID: '30ed47f1-eb16-4573-8696-4546ab37dce0',
};

// Utilidad para hacer requests
async function sendMessage(data) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ ${data.messageType.toUpperCase()}: Enviado exitosamente`);
      console.log(`   📱 Message ID: ${result.messageId}`);
      console.log(`   ⏰ Timestamp: ${result.timestamp}\n`);
    } else {
      console.log(
        `❌ ${data.messageType.toUpperCase()}: Error - ${result.error}\n`,
      );
    }

    return result;
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

// Función para esperar entre envíos
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tests principales
async function runQuickTests() {
  console.log('🧪 TESTS RÁPIDOS - MESSAGES SEND ENDPOINT');
  console.log('==========================================');
  console.log(`📱 Número: ${CONFIG.TARGET_NUMBER}`);
  console.log(`🔑 Sesión: ${CONFIG.SESSION_ID}`);
  console.log(`🌐 URL: ${CONFIG.BASE_URL}\n`);

  const tests = [
    // 1. Texto simple
    {
      name: 'Mensaje de Texto',
      data: {
        sessionId: CONFIG.SESSION_ID,
        to: CONFIG.TARGET_NUMBER,
        messageType: 'text',
        textData: {
          text: '🧪 Test: Mensaje de texto desde script automatizado',
        },
      },
    },

    // 2. Imagen
    {
      name: 'Imagen JPG',
      data: {
        sessionId: CONFIG.SESSION_ID,
        to: CONFIG.TARGET_NUMBER,
        messageType: 'media',
        mediaData: {
          url: 'https://picsum.photos/600/400.jpg',
          mediaType: 'image',
          caption: '📸 Test: Imagen JPG con caption',
          mimeType: 'image/jpeg',
          fileName: 'test-image.jpg',
        },
      },
    }, // 3. Documento PDF
    {
      name: 'Documento PDF',
      data: {
        sessionId: CONFIG.SESSION_ID,
        to: CONFIG.TARGET_NUMBER,
        messageType: 'media',
        mediaData: {
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          mediaType: 'document',
          caption: '📄 Test: Documento PDF',
          mimeType: 'application/pdf',
          fileName: 'test-document.pdf',
        },
      },
    },

    // 4. Audio MP3
    {
      name: 'Audio MP3',
      data: {
        sessionId: CONFIG.SESSION_ID,
        to: CONFIG.TARGET_NUMBER,
        messageType: 'media',
        mediaData: {
          url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
          mediaType: 'audio',
          caption: '🎵 Test: Audio MP3',
          mimeType: 'audio/mpeg',
          fileName: 'test-audio.mp3',
        },
      },
    },

    // 5. Video MP4
    {
      name: 'Video MP4',
      data: {
        sessionId: CONFIG.SESSION_ID,
        to: CONFIG.TARGET_NUMBER,
        messageType: 'media',
        mediaData: {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          mediaType: 'video',
          caption: '🎥 Test: Video MP4',
          mimeType: 'video/mp4',
          fileName: 'test-video.mp4',
        },
      },
    },
  ];

  let successCount = 0;
  let totalCount = tests.length;

  for (const test of tests) {
    console.log(`📤 Enviando: ${test.name}...`);
    const result = await sendMessage(test.data);

    if (result.success) {
      successCount++;
    }

    // Esperar 3 segundos entre envíos
    await delay(3000);
  }

  // Esperar un poco antes de enviar reacción
  console.log('⏳ Esperando antes de enviar reacción...\n');
  await delay(5000);

  // 6. Enviar una reacción al primer mensaje
  console.log('📤 Enviando: Reacción...');
  await sendMessage({
    sessionId: CONFIG.SESSION_ID,
    to: CONFIG.TARGET_NUMBER,
    messageType: 'reaction',
    reactionData: {
      emoji: '❤️',
      targetMessageId: 'ultimo-mensaje-id', // En una implementación real, usarías el ID del último mensaje
    },
  });

  // Resumen final
  console.log('\n📊 RESUMEN DE TESTS');
  console.log('===================');
  console.log(`✅ Exitosos: ${successCount}/${totalCount}`);
  console.log(
    `📈 Tasa de éxito: ${((successCount / totalCount) * 100).toFixed(1)}%`,
  );

  if (successCount === totalCount) {
    console.log('🎉 ¡Todos los tests pasaron exitosamente!');
  } else {
    console.log('⚠️  Algunos tests fallaron. Revisar logs arriba.');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runQuickTests().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { sendMessage, CONFIG };
