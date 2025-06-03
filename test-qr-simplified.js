const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testSimplifiedQRFunctionality() {
  console.log('🔄 Testing simplified QR Counter functionality...\n');

  let sessionId;

  try {
    // Create a test session
    const response = await axios.post(`${BASE_URL}/sessions`, {
      session_name: 'Simple QR Test',
      phone: '+1234567890',
    });
    sessionId = response.data.session.id;
    console.log('✅ Test session created:', sessionId);

    // Start the session
    await axios.post(`${BASE_URL}/sessions/${sessionId}/start`);
    console.log('✅ Session started');

    console.log('⏳ Waiting for QR generation and limit to be reached...');
    console.log('📝 Expected behavior:');
    console.log('  - QR counter increments quietly (no verbose logs)');
    console.log('  - When limit is reached, session pauses automatically');
    console.log('  - Minimal logging for clean output');

    // Wait to observe the behavior
    await sleep(10000);

    console.log(
      '\n✅ Test completed! Check server logs for simplified output.',
    );
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    // Clean up
    if (sessionId) {
      try {
        await axios.delete(`${BASE_URL}/sessions/${sessionId}`);
        console.log('🧹 Test session cleaned up');
      } catch (error) {
        console.log('⚠️ Failed to clean up:', error.message);
      }
    }
  }
}

// Run the test
testSimplifiedQRFunctionality().catch(console.error);
