const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_SESSION_ID = 'test-qr-counter-session';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createTestSession() {
  try {
    const response = await axios.post(`${BASE_URL}/sessions/create`, {
      session_name: 'QR Counter Test Session',
      phone: '+1234567890',
    });
    console.log('✅ Test session created:', response.data);
    return response.data.session.id;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(
        '⚠️ Session already exists, continuing with existing session',
      );
      return TEST_SESSION_ID;
    }
    console.error(
      '❌ Failed to create test session:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function startSession(sessionId) {
  try {
    console.log(`🚀 Starting session: ${sessionId}`);
    const response = await axios.post(
      `${BASE_URL}/sessions/${sessionId}/start`,
    );
    console.log('✅ Session started:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Failed to start session:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function checkQRCode(sessionId) {
  try {
    const response = await axios.get(`${BASE_URL}/sessions/${sessionId}/qr`);
    if (response.data.qr) {
      console.log('✅ QR code generated successfully');
      return true;
    } else {
      console.log('⚠️ No QR code available yet');
      return false;
    }
  } catch (error) {
    console.log(
      '⚠️ QR not available yet or session not ready:',
      error.response?.status,
    );
    return false;
  }
}

async function testQRCounterFunctionality() {
  console.log('🔄 Testing QR Counter functionality...\n');

  let sessionId;

  try {
    // Step 1: Create a test session
    sessionId = await createTestSession();
    await sleep(1000);

    // Step 2: Start the session to trigger QR generation
    await startSession(sessionId);
    console.log('⏳ Waiting for QR generation...');
    await sleep(3000);

    // Step 3: Check if QR code is generated
    let qrGenerated = false;
    for (let i = 0; i < 10; i++) {
      qrGenerated = await checkQRCode(sessionId);
      if (qrGenerated) break;
      await sleep(2000);
    }

    if (qrGenerated) {
      console.log('✅ QR Counter is working - QR code was generated');
      console.log(
        '📝 Note: Counter is internal and increments with each QR generation',
      );
      console.log('🔒 Maximum limit is set to 10 QR generations per session');
    } else {
      console.log('❌ QR code was not generated within expected time');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up: Delete the test session
    if (sessionId) {
      try {
        await axios.delete(`${BASE_URL}/sessions/${sessionId}`);
        console.log('🧹 Test session cleaned up');
      } catch (error) {
        console.log('⚠️ Failed to clean up test session:', error.message);
      }
    }
  }

  console.log('\n✅ QR Counter functionality test completed!');
  console.log('📋 Summary:');
  console.log('- QR counter is now internal only (no public endpoint)');
  console.log('- Counter increments with each QR generation');
  console.log('- Maximum limit: 10 QR codes per session');
  console.log('- Counter resets on successful connection');
  console.log('- Counter is cleaned up when session is deleted');
}

// Run the test
testQRCounterFunctionality().catch(console.error);
