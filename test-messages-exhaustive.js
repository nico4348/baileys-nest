/**
 * 🧪 TEST EXHAUSTIVO - Messages Send Endpoint
 * =============================================
 *
 * Script completo para probar el endpoint unificado /messages/send
 * con todos los tipos de media y escenarios posibles.
 *
 * Configuración:
 * - Número objetivo: 573022949109
 * - Sesión: 30ed47f1-eb16-4573-8696-4546ab37dce0
 * - Base URL: http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';
const TARGET_PHONE = '573022949109';
const SESSION_ID = '30ed47f1-eb16-4573-8696-4546ab37dce0';

// 🎨 Colores para output en consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// 📊 Estadísticas de pruebas
let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  startTime: Date.now(),
};

/**
 * 🛠️ Utilidades para testing
 */
class TestRunner {
  static log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  static logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  static logError(message) {
    this.log(`❌ ${message}`, 'red');
  }

  static logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  static logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  static logSection(title) {
    this.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    this.log(`${colors.bold}${colors.cyan}🧪 ${title}${colors.reset}`);
    this.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  }

  static async sendMessage(testName, payload, expectedSuccess = true) {
    stats.total++;

    try {
      this.logInfo(`Ejecutando: ${testName}`);

      const response = await fetch(`${BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // Validar respuesta según expectativa
      if (expectedSuccess && result.success) {
        stats.passed++;
        this.logSuccess(`${testName} - Mensaje enviado exitosamente`);
        this.log(`   📱 Message ID: ${result.messageId}`, 'cyan');
        this.log(`   🆔 Child ID: ${result.childMessageId}`, 'cyan');
        this.log(`   ⏰ Timestamp: ${result.timestamp}`, 'cyan');
      } else if (!expectedSuccess && !result.success) {
        stats.passed++;
        this.logSuccess(`${testName} - Error esperado capturado correctamente`);
        this.log(`   🚫 Error: ${result.error}`, 'yellow');
      } else {
        stats.failed++;
        this.logError(`${testName} - Resultado inesperado`);
        console.log('   📄 Respuesta completa:', result);
      }

      return result;
    } catch (error) {
      stats.failed++;
      this.logError(`${testName} - Error de conexión: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  static async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static printStats() {
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    const successRate = ((stats.passed / stats.total) * 100).toFixed(1);

    this.log(
      `\n${colors.bold}${colors.magenta}${'='.repeat(60)}${colors.reset}`,
    );
    this.log(
      `${colors.bold}${colors.magenta}📊 RESUMEN DE PRUEBAS${colors.reset}`,
    );
    this.log(`${colors.bold}${colors.magenta}${'='.repeat(60)}${colors.reset}`);

    this.log(`📈 Total de pruebas: ${stats.total}`, 'white');
    this.log(`✅ Exitosas: ${stats.passed}`, 'green');
    this.log(`❌ Fallidas: ${stats.failed}`, 'red');
    this.log(
      `🎯 Tasa de éxito: ${successRate}%`,
      successRate >= 80 ? 'green' : 'red',
    );
    this.log(`⏱️  Duración: ${duration} segundos`, 'cyan');

    this.log(
      `\n${colors.bold}${colors.magenta}${'='.repeat(60)}${colors.reset}\n`,
    );
  }
}

/**
 * 📝 PRUEBAS DE MENSAJES DE TEXTO
 */
async function testTextMessages() {
  TestRunner.logSection('MENSAJES DE TEXTO');

  // Texto simple
  await TestRunner.sendMessage('Texto Simple', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'text',
    textData: {
      text: '¡Hola! Este es un mensaje de prueba desde el endpoint unificado 🚀',
    },
  });

  await TestRunner.delay(2000);

  // Texto largo
  await TestRunner.sendMessage('Texto Largo', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'text',
    textData: {
      text:
        'Este es un mensaje muy largo para probar el límite de caracteres. '.repeat(
          20,
        ) +
        'Final del mensaje extenso para validar el comportamiento del endpoint con contenido voluminoso.',
    },
  });

  await TestRunner.delay(2000);

  // Texto con emojis
  await TestRunner.sendMessage('Texto con Emojis', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'text',
    textData: {
      text: '🎉 ¡Prueba de emojis! 🚀 ❤️ 👍 😂 🔥 💯 ✨ 🌟 💫 ⭐',
    },
  });

  await TestRunner.delay(2000);

  // Texto con caracteres especiales
  await TestRunner.sendMessage('Texto con Caracteres Especiales', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'text',
    textData: {
      text: 'Prueba de caracteres: áéíóúñü ÀÈÌÒÙ çÇ ñÑ ¿¡ @#$%^&*()_+-=[]{}|;:,.<>?',
    },
  });

  await TestRunner.delay(2000);

  // Texto vacío (debería fallar)
  await TestRunner.sendMessage(
    'Texto Vacío (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'text',
      textData: {
        text: '',
      },
    },
    false,
  );

  await TestRunner.delay(2000);
}

/**
 * 🖼️ PRUEBAS DE MENSAJES DE MEDIA
 */
async function testMediaMessages() {
  TestRunner.logSection('MENSAJES DE MEDIA');

  // Imagen JPG
  await TestRunner.sendMessage('Imagen JPG', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://picsum.photos/800/600.jpg',
      mediaType: 'image',
      caption: '📸 Imagen de prueba en formato JPG',
      mimeType: 'image/jpeg',
      fileName: 'test-image.jpg',
    },
  });

  await TestRunner.delay(3000);

  // Imagen PNG
  await TestRunner.sendMessage('Imagen PNG', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',    mediaData: {
      url: 'https://picsum.photos/400/300.png',
      mediaType: 'image',
      caption: '🖼️ Imagen en formato PNG con transparencia',
      mimeType: 'image/png',
      fileName: 'test-placeholder.png',
    },
  });

  await TestRunner.delay(3000);

  // GIF animado
  await TestRunner.sendMessage('GIF Animado', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
      mediaType: 'image',
      caption: '🎬 GIF animado de prueba',
      mimeType: 'image/gif',
      fileName: 'animated-test.gif',
    },
  });

  await TestRunner.delay(3000);

  // Video MP4
  await TestRunner.sendMessage('Video MP4', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      mediaType: 'video',
      caption: '🎥 Video de prueba en formato MP4',
      mimeType: 'video/mp4',
      fileName: 'sample-video.mp4',
    },
  });

  await TestRunner.delay(5000);

  // Audio MP3
  await TestRunner.sendMessage('Audio MP3', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
      mediaType: 'audio',
      caption: '🔊 Audio de prueba en formato MP3',
      mimeType: 'audio/mpeg',
      fileName: 'test-audio.mp3',
    },
  });

  await TestRunner.delay(3000);

  // Nota de voz (Voice Note)
  await TestRunner.sendMessage('Nota de Voz', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
      mediaType: 'voiceNote',
      mimeType: 'audio/wav',
    },
  });

  await TestRunner.delay(3000);

  // Documento PDF
  await TestRunner.sendMessage('Documento PDF', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      mediaType: 'document',
      caption: '📄 Documento PDF de prueba',
      mimeType: 'application/pdf',
      fileName: 'documento-prueba.pdf',
    },
  });

  await TestRunner.delay(3000);

  // Documento de texto
  await TestRunner.sendMessage('Documento TXT', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://www.learningcontainer.com/wp-content/uploads/2020/04/sample-text-file.txt',
      mediaType: 'document',
      caption: '📝 Archivo de texto plano',
      mimeType: 'text/plain',
      fileName: 'archivo-texto.txt',
    },
  });

  await TestRunner.delay(3000);

  // Documento Excel/CSV
  await TestRunner.sendMessage('Documento CSV', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'media',
    mediaData: {
      url: 'https://people.sc.fsu.edu/~jburkardt/data/csv/airtravel.csv',
      mediaType: 'document',
      caption: '📊 Archivo CSV con datos',
      mimeType: 'text/csv',
      fileName: 'datos-prueba.csv',
    },
  });

  await TestRunner.delay(3000);

  // Media sin URL (debería fallar)
  await TestRunner.sendMessage(
    'Media sin URL (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'media',
      mediaData: {
        mediaType: 'image',
        caption: 'Imagen sin URL',
      },
    },
    false,
  );

  await TestRunner.delay(2000);

  // Media con tipo inválido (debería fallar)
  await TestRunner.sendMessage(
    'Media Tipo Inválido (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'media',
      mediaData: {
        url: 'https://example.com/file.xyz',
        mediaType: 'invalid_type',
        caption: 'Tipo de media inválido',
      },
    },
    false,
  );

  await TestRunner.delay(2000);
}

/**
 * 😍 PRUEBAS DE REACCIONES
 */
async function testReactionMessages() {
  TestRunner.logSection('MENSAJES DE REACCIÓN');

  // Primero enviar un mensaje para reaccionar
  const targetMessage = await TestRunner.sendMessage(
    'Mensaje Objetivo para Reacciones',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'text',
      textData: {
        text: '🎯 Este mensaje será el objetivo de las reacciones',
      },
    },
  );

  await TestRunner.delay(3000);

  if (targetMessage.success && targetMessage.messageId) {
    // Reacción con emoji de corazón
    await TestRunner.sendMessage('Reacción Corazón', {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'reaction',
      reactionData: {
        emoji: '❤️',
        targetMessageId: targetMessage.messageId,
      },
    });

    await TestRunner.delay(2000);

    // Reacción thumbs up
    await TestRunner.sendMessage('Reacción Thumbs Up', {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'reaction',
      reactionData: {
        emoji: '👍',
        targetMessageId: targetMessage.messageId,
      },
    });

    await TestRunner.delay(2000);

    // Reacción de risa
    await TestRunner.sendMessage('Reacción Risa', {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'reaction',
      reactionData: {
        emoji: '😂',
        targetMessageId: targetMessage.messageId,
      },
    });

    await TestRunner.delay(2000);

    // Reacción de fuego
    await TestRunner.sendMessage('Reacción Fuego', {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'reaction',
      reactionData: {
        emoji: '🔥',
        targetMessageId: targetMessage.messageId,
      },
    });

    await TestRunner.delay(2000);

    // Quitar reacción (emoji vacío)
    await TestRunner.sendMessage('Quitar Reacción', {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'reaction',
      reactionData: {
        emoji: '',
        targetMessageId: targetMessage.messageId,
      },
    });

    await TestRunner.delay(2000);
  }

  // Reacción sin emoji (debería fallar)
  await TestRunner.sendMessage(
    'Reacción sin Emoji (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'reaction',
      reactionData: {
        targetMessageId: 'any-message-id',
      },
    },
    false,
  );

  await TestRunner.delay(2000);

  // Reacción sin targetMessageId (debería fallar)
  await TestRunner.sendMessage(
    'Reacción sin Target (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'reaction',
      reactionData: {
        emoji: '❤️',
      },
    },
    false,
  );

  await TestRunner.delay(2000);
}

/**
 * 💬 PRUEBAS DE MENSAJES CITADOS (QUOTED)
 */
async function testQuotedMessages() {
  TestRunner.logSection('MENSAJES CITADOS (QUOTED)');

  // Enviar mensaje original
  const originalMessage = await TestRunner.sendMessage('Mensaje Original', {
    sessionId: SESSION_ID,
    to: TARGET_PHONE,
    messageType: 'text',
    textData: {
      text: '📢 Este es el mensaje original que será citado',
    },
  });

  await TestRunner.delay(3000);

  if (originalMessage.success && originalMessage.messageId) {
    // Respuesta citando el mensaje original
    await TestRunner.sendMessage('Respuesta con Cita', {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'text',
      textData: {
        text: '💬 Esta es mi respuesta al mensaje anterior',
      },
      quotedMessageId: {
        remoteJid: `${TARGET_PHONE}@s.whatsapp.net`,
        fromMe: true,
        id: originalMessage.messageId,
      },
    });

    await TestRunner.delay(3000);

    // Media citando mensaje
    await TestRunner.sendMessage('Imagen con Cita', {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'media',
      mediaData: {
        url: 'https://picsum.photos/600/400.jpg',
        mediaType: 'image',
        caption: '🖼️ Imagen como respuesta al mensaje citado',
        mimeType: 'image/jpeg',
        fileName: 'respuesta-imagen.jpg',
      },
      quotedMessageId: {
        remoteJid: `${TARGET_PHONE}@s.whatsapp.net`,
        fromMe: true,
        id: originalMessage.messageId,
      },
    });

    await TestRunner.delay(3000);
  }
}

/**
 * ⚠️ PRUEBAS DE VALIDACIÓN Y ERRORES
 */
async function testValidationErrors() {
  TestRunner.logSection('PRUEBAS DE VALIDACIÓN Y ERRORES');

  // SessionId inválido
  await TestRunner.sendMessage(
    'SessionId Inválido (Error Esperado)',
    {
      sessionId: 'session-inexistente-123',
      to: TARGET_PHONE,
      messageType: 'text',
      textData: {
        text: 'Mensaje con sesión inválida',
      },
    },
    false,
  );

  await TestRunner.delay(2000);

  // Número de teléfono inválido
  await TestRunner.sendMessage(
    'Número Inválido (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: 'numero-invalido',
      messageType: 'text',
      textData: {
        text: 'Mensaje a número inválido',
      },
    },
    false,
  );

  await TestRunner.delay(2000);

  // MessageType inválido
  await TestRunner.sendMessage(
    'MessageType Inválido (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'invalid_type',
      textData: {
        text: 'Mensaje con tipo inválido',
      },
    },
    false,
  );

  await TestRunner.delay(2000);

  // Payload vacío
  await TestRunner.sendMessage('Payload Vacío (Error Esperado)', {}, false);

  await TestRunner.delay(2000);

  // Sin datos específicos del tipo
  await TestRunner.sendMessage(
    'Sin Datos de Texto (Error Esperado)',
    {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'text',
      // falta textData
    },
    false,
  );

  await TestRunner.delay(2000);
}

/**
 * 🚀 PRUEBAS DE RENDIMIENTO Y CONCURRENCIA
 */
async function testPerformanceAndConcurrency() {
  TestRunner.logSection('PRUEBAS DE RENDIMIENTO Y CONCURRENCIA');

  TestRunner.logInfo('Enviando 5 mensajes concurrentes...');

  const concurrentPromises = [];
  for (let i = 1; i <= 5; i++) {
    const promise = TestRunner.sendMessage(`Mensaje Concurrente ${i}`, {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'text',
      textData: {
        text: `🏃‍♂️ Mensaje concurrente número ${i} - Timestamp: ${new Date().toISOString()}`,
      },
    });
    concurrentPromises.push(promise);
  }

  await Promise.all(concurrentPromises);
  TestRunner.logInfo('Mensajes concurrentes completados');

  await TestRunner.delay(3000);

  // Ráfaga de mensajes con delay mínimo
  TestRunner.logInfo('Enviando ráfaga de mensajes con delay mínimo...');
  for (let i = 1; i <= 3; i++) {
    await TestRunner.sendMessage(`Mensaje Ráfaga ${i}`, {
      sessionId: SESSION_ID,
      to: TARGET_PHONE,
      messageType: 'text',
      textData: {
        text: `⚡ Mensaje de ráfaga ${i} - ${new Date().toLocaleTimeString()}`,
      },
    });
    await TestRunner.delay(500); // Delay muy corto
  }
}

/**
 * 🔍 PRUEBAS DE CONSULTA DE MENSAJES
 */
async function testMessageQueries() {
  TestRunner.logSection('PRUEBAS DE CONSULTA DE MENSAJES');

  try {
    // Consultar todos los mensajes
    TestRunner.logInfo('Consultando todos los mensajes...');
    const allMessages = await fetch(`${BASE_URL}/messages`);
    const allMessagesData = await allMessages.json();
    TestRunner.logSuccess(
      `Total de mensajes encontrados: ${allMessagesData.length}`,
    );

    await TestRunner.delay(1000);

    // Consultar mensajes de texto
    TestRunner.logInfo('Consultando mensajes de texto...');
    const textMessages = await fetch(`${BASE_URL}/text-messages`);
    const textMessagesData = await textMessages.json();
    TestRunner.logSuccess(
      `Mensajes de texto encontrados: ${textMessagesData.length}`,
    );

    await TestRunner.delay(1000);

    // Consultar mensajes de media
    TestRunner.logInfo('Consultando mensajes de media...');
    const mediaMessages = await fetch(`${BASE_URL}/media-messages`);
    const mediaMessagesData = await mediaMessages.json();
    TestRunner.logSuccess(
      `Mensajes de media encontrados: ${mediaMessagesData.length}`,
    );

    await TestRunner.delay(1000);

    // Consultar reacciones
    TestRunner.logInfo('Consultando reacciones...');
    const reactions = await fetch(`${BASE_URL}/reaction-messages`);
    const reactionsData = await reactions.json();
    TestRunner.logSuccess(`Reacciones encontradas: ${reactionsData.length}`);
  } catch (error) {
    TestRunner.logError(`Error consultando mensajes: ${error.message}`);
  }
}

/**
 * 🏁 FUNCIÓN PRINCIPAL
 */
async function runAllTests() {
  TestRunner.log(
    `${colors.bold}${colors.cyan}🚀 INICIANDO PRUEBAS EXHAUSTIVAS DEL ENDPOINT /messages/send${colors.reset}\n`,
  );
  TestRunner.log(`📱 Número objetivo: ${TARGET_PHONE}`, 'yellow');
  TestRunner.log(`🔑 Sesión: ${SESSION_ID}`, 'yellow');
  TestRunner.log(`🌐 Base URL: ${BASE_URL}`, 'yellow');
  TestRunner.log(`⏰ Inicio: ${new Date().toLocaleString()}\n`, 'yellow');

  try {
    // Verificar estado de sesión
    TestRunner.logInfo('Verificando estado de la sesión...');
    const sessionStatus = await fetch(
      `${BASE_URL}/sessions/${SESSION_ID}/status`,
    );
    const sessionData = await sessionStatus.json();

    if (sessionData.connected) {
      TestRunner.logSuccess('Sesión conectada y lista para pruebas');
    } else {
      TestRunner.logWarning(
        '⚠️ ADVERTENCIA: Sesión no conectada, las pruebas pueden fallar',
      );
    }

    await TestRunner.delay(2000);

    // Ejecutar todas las pruebas
    await testTextMessages();
    await testMediaMessages();
    await testReactionMessages();
    await testQuotedMessages();
    await testValidationErrors();
    await testPerformanceAndConcurrency();
    await testMessageQueries();

    // Mostrar estadísticas finales
    TestRunner.printStats();

    TestRunner.log(
      `${colors.bold}${colors.green}🎉 PRUEBAS COMPLETADAS${colors.reset}`,
      'green',
    );
    TestRunner.log(`⏰ Finalizado: ${new Date().toLocaleString()}`, 'yellow');
  } catch (error) {
    TestRunner.logError(`Error crítico durante las pruebas: ${error.message}`);
    console.error(error);
  }
}

// 🏃‍♂️ Ejecutar todas las pruebas
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  TestRunner,
  TARGET_PHONE,
  SESSION_ID,
  BASE_URL,
};
