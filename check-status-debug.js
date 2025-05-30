const http = require('http');

// Function to make requests
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

async function debugStatuses() {
  console.log('🔍 Debugging Status Information...\n');

  try {
    // Get all statuses to see what IDs correspond to what names
    console.log('📋 Getting all available statuses...');
    const statusResponse = await makeRequest('/status', 'GET');
    if (statusResponse.statusCode === 200) {
      const statuses = JSON.parse(statusResponse.body);
      console.log('Available statuses:');

      // Status hierarchy mapping (from BaileysStatusMapper)
      const statusHierarchy = {
        message_receipt: 0,
        validated: 1,
        sent: 2,
        delivered: 3,
        read: 4,
        played: 5,
        failed: 99,
      };

      statuses.forEach((s) => {
        const level = statusHierarchy[s.name.value] ?? -1;
        console.log(
          `  ID: ${s.id.value} - Name: ${s.name.value} - Level: ${level}`,
        );
      });
    } else {
      console.log('Failed to get statuses:', statusResponse.body);
    }

    console.log('\n' + '='.repeat(50));

    // Send a test message
    console.log('\n📤 Sending test message...');
    const messageResponse = await makeRequest('/messages/send', 'POST', {
      sessionId: '30ed47f1-eb16-4573-8696-4546ab37dce0',
      to: '573022949109',
      messageType: 'text',
      textData: {
        text: 'Debug status flow test',
      },
    });

    if (messageResponse.statusCode === 201) {
      const data = JSON.parse(messageResponse.body);
      const messageId = data.messageId;
      console.log(`✅ Message sent with UUID: ${messageId}`);

      // Wait a bit for status processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get message status history
      console.log('\n📊 Getting message status history...');
      const statusHistoryResponse = await makeRequest(
        `/message-status/message/${messageId}`,
        'GET',
      );

      if (statusHistoryResponse.statusCode === 200) {
        const statusHistory = JSON.parse(statusHistoryResponse.body);
        console.log(`Found ${statusHistory.length} status records:`);

        statusHistory.forEach((status, index) => {
          console.log(
            `  ${index + 1}. Status ID: ${status.status_id.value} - Created: ${status.created_at.value}`,
          );
        });

        // Now map the status IDs to names using the statuses we got earlier
        if (statusResponse.statusCode === 200) {
          const statuses = JSON.parse(statusResponse.body);
          const statusMap = {};
          statuses.forEach((s) => {
            statusMap[s.id.value] = {
              name: s.name.value,
              level: s.hierarchy_level.value,
            };
          });

          console.log('\n📋 Status History with Names:');
          statusHistory.forEach((status, index) => {
            const statusInfo = statusMap[status.status_id.value];
            if (statusInfo) {
              console.log(
                `  ${index + 1}. ${statusInfo.name} (Level: ${statusInfo.level}) - ${status.created_at.value}`,
              );
            } else {
              console.log(
                `  ${index + 1}. Unknown Status ID: ${status.status_id.value} - ${status.created_at.value}`,
              );
            }
          });
        }
      } else {
        console.log(
          'Failed to get status history:',
          statusHistoryResponse.body,
        );
      }
    } else {
      console.log('Failed to send message:', messageResponse.body);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugStatuses()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
