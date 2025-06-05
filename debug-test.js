import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1, // Solo 1 usuario virtual
  duration: '10s', // Solo 10 segundos
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  console.log('🚀 Starting test iteration...');

  // Test send text message
  const payload = JSON.stringify({
    sessionId: 'debug-test',
    to: '573022949109',
    messageType: 'text',
    textData: {
      text: 'Debug test message',
    },
  });

  console.log('📤 Sending request...');
  const startTime = Date.now();

  const response = http.post(`${BASE_URL}/messages/send-text`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const endTime = Date.now();
  console.log(`⏱️ Response received in ${endTime - startTime}ms`);
  console.log(`📊 Status: ${response.status}`);
  console.log(`📝 Body: ${response.body}`);

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  if (success) {
    console.log('✅ Test passed!');
  } else {
    console.log('❌ Test failed!');
  }

  sleep(1);
}
