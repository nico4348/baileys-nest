const http = require('http');

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Testing /session-logs response...');

  try {
    const response = await makeRequest('GET', '/session-logs/recent?limit=1');

    console.log('Status:', response.statusCode);
    console.log('Response type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));

    if (response.data && response.data.length > 0) {
      const firstLog = response.data[0];
      console.log('\nFirst log structure:');
      console.log('Keys:', Object.keys(firstLog));
      console.log('ID:', typeof firstLog.id, firstLog.id);
      console.log('SessionId:', typeof firstLog.sessionId, firstLog.sessionId);
      console.log('LogType:', typeof firstLog.logType, firstLog.logType);
    }

    // Also test with string UUIDs
    console.log('\n--- Testing UUID validation ---');
    const invalidResponse = await makeRequest(
      'GET',
      '/session-logs/invalid-uuid-123',
    );
    console.log('Invalid UUID response:', invalidResponse.statusCode);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
