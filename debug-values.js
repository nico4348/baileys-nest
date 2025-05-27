const axios = require('axios');

async function debugValues() {
  try {
    console.log('=== Debug: Testing serialization values ===');

    // Get first session log
    const response = await axios.get(
      'http://localhost:3000/session-logs?limit=1',
    );
    const logs = response.data;

    if (logs && logs.length > 0) {
      const log = logs[0];
      console.log('Raw log object:');
      console.log(JSON.stringify(log, null, 2));

      console.log('\nIndividual properties:');
      console.log('id:', log.id, '(type:', typeof log.id, ')');
      console.log(
        'sessionId:',
        log.sessionId,
        '(type:',
        typeof log.sessionId,
        ')',
      );
      console.log('logType:', log.logType, '(type:', typeof log.logType, ')');
      console.log('message:', log.message, '(type:', typeof log.message, ')');
      console.log(
        'createdAt:',
        log.createdAt,
        '(type:',
        typeof log.createdAt,
        ')',
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugValues();
