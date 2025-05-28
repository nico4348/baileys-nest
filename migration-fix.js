const { Client } = require('pg');

async function fixEventLogsData() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'pruebaNest',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if there's already a default event
    const existingEvent = await client.query(
      "SELECT id FROM events WHERE event_name = 'default_event' LIMIT 1",
    );

    let defaultEventId;

    if (existingEvent.rows.length === 0) {
      // Create a default event
      const newEvent = await client.query(
        "INSERT INTO events (id, event_name, description, created_at) VALUES (gen_random_uuid(), 'default_event', 'Default event for migration purposes', NOW()) RETURNING id",
      );
      defaultEventId = newEvent.rows[0].id;
      console.log(`Created default event with ID: ${defaultEventId}`);
    } else {
      defaultEventId = existingEvent.rows[0].id;
      console.log(`Using existing default event with ID: ${defaultEventId}`);
    }

    // Check how many NULL event_id records exist
    const nullRecordsCount = await client.query(
      'SELECT COUNT(*) FROM event_logs WHERE event_id IS NULL',
    );
    console.log(
      `Found ${nullRecordsCount.rows[0].count} records with NULL event_id`,
    );

    if (parseInt(nullRecordsCount.rows[0].count) > 0) {
      // Update all NULL event_id values with the default event_id
      const updateResult = await client.query(
        'UPDATE event_logs SET event_id = $1 WHERE event_id IS NULL',
        [defaultEventId],
      );
      console.log(
        `Updated ${updateResult.rowCount} records with default event_id`,
      );
    } else {
      console.log('No NULL event_id records found');
    }

    // Verify all event_logs now have event_id
    const remainingNulls = await client.query(
      'SELECT COUNT(*) FROM event_logs WHERE event_id IS NULL',
    );
    console.log(
      `Remaining NULL event_id records: ${remainingNulls.rows[0].count}`,
    );

    console.log('Migration completed successfully!');
    console.log(
      'You can now update the TypeOrmEventLogsEntity to make event_id NOT NULL',
    );
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

fixEventLogsData();
