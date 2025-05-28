const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testEventsModule() {
  try {
    console.log('🧪 Testing Events Module...\n');

    // Test 1: Get all events (should be empty initially)
    console.log('1. Getting all events (should be empty)...');
    const getAllResponse = await fetch(`${BASE_URL}/events`);
    const getAllData = await getAllResponse.json();
    console.log('✅ Get all events:', getAllData);
    console.log();

    // Test 2: Seed Baileys events
    console.log('2. Seeding Baileys events...');
    const seedResponse = await fetch(`${BASE_URL}/events/seed`, {
      method: 'POST',
    });
    const seedData = await seedResponse.json();
    console.log('✅ Seed events:', seedData);
    console.log();

    // Test 3: Get all events again (should have seeded events)
    console.log('3. Getting all events after seeding...');
    const getAllAfterSeedResponse = await fetch(`${BASE_URL}/events`);
    const getAllAfterSeedData = await getAllAfterSeedResponse.json();
    console.log('✅ Get all events after seeding:', getAllAfterSeedData);
    console.log(`   Found ${getAllAfterSeedData.data?.length || 0} events`);
    console.log();

    // Test 4: Get event logs (should be empty since no sessions are active)
    console.log('4. Getting all event logs...');
    const getEventLogsResponse = await fetch(`${BASE_URL}/event-logs`);
    const getEventLogsData = await getEventLogsResponse.json();
    console.log('✅ Get all event logs:', getEventLogsData);
    console.log();

    // Test 5: Create a custom event
    console.log('5. Creating a custom event...');
    const createEventResponse = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'test.event',
        description: 'Test event for module verification'
      })
    });
    const createEventData = await createEventResponse.json();
    console.log('✅ Create custom event:', createEventData);
    console.log();

    if (createEventData.success && createEventData.data) {
      const eventId = createEventData.data.id;
      
      // Test 6: Get specific event by ID
      console.log('6. Getting specific event by ID...');
      const getEventResponse = await fetch(`${BASE_URL}/events/${eventId}`);
      const getEventData = await getEventResponse.json();
      console.log('✅ Get event by ID:', getEventData);
      console.log();

      // Test 7: Update the event
      console.log('7. Updating the event...');
      const updateEventResponse = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Updated test event description'
        })
      });
      const updateEventData = await updateEventResponse.json();
      console.log('✅ Update event:', updateEventData);
      console.log();

      // Test 8: Delete the custom event
      console.log('8. Deleting the custom event...');
      const deleteEventResponse = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'DELETE'
      });
      const deleteEventData = await deleteEventResponse.json();
      console.log('✅ Delete event:', deleteEventData);
      console.log();
    }

    console.log('🎉 All Events Module tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for the server to start and then run tests
setTimeout(() => {
  testEventsModule();
}, 3000);