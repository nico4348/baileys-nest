#!/usr/bin/env node

/**
 * Test script for the unified /messages/send endpoint
 * Tests all three message types: text, media, and reaction
 */

const https = require('http');

const BASE_URL = 'http://localhost:3000';

// Test data
const testRequests = [
  {
    name: 'Text Message',
    url: '/messages/send',
    method: 'POST',
    data: {
      sessionId: 'test-session-123',
      to: '1234567890',
      messageType: 'text',
      textData: {
        text: '¡Hola! Este es un mensaje de prueba desde el endpoint unificado.'
      },
      quotedMessageId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    }
  },
  {
    name: 'Media Message',
    url: '/messages/send',
    method: 'POST',
    data: {
      sessionId: 'test-session-123',
      to: '1234567890',
      messageType: 'media',
      mediaData: {
        url: 'https://example.com/test-image.jpg',
        mediaType: 'image',
        caption: 'Imagen de prueba desde endpoint unificado',
        mimeType: 'image/jpeg',
        fileName: 'test-image.jpg'
      },
      quotedMessageId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    }
  },
  {
    name: 'Reaction Message',
    url: '/messages/send',
    method: 'POST',
    data: {
      sessionId: 'test-session-123',
      to: '1234567890',
      messageType: 'reaction',
      reactionData: {
        emoji: '❤️',
        targetMessageId: 'target-message-123'
      }
    }
  }
];

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(test.data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: test.url,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing unified /messages/send endpoint...\n');

  for (const test of testRequests) {
    try {
      console.log(`📤 Testing: ${test.name}`);
      console.log(`   Request: ${test.method} ${test.url}`);
      console.log(`   Data: ${JSON.stringify(test.data, null, 2)}`);
      
      const response = await makeRequest(test);
      
      console.log(`   Response Status: ${response.statusCode}`);
      console.log(`   Response Body: ${response.body}`);
      
      if (response.statusCode === 200 || response.statusCode === 201) {
        console.log(`   ✅ ${test.name} - SUCCESS\n`);
      } else {
        console.log(`   ❌ ${test.name} - FAILED (Status: ${response.statusCode})\n`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${test.name} - ERROR: ${error.message}\n`);
    }
  }

  console.log('✅ All tests completed!');
}

// Only run if server is available
const serverCheck = https.request({
  hostname: 'localhost',
  port: 3000,
  path: '/messages',
  method: 'GET',
  timeout: 2000
}, (res) => {
  console.log('🌟 Server is running, starting tests...\n');
  runTests();
});

serverCheck.on('error', (err) => {
  console.log('❌ Server not running. Please start the server first:');
  console.log('   npm start\n');
  console.log('   Then run this test script again.');
});

serverCheck.on('timeout', () => {
  console.log('⏰ Server connection timeout. Make sure the server is running on port 3000.');
});

serverCheck.end();