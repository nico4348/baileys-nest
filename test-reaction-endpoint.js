const axios = require('axios');

// Tu petición exacta
const requestData = {
  sessionId: '30ed47f1-eb16-4573-8696-4546ab37dce0',
  to: '573022949109',
  messageType: 'reaction',
  reactionData: {
    emoji: '❤️',
    targetMessageId: {
      key: {
        remoteJid: '573022949109@s.whatsapp.net',
        fromMe: true,
        id: '3EB0F5C6C4161AE03B70B3',
      },
      message: {
        imageMessage: {
          url: 'https://mmg.whatsapp.net/o1/v/t24/f2/m233/AQMXMsc8JdX518bPKQdzZWu9fe1vHRNsJz3wUOY8eA0P9Sd9JPHCR_8I8K_h81QB3vUlbaxUFa5GG71SPsmvdzPqGBwr4w5qYveVoEu0Iw?ccb=9-4&oh=01_Q5Aa1gHUdAQKjwSQirWix4d6KHi70N9Q8qtUBjpIRmEv1GRclA&oe=68603475&_nc_sid=e6ed6c&mms3=true',
          mimetype: 'image/jpeg',
          caption: 'Imagen de prueba',
          fileSha256: '4Kgj66KEUoXst2x2/rIIawF+RcZpLohoqlxsziNXEzw=',
          fileLength: '35766',
          mediaKey: 'B1RO/kBvnQwt9mTWTGjiIDkOi7B0oiZKyTq2CtBuwXQ=',
          fileEncSha256: 'IkMNQ87iSUL1RmZTw3+MIRnEFm/xrlQyAkkvC3Uith4=',
          directPath:
            '/o1/v/t24/f2/m233/AQMXMsc8JdX518bPKQdzZWu9fe1vHRNsJz3wUOY8eA0P9Sd9JPHCR_8I8K_h81QB3vUlbaxUFa5GG71SPsmvdzPqGBwr4w5qYveVoEu0Iw?ccb=9-4&oh=01_Q5Aa1gHUdAQKjwSQirWix4d6KHi70N9Q8qtUBjpIRmEv1GRclA&oe=68603475&_nc_sid=e6ed6c',
          mediaKeyTimestamp: '1748554750',
          contextInfo: {
            participant: '573229781433@s.whatsapp.net',
            quotedMessage: {
              conversation: 'This is a quoted message',
            },
          },
        },
      },
      messageTimestamp: '1748554750',
      status: 'PENDING',
    },
  },
};

async function testReactionEndpoint() {
  try {
    console.log('🚀 Enviando petición de reacción...');
    console.log('📋 Datos:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      'http://localhost:3000/messages/send',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Respuesta exitosa:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Headers:', error.response.headers);
    }
  }
}

testReactionEndpoint();
