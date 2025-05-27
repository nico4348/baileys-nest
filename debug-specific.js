const axios = require('axios');

async function testSpecificLog() {
  try {
    console.log('=== Testing a specific log endpoint ===');

    // Get recent logs with a limit of 1
    const response = await axios.get(
      'http://localhost:3000/session-logs/recent?limit=1',
    );
    const logs = response.data;

    if (logs && logs.length > 0) {
      const log = logs[0];
      console.log('Raw response object:');
      console.log(JSON.stringify(log, null, 2));

      console.log('\nDetailed inspection:');
      for (const [key, value] of Object.entries(log)) {
        console.log(`${key}: ${value} (type: ${typeof value})`);
        if (typeof value === 'object' && value !== null) {
          console.log(`  ${key} constructor: ${value.constructor.name}`);
          console.log(`  ${key} toString: ${value.toString()}`);
          if (value.toJSON) {
            console.log(`  ${key} toJSON: ${value.toJSON()}`);
          }
        }
      }
    } else {
      console.log('No logs returned');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSpecificLog();
