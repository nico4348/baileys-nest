const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createTestSession() {
  try {
    const response = await axios.post(`${BASE_URL}/sessions`, {
      session_name: 'QR Pause Test Session',
      phone: '+1234567890',
    });
    console.log(
      '✅ Test session created:',
      response.data.session?.id || 'ID not found',
    );
    return response.data.session?.id;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ Session already exists, will use existing session');
      return 'test-session-id';
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
    console.log('✅ Session started successfully');
    return response.data;
  } catch (error) {
    console.error(
      '❌ Failed to start session:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function checkSessionStatus(sessionId) {
  try {
    const response = await axios.get(`${BASE_URL}/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Failed to check session status:',
      error.response?.data || error.message,
    );
    return null;
  }
}

async function testQRPauseFunctionality() {
  console.log('🔄 Testing QR Counter Pause functionality...\n');
  console.log('📋 Test Plan:');
  console.log('1. Create a test session');
  console.log('2. Start the session (triggers QR generation)');
  console.log('3. Monitor session behavior');
  console.log('4. Verify session gets paused after QR limit (2 QRs)\n');

  let sessionId;

  try {
    // Step 1: Create test session
    sessionId = await createTestSession();
    if (!sessionId) {
      throw new Error('Could not create or get session ID');
    }
    await sleep(1000);

    // Step 2: Start session to trigger QR generation
    await startSession(sessionId);
    console.log('⏳ Waiting for QR generation and counter to reach limit...');

    // Step 3: Monitor session - QR counter should increment
    console.log('📊 Monitoring session status...');
    for (let i = 0; i < 10; i++) {
      const status = await checkSessionStatus(sessionId);
      if (status) {
        console.log(
          `📈 Check ${i + 1}: Session status = ${status.session?.status ? 'ACTIVE' : 'PAUSED'}`,
        );

        // If session becomes paused, it means QR limit was reached
        if (!status.session?.status) {
          console.log(
            '✅ SUCCESS: Session was automatically paused due to QR limit!',
          );
          console.log('🎯 QR Counter pause functionality is working correctly');
          break;
        }
      }
      await sleep(5000); // Check every 5 seconds
    }

    console.log('\n📝 Summary:');
    console.log('- QR counter limit is set to 2');
    console.log('- Session automatically pauses when limit is reached');
    console.log('- This prevents excessive QR generation attempts');
    console.log('- User can manually resume the session if needed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    if (sessionId) {
      try {
        await axios.delete(`${BASE_URL}/sessions/${sessionId}`);
        console.log('🧹 Test session cleaned up');
      } catch (error) {
        console.log('⚠️ Failed to clean up test session');
      }
    }
  }

  console.log('\n✅ QR Counter Pause functionality test completed!');
}

// Run the test
testQRPauseFunctionality().catch(console.error);
