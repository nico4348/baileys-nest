import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s', // Run for 30 seconds
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test send text message
  const payload = JSON.stringify({
    sessionId: '30ed47f1-eb16-4573-8696-4546ab37dce0',
    to: '573022949109',
    messageType: 'text',
    textData: {
      text: 'Esta es mi respuesta al mensaje anterior.',
    },
  });
  const response = http.post(`${BASE_URL}/messages/send-text`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  // Log response details for debugging
  if (response.status !== 201) {
    console.log(
      `❌ Request failed with status ${response.status}: ${response.body}`,
    );
  } else {
    console.log(`✅ Request succeeded: ${response.status}`);
  }

  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
