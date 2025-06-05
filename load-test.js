import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 50 }, // Stay at 50 users for 5 minutes
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.1'], // Error rate must be lower than 10%
    errors: ['rate<0.1'], // Custom error rate must be lower than 10%
  },
};

const BASE_URL = 'http://localhost:3000';
const SESSION_ID = '628f918f-e9a7-4bca-9aa5-f55fb7a53f2f';
const TEST_PHONE = '573022949109';

// Test data
const testMessages = [
  'Hola, este es un mensaje de prueba de carga',
  'Probando la capacidad del sistema',
  'Mensaje número 3 de la prueba',
  'Sistema de mensajería bajo carga',
  'Test de sobrecarga del servidor',
];

const mediaUrls = [
  'https://via.placeholder.com/150',
  'https://via.placeholder.com/300',
  'https://via.placeholder.com/500',
];

const emojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function () {
  const testScenario = Math.random();

  // 50% Text messages
  if (testScenario < 0.5) {
    testSendTextMessage();
  }
  // 30% Media messages
  else if (testScenario < 0.8) {
    testSendMediaMessage();
  }
  // 15% Reactions
  else if (testScenario < 0.95) {
    testSendReaction();
  }
  // 5% CRUD operations
  else {
    testCrudOperations();
  }

  sleep(1 + Math.random() * 2); // Sleep between 1-3 seconds
}

function testSendTextMessage() {
  const payload = JSON.stringify({
    sessionId: SESSION_ID,
    to: TEST_PHONE,
    messageType: 'text',
    textData: {
      text: testMessages[Math.floor(Math.random() * testMessages.length)],
    },
  });

  const response = http.post(`${BASE_URL}/messages/send-text`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'send-text' },
  });
  const success = check(response, {
    'send-text status is 201': (r) => r.status === 201,
    'send-text response time < 500ms': (r) => r.timings.duration < 500,
    'send-text has success field': (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
    console.log(`❌ Send text failed: ${response.status} - ${response.body}`);
  } else {
    console.log(`✅ Text message sent successfully`);
  }
}

function testSendMediaMessage() {
  const payload = JSON.stringify({
    sessionId: SESSION_ID,
    to: TEST_PHONE,
    messageType: 'media',
    mediaData: {
      url: mediaUrls[Math.floor(Math.random() * mediaUrls.length)],
      mediaType: 'image',
      fileName: 'test-image.jpg',
      caption: 'Test media message from load test',
    },
  });

  const response = http.post(`${BASE_URL}/messages/send-media`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'send-media' },
  });
  const success = check(response, {
    'send-media status is 201': (r) => r.status === 201,
    'send-media response time < 1000ms': (r) => r.timings.duration < 1000,
    'send-media has success field': (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
    console.log(`❌ Send media failed: ${response.status} - ${response.body}`);
  } else {
    console.log(`✅ Media message sent successfully`);
  }
}

function testSendReaction() {
  const payload = JSON.stringify({
    sessionId: SESSION_ID,
    to: TEST_PHONE,
    messageType: 'reaction',
    reactionData: {
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      targetMessageId: 'dummy-message-id-' + Math.floor(Math.random() * 100),
    },
  });

  const response = http.post(`${BASE_URL}/messages/send-reaction`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'send-reaction' },
  });
  const success = check(response, {
    'send-reaction status is 201': (r) => r.status === 201,
    'send-reaction response time < 300ms': (r) => r.timings.duration < 300,
    'send-reaction has success field': (r) => {
      try {
        return JSON.parse(r.body).success === true;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
    console.log(
      `❌ Send reaction failed: ${response.status} - ${response.body}`,
    );
  } else {
    console.log(`✅ Reaction sent successfully`);
  }
}

function testCrudOperations() {
  // Test GET all messages
  const getResponse = http.get(
    `${BASE_URL}/messages?session_id=${SESSION_ID}`,
    {
      tags: { endpoint: 'get-messages' },
    },
  );

  const getSuccess = check(getResponse, {
    'get-messages status is 200': (r) => r.status === 200,
    'get-messages response time < 500ms': (r) => r.timings.duration < 500,
  });

  if (!getSuccess) {
    errorRate.add(1);
    console.log(`❌ Get messages failed: ${getResponse.status}`);
  } else {
    console.log(`✅ Messages retrieved successfully`);
  }

  // Test POST create message
  const createPayload = JSON.stringify({
    session_id: SESSION_ID,
    to: TEST_PHONE,
    message_type: 'txt',
    from_me: false,
  });

  const createResponse = http.post(`${BASE_URL}/messages`, createPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'create-message' },
  });

  const createSuccess = check(createResponse, {
    'create-message status is 200': (r) => r.status === 200,
    'create-message response time < 500ms': (r) => r.timings.duration < 500,
  });

  if (!createSuccess) {
    errorRate.add(1);
    console.log(`❌ Create message failed: ${createResponse.status}`);
  } else {
    console.log(`✅ Message created successfully`);
  }
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: `
    ========================================
    LOAD TEST SUMMARY
    ========================================
    Total Requests: ${data.metrics.http_reqs.count}
    Failed Requests: ${data.metrics.http_req_failed.count} (${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%)
    Average Response Time: ${data.metrics.http_req_duration.avg.toFixed(2)}ms
    95th Percentile: ${data.metrics['http_req_duration{p(95)}'].value.toFixed(2)}ms
    Max Response Time: ${data.metrics.http_req_duration.max.toFixed(2)}ms
    
    Requests per Second: ${data.metrics.http_reqs.rate.toFixed(2)}
    
    Endpoint Breakdown:
    - Send Text: ${data.metrics.http_reqs.count * 0.5} requests (50%)
    - Send Media: ${data.metrics.http_reqs.count * 0.3} requests (30%)  
    - Send Reaction: ${data.metrics.http_reqs.count * 0.15} requests (15%)
    - CRUD Operations: ${data.metrics.http_reqs.count * 0.05} requests (5%)
    ========================================
    `,
  };
}
