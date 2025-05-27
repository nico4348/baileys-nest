const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_PREFIX = `${BASE_URL}/sessions`;

// Helper function to make requests with error handling
async function makeRequest(method, url, data = null, params = {}) {
  try {
    const config = {
      method,
      url,
      timeout: 10000,
      validateStatus: () => true, // Accept all status codes
    };

    if (data) {
      config.data = data;
    }

    if (Object.keys(params).length > 0) {
      config.params = params;
    }

    const response = await axios(config);
    return {
      statusCode: response.status,
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return {
      statusCode: 0,
      error: error.message,
    };
  }
}

// Logging utilities
function logTest(message) {
  console.log(`\n🧪 ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

// Test functions for new query endpoints

async function testGetSessionsByPhone() {
  logTest('Test: GET /sessions/filter/phone - Filter sessions by phone');

  // Test 1: Valid phone query
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/phone`,
      null,
      {
        phone: '573022949109',
      },
    );

    if (response.statusCode === 200) {
      logSuccess(`Phone filter successful: ${response.statusCode}`);
      logInfo(
        `Sessions found: ${response.data.data ? response.data.data.length : 0}`,
      );

      if (response.data.data && response.data.data.length > 0) {
        const session = response.data.data[0];
        logInfo(`Example session: ID=${session.id}, Phone=${session.phone}`);
      }
    } else if (response.statusCode === 400) {
      logInfo('Bad request (expected if phone param missing)');
    } else {
      logError(`Unexpected status: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 2: Missing phone parameter
  try {
    const response = await makeRequest('GET', `${API_PREFIX}/filter/phone`);

    if (response.statusCode === 400) {
      logSuccess('Correctly returns 400 for missing phone parameter');
    } else {
      logWarning(`Expected 400 but got: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testGetSessionsByIsDeleted() {
  logTest(
    'Test: GET /sessions/filter/deleted - Filter sessions by deletion status',
  );

  // Test 1: Get non-deleted sessions
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/deleted`,
      null,
      {
        is_deleted: 'false',
      },
    );

    if (response.statusCode === 200) {
      logSuccess(`Non-deleted sessions: ${response.statusCode}`);
      logInfo(
        `Sessions found: ${response.data.data ? response.data.data.length : 0}`,
      );
    } else {
      logError(`Error: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 2: Get deleted sessions
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/deleted`,
      null,
      {
        is_deleted: 'true',
      },
    );

    if (response.statusCode === 200) {
      logSuccess(`Deleted sessions: ${response.statusCode}`);
      logInfo(
        `Sessions found: ${response.data.data ? response.data.data.length : 0}`,
      );
    } else {
      logError(`Error: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 3: Missing parameter
  try {
    const response = await makeRequest('GET', `${API_PREFIX}/filter/deleted`);

    if (response.statusCode === 400) {
      logSuccess('Correctly returns 400 for missing is_deleted parameter');
    } else {
      logWarning(`Expected 400 but got: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testGetSessionsByCreatedAtRange() {
  logTest(
    'Test: GET /sessions/filter/created-at - Filter sessions by creation date range',
  );

  // Test 1: Valid date range
  const startDate = '2025-05-20';
  const endDate = '2025-05-28';

  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/created-at`,
      null,
      {
        start_date: startDate,
        end_date: endDate,
      },
    );

    if (response.statusCode === 200) {
      logSuccess(`Created-at filter successful: ${response.statusCode}`);
      logInfo(
        `Sessions found: ${response.data.data ? response.data.data.length : 0}`,
      );

      if (response.data.data && response.data.data.length > 0) {
        const session = response.data.data[0];
        logInfo(
          `Example session: ID=${session.id}, Created=${session.createdAt}`,
        );
      }
    } else {
      logError(`Error: ${response.statusCode}`);
      if (response.data) {
        logInfo(`Response: ${JSON.stringify(response.data)}`);
      }
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 2: Invalid date format
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/created-at`,
      null,
      {
        start_date: 'invalid-date',
        end_date: endDate,
      },
    );

    if (response.statusCode === 400) {
      logSuccess('Correctly returns 400 for invalid date format');
    } else {
      logWarning(`Expected 400 but got: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 3: Missing parameters
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/created-at`,
    );

    if (response.statusCode === 400) {
      logSuccess('Correctly returns 400 for missing date parameters');
    } else {
      logWarning(`Expected 400 but got: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testGetSessionsByUpdatedAtRange() {
  logTest(
    'Test: GET /sessions/filter/updated-at - Filter sessions by update date range',
  );

  // Test 1: Valid date range
  const startDate = '2025-05-20';
  const endDate = '2025-05-28';

  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/updated-at`,
      null,
      {
        start_date: startDate,
        end_date: endDate,
      },
    );

    if (response.statusCode === 200) {
      logSuccess(`Updated-at filter successful: ${response.statusCode}`);
      logInfo(
        `Sessions found: ${response.data.data ? response.data.data.length : 0}`,
      );

      if (response.data.data && response.data.data.length > 0) {
        const session = response.data.data[0];
        logInfo(
          `Example session: ID=${session.id}, Updated=${session.updatedAt}`,
        );
      }
    } else {
      logError(`Error: ${response.statusCode}`);
      if (response.data) {
        logInfo(`Response: ${JSON.stringify(response.data)}`);
      }
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }

  // Test 2: Start date after end date
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/updated-at`,
      null,
      {
        start_date: '2025-05-28',
        end_date: '2025-05-20',
      },
    );

    if (response.statusCode === 400) {
      logSuccess('Correctly returns 400 for invalid date range (start > end)');
    } else {
      logWarning(`Expected 400 but got: ${response.statusCode}`);
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

async function testCombinedQueries() {
  logTest('Test: Combined query scenarios');

  // Test filtering by phone and then checking if results match expected phone
  try {
    const response = await makeRequest(
      'GET',
      `${API_PREFIX}/filter/phone`,
      null,
      {
        phone: '573022949109',
      },
    );

    if (response.statusCode === 200 && response.data.data) {
      const sessions = response.data.data;
      logInfo(`Found ${sessions.length} sessions for phone 573022949109`);

      // Verify all returned sessions have the correct phone
      const wrongPhoneSessions = sessions.filter(
        (s) => s.phone !== '573022949109',
      );
      if (wrongPhoneSessions.length === 0) {
        logSuccess('All returned sessions have the correct phone number');
      } else {
        logError(
          `Found ${wrongPhoneSessions.length} sessions with wrong phone numbers`,
        );
      }
    }
  } catch (error) {
    logError(`Error: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Sessions Query Endpoints Tests\n');

  await testGetSessionsByPhone();
  await testGetSessionsByIsDeleted();
  await testGetSessionsByCreatedAtRange();
  await testGetSessionsByUpdatedAtRange();
  await testCombinedQueries();

  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGetSessionsByPhone,
  testGetSessionsByIsDeleted,
  testGetSessionsByCreatedAtRange,
  testGetSessionsByUpdatedAtRange,
  testCombinedQueries,
  runAllTests,
};
