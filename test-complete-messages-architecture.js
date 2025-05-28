const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteMessagesArchitecture() {
  try {
    console.log('🧪 Testing Complete Messages Architecture...\n');
    console.log('='.repeat(60));
    console.log('🏗️  TESTING NEW ORCHESTRATOR PATTERN');
    console.log('='.repeat(60));

    // ========================================
    // 1. TEST MESSAGES MODULE (ORCHESTRATOR)
    // ========================================
    console.log('\n📋 1. TESTING MESSAGES MODULE (ORCHESTRATOR)');
    console.log('-'.repeat(50));

    // Get all messages (base table)
    console.log('1.1. Getting all messages from base table...');
    const getAllMessagesResponse = await fetch(`${BASE_URL}/messages`);
    const getAllMessagesData = await getAllMessagesResponse.json();
    console.log('✅ Messages base table:', getAllMessagesData.data?.length || 0, 'records');

    // ========================================
    // 2. TEST TEXT MESSAGES MODULE
    // ========================================
    console.log('\n📝 2. TESTING TEXT MESSAGES MODULE');
    console.log('-'.repeat(50));

    // Get all text messages
    console.log('2.1. Getting all text messages...');
    const getAllTextResponse = await fetch(`${BASE_URL}/text-messages`);
    const getAllTextData = await getAllTextResponse.json();
    console.log('✅ Text messages table:', getAllTextData.data?.length || 0, 'records');

    // Create a text message manually
    console.log('2.2. Creating text message manually...');
    const createTextResponse = await fetch(`${BASE_URL}/text-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: 'msg-test-001',
        body: 'Hello from text messages API!'
      })
    });
    const createTextData = await createTextResponse.json();
    console.log('✅ Text message created:', createTextData.success ? 'SUCCESS' : 'FAILED');

    // ========================================
    // 3. TEST MEDIA MESSAGES MODULE
    // ========================================
    console.log('\n📸 3. TESTING MEDIA MESSAGES MODULE');
    console.log('-'.repeat(50));

    // Get all media messages
    console.log('3.1. Getting all media messages...');
    const getAllMediaResponse = await fetch(`${BASE_URL}/media-messages`);
    const getAllMediaData = await getAllMediaResponse.json();
    console.log('✅ Media messages table:', getAllMediaData.data?.length || 0, 'records');

    // Create a media message manually
    console.log('3.2. Creating media message manually...');
    const createMediaResponse = await fetch(`${BASE_URL}/media-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: 'msg-test-002',
        caption: 'Test image caption',
        media_type: 'image',
        mime_type: 'image/jpeg',
        file_name: 'test.jpg',
        file_path: '/uploads/test.jpg'
      })
    });
    const createMediaData = await createMediaResponse.json();
    console.log('✅ Media message created:', createMediaData.success ? 'SUCCESS' : 'FAILED');

    // Test filtering by media type
    console.log('3.3. Testing media type filter...');
    const getByMediaTypeResponse = await fetch(`${BASE_URL}/media-messages?media_type=image`);
    const getByMediaTypeData = await getByMediaTypeResponse.json();
    console.log('✅ Filtered by media type:', getByMediaTypeData.data?.length || 0, 'records');

    // ========================================
    // 4. TEST REACTION MESSAGES MODULE
    // ========================================
    console.log('\n😀 4. TESTING REACTION MESSAGES MODULE');
    console.log('-'.repeat(50));

    // Get all reaction messages
    console.log('4.1. Getting all reaction messages...');
    const getAllReactionsResponse = await fetch(`${BASE_URL}/reaction-messages`);
    const getAllReactionsData = await getAllReactionsResponse.json();
    console.log('✅ Reaction messages table:', getAllReactionsData.data?.length || 0, 'records');

    // Create a reaction message manually
    console.log('4.2. Creating reaction message manually...');
    const createReactionResponse = await fetch(`${BASE_URL}/reaction-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: 'msg-test-003',
        emoji: '👍',
        target_msg_id: 'msg-test-001'
      })
    });
    const createReactionData = await createReactionResponse.json();
    console.log('✅ Reaction message created:', createReactionData.success ? 'SUCCESS' : 'FAILED');

    // Test filtering by emoji
    console.log('4.3. Testing emoji filter...');
    const getByEmojiResponse = await fetch(`${BASE_URL}/reaction-messages?emoji=👍`);
    const getByEmojiData = await getByEmojiResponse.json();
    console.log('✅ Filtered by emoji:', getByEmojiData.data?.length || 0, 'records');

    // ========================================
    // 5. TEST ORCHESTRATOR ENDPOINTS
    // ========================================
    console.log('\n🎼 5. TESTING ORCHESTRATOR ENDPOINTS');
    console.log('-'.repeat(50));

    console.log('📝 NOTE: Orchestrator sending endpoints require active WhatsApp sessions');
    console.log('   These endpoints coordinate multiple tables and Baileys integration:');
    
    console.log('\n   🔸 POST /messages/send/text');
    console.log('     - Creates record in messages table');
    console.log('     - Creates record in text_messages table');
    console.log('     - Sends message via WhatsApp Baileys');
    
    console.log('\n   🔸 POST /messages/send/media');
    console.log('     - Creates record in messages table');
    console.log('     - Creates record in media_messages table');
    console.log('     - Sends media via WhatsApp Baileys');
    
    console.log('\n   🔸 POST /messages/send/reaction');
    console.log('     - Creates record in messages table');
    console.log('     - Creates record in reaction_messages table');
    console.log('     - Sends reaction via WhatsApp Baileys');

    // ========================================
    // 6. ARCHITECTURE SUMMARY
    // ========================================
    console.log('\n🏗️ 6. ARCHITECTURE SUMMARY');
    console.log('-'.repeat(50));
    
    console.log('✅ IMPLEMENTED MODULES:');
    console.log('   📋 Messages (Orchestrator) - /messages/*');
    console.log('   📝 TextMessages - /text-messages/*');
    console.log('   📸 MediaMessages - /media-messages/*');
    console.log('   😀 ReactionMessages - /reaction-messages/*');
    
    console.log('\n✅ DATABASE TABLES:');
    console.log('   📋 messages (base table for all messages)');
    console.log('   📝 text_messages (OneToOne with messages)');
    console.log('   📸 media_messages (OneToOne with messages)');
    console.log('   😀 reaction_messages (ManyToOne with messages)');
    
    console.log('\n✅ ORCHESTRATOR PATTERN:');
    console.log('   🎼 MessagesOrchestrator coordinates all message types');
    console.log('   🔄 Single endpoint creates records in multiple tables');
    console.log('   📡 Integrates with Baileys for WhatsApp sending');
    console.log('   🎯 Unified API for complex message operations');

    // ========================================
    // 7. EXAMPLE PAYLOADS
    // ========================================
    console.log('\n📋 7. EXAMPLE PAYLOADS FOR TESTING');
    console.log('-'.repeat(50));

    console.log('\n📝 Text Message via Orchestrator:');
    console.log(JSON.stringify({
      session_id: 'your-session-id',
      to: '5511999999999@s.whatsapp.net',
      text: 'Hello from orchestrator!',
      quoted_message_id: 'optional-quoted-msg-id'
    }, null, 2));

    console.log('\n📸 Media Message via Orchestrator:');
    console.log(JSON.stringify({
      session_id: 'your-session-id',
      to: '5511999999999@s.whatsapp.net',
      media_type: 'image',
      media_url: 'https://example.com/image.jpg',
      caption: 'Check this out!',
      quoted_message_id: 'optional-quoted-msg-id'
    }, null, 2));

    console.log('\n😀 Reaction via Orchestrator:');
    console.log(JSON.stringify({
      session_id: 'your-session-id',
      to: '5511999999999@s.whatsapp.net',
      message_key: { id: 'target-message-id', fromMe: false },
      emoji: '👍',
      target_message_id: 'target-message-id'
    }, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE MESSAGES ARCHITECTURE TEST COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for the server to start and then run tests
setTimeout(() => {
  testCompleteMessagesArchitecture();
}, 3000);