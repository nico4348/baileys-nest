const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testMessagesModule() {
  try {
    console.log('🧪 Testing Messages Module...\n');

    // Test 1: Get all messages (should be empty initially)
    console.log('1. Getting all messages (should be empty)...');
    const getAllResponse = await fetch(`${BASE_URL}/messages`);
    const getAllData = await getAllResponse.json();
    console.log('✅ Get all messages:', getAllData);
    console.log();

    // Test 2: Create a message manually
    console.log('2. Creating a message manually...');
    const createMessageResponse = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'test-session-123',
        to: '5511999999999@s.whatsapp.net',
        message_type: 'txt',
        in_out: 'out'
      })
    });
    const createMessageData = await createMessageResponse.json();
    console.log('✅ Create message:', createMessageData);
    console.log();

    // Test 3: Get all messages after creation
    console.log('3. Getting all messages after creation...');
    const getAllAfterCreateResponse = await fetch(`${BASE_URL}/messages`);
    const getAllAfterCreateData = await getAllAfterCreateResponse.json();
    console.log('✅ Get all messages after creation:', getAllAfterCreateData);
    console.log(`   Found ${getAllAfterCreateData.data?.length || 0} messages`);
    console.log();

    // Test 4: Get messages by session ID
    console.log('4. Getting messages by session ID...');
    const getBySessionResponse = await fetch(`${BASE_URL}/messages?session_id=test-session-123`);
    const getBySessionData = await getBySessionResponse.json();
    console.log('✅ Get messages by session:', getBySessionData);
    console.log();

    if (createMessageData.success && createMessageData.data) {
      const messageId = createMessageData.data.id;
      
      // Test 5: Get specific message by ID
      console.log('5. Getting specific message by ID...');
      const getMessageResponse = await fetch(`${BASE_URL}/messages/${messageId}`);
      const getMessageData = await getMessageResponse.json();
      console.log('✅ Get message by ID:', getMessageData);
      console.log();

      // Test 6: Update the message
      console.log('6. Updating the message...');
      const updateMessageResponse = await fetch(`${BASE_URL}/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_type: 'media'
        })
      });
      const updateMessageData = await updateMessageResponse.json();
      console.log('✅ Update message:', updateMessageData);
      console.log();

      // Test 7: Delete the message
      console.log('7. Deleting the message...');
      const deleteMessageResponse = await fetch(`${BASE_URL}/messages/${messageId}`, {
        method: 'DELETE'
      });
      const deleteMessageData = await deleteMessageResponse.json();
      console.log('✅ Delete message:', deleteMessageData);
      console.log();
    }

    // Note: Message sending tests would require an active WhatsApp session
    console.log('📝 Note: Message sending tests require an active WhatsApp session');
    console.log('   To test sending, first create a session and then use:');
    console.log('   POST /messages/send/text');
    console.log('   POST /messages/send/media');
    console.log('   POST /messages/send/reaction');
    console.log();

    // Test example payload for text message sending (for documentation)
    console.log('📋 Example payload for sending text message:');
    const textPayloadExample = {
      session_id: 'your-session-id',
      to: '5511999999999@s.whatsapp.net',
      text: 'Hello from Baileys!'
    };
    console.log(JSON.stringify(textPayloadExample, null, 2));
    console.log();

    // Test example payload for media message sending (for documentation)
    console.log('📋 Example payload for sending media message:');
    const mediaPayloadExample = {
      session_id: 'your-session-id',
      to: '5511999999999@s.whatsapp.net',
      media_type: 'image',
      media_url: 'https://example.com/image.jpg',
      caption: 'Check out this image!'
    };
    console.log(JSON.stringify(mediaPayloadExample, null, 2));
    console.log();

    console.log('🎉 All Messages Module tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for the server to start and then run tests
setTimeout(() => {
  testMessagesModule();
}, 3000);