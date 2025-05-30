#!/usr/bin/env node

/**
 * Test script to verify UUID workflow for quoted messages and reactions
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testUUIDWorkflow() {
  console.log('🚀 Testing UUID workflow...\n');

  try {
    // Step 1: Send a simple text message
    console.log('📤 Step 1: Sending text message...');
    const textResponse = await makeRequest('/messages/send', 'POST', {
      sessionId: '30ed47f1-eb16-4573-8696-4546ab37dce0',
      to: '573022949109',
      messageType: 'text',
      textData: {
        text: 'Test message for UUID workflow',
      },
    });

    console.log(`   Status: ${textResponse.statusCode}`);
    console.log(`   Body: ${textResponse.body}`);

    if (textResponse.statusCode !== 201) {
      throw new Error('Failed to send text message');
    }
    const textData = JSON.parse(textResponse.body);
    const messageUUID = textData.messageId;
    console.log(`   ✅ Message sent with UUID: ${messageUUID}\n`);

    // Step 2: Send a quoted message using the UUID
    console.log('📤 Step 2: Sending quoted message...');
    const quotedResponse = await makeRequest('/messages/send', 'POST', {
      sessionId: '30ed47f1-eb16-4573-8696-4546ab37dce0',
      to: '573022949109',
      messageType: 'text',
      textData: {
        text: 'This is a quoted message!',
      },
      quotedMessageId: messageUUID,
    });

    console.log(`   Status: ${quotedResponse.statusCode}`);
    console.log(`   Body: ${quotedResponse.body}`);

    if (quotedResponse.statusCode === 201) {
      const quotedData = JSON.parse(quotedResponse.body);
      console.log(
        `   ✅ Quoted message sent with UUID: ${quotedData.messageId}\n`,
      );
    } else {
      console.log(`   ❌ Failed to send quoted message\n`);
    }

    // Step 3: Send a reaction using the UUID
    console.log('📤 Step 3: Sending reaction...');
    const reactionResponse = await makeRequest('/messages/send', 'POST', {
      sessionId: '30ed47f1-eb16-4573-8696-4546ab37dce0',
      to: '573022949109',
      messageType: 'reaction',
      reactionData: {
        emoji: '❤️',
        targetMessageId: messageUUID,
      },
    });

    console.log(`   Status: ${reactionResponse.statusCode}`);
    console.log(`   Body: ${reactionResponse.body}`);

    if (reactionResponse.statusCode === 201) {
      const reactionData = JSON.parse(reactionResponse.body);
      console.log(`   ✅ Reaction sent with UUID: ${reactionData.messageId}\n`);
    } else {
      console.log(`   ❌ Failed to send reaction\n`);
    }

    console.log('✅ UUID workflow test completed!');
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Check if server is running first
const serverCheck = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/messages',
    method: 'GET',
    timeout: 2000,
  },
  (res) => {
    console.log('🌟 Server is running, starting UUID workflow test...\n');
    testUUIDWorkflow();
  },
);

serverCheck.on('error', (err) => {
  console.log('❌ Server not running. Please start the server first:');
  console.log('   npm start\n');
});

serverCheck.on('timeout', () => {
  console.log(
    '⏰ Server connection timeout. Make sure the server is running on port 3000.',
  );
});

serverCheck.end();
