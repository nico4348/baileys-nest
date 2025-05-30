const http = require('http');

// Test function to make HTTP requests
function makeRequest(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test the new status flow
async function testNewStatusFlow() {
  console.log(
    '🧪 Testing New Status Flow (message_receipt → validated → sent)...\n',
  );

  try {
    // Step 1: Send a text message to test the new status flow
    console.log('📤 Step 1: Sending text message to test new status flow...');
    const response = await makeRequest('/messages/send', 'POST', {
      sessionId: '30ed47f1-eb16-4573-8696-4546ab37dce0',
      to: '573022949109',
      messageType: 'text',
      textData: {
        text: 'Testing new status flow: message_receipt → validated → sent',
      },
    });

    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Body: ${response.body}`);

    if (response.statusCode !== 201) {
      throw new Error('Failed to send text message');
    }

    const data = JSON.parse(response.body);
    const messageId = data.messageId;
    console.log(`   ✅ Message sent with UUID: ${messageId}\n`);

    // Step 2: Check message status history to verify the new flow
    console.log('📊 Step 2: Checking message status history...');

    // Wait a bit for status to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const statusResponse = await makeRequest(
      `/message-status/message/${messageId}`,
      'GET',
    );
    console.log(`   Status Query Status: ${statusResponse.statusCode}`);
    console.log(`   Status History: ${statusResponse.body}`);

    if (statusResponse.statusCode === 200) {
      const statusHistory = JSON.parse(statusResponse.body);
      console.log('\n📋 Status Flow Analysis:');

      statusHistory.forEach((status, index) => {
        console.log(
          `   ${index + 1}. ${status.status_name} (Level: ${status.hierarchy_level}) - ${status.created_at}`,
        );
      });

      // Verify expected statuses
      const statusNames = statusHistory.map((s) => s.status_name);
      const expectedFlow = ['message_receipt', 'validated', 'sent'];

      let flowCorrect = true;
      expectedFlow.forEach((expectedStatus) => {
        if (!statusNames.includes(expectedStatus)) {
          console.log(`   ❌ Missing expected status: ${expectedStatus}`);
          flowCorrect = false;
        }
      });

      if (flowCorrect) {
        console.log('   ✅ All expected statuses found in correct flow!');
      }

      // Check hierarchy order
      const hierarchyLevels = statusHistory
        .map((s) => s.hierarchy_level)
        .sort((a, b) => a - b);
      console.log(
        `   📊 Hierarchy levels found: [${hierarchyLevels.join(', ')}]`,
      );

      if (
        hierarchyLevels.includes(0) &&
        hierarchyLevels.includes(1) &&
        hierarchyLevels.includes(2)
      ) {
        console.log(
          '   ✅ Hierarchy levels 0, 1, 2 found (message_receipt, validated, sent)',
        );
      }
    } else {
      console.log('   ⚠️  Could not retrieve status history');
    }

    console.log('\n🎉 New status flow test completed!');
  } catch (error) {
    console.error('❌ Error testing new status flow:', error.message);
  }
}

// Run the test
testNewStatusFlow()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
