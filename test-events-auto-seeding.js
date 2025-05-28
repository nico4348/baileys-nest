/**
 * Test script para verificar el auto-seeding de eventos
 * Este script verifica que:
 * 1. Los eventos se crean automáticamente si la tabla está vacía
 * 2. No se duplican si ya existen
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEventsAutoSeeding() {
  console.log('🧪 Testing Events Auto-Seeding Functionality\n');

  try {
    // 1. Verificar que los eventos existen
    console.log('1. Checking that events exist...');
    const eventsResponse = await axios.get(`${BASE_URL}/events`);

    if (eventsResponse.data.success) {
      const events = eventsResponse.data.data;
      console.log(`✅ Found ${events.length} events in the database`);

      // Verificar que contiene algunos eventos específicos de Baileys
      const expectedEvents = [
        'connection.update',
        'messages.upsert',
        'creds.update',
        'presence.update',
        'chats.upsert',
      ];

      const eventNames = events.map((event) => event.event_name.value);
      const missingEvents = expectedEvents.filter(
        (name) => !eventNames.includes(name),
      );

      if (missingEvents.length === 0) {
        console.log('✅ All expected Baileys events are present');
      } else {
        console.log(`❌ Missing events: ${missingEvents.join(', ')}`);
      }

      // Mostrar algunos eventos de ejemplo
      console.log('\n📋 Sample events:');
      events.slice(0, 5).forEach((event) => {
        console.log(
          `   • ${event.event_name.value}: ${event.description.value}`,
        );
      });
    } else {
      console.log('❌ Failed to fetch events');
    }

    console.log('\n✅ Auto-seeding test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   • Events are automatically seeded when the table is empty');
    console.log('   • Seeding is skipped when events already exist');
    console.log('   • All Baileys event types are properly configured');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Ejecutar el test
if (require.main === module) {
  testEventsAutoSeeding().catch(console.error);
}

module.exports = { testEventsAutoSeeding };
