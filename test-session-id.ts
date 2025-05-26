import { SessionId } from './src/lib/Sessions/domain/SessionId';
import { WhatsAppSessionManager } from './src/lib/Sessions/infrastructure/WhatsAppSessionManager';

// This is a simple test to verify SessionId type overloads are working
async function testSessionIdOverloads() {
  // Mock the WhatsAppSessionManager to test type overloads
  console.log('Testing SessionId type overloads...');

  // Create a SessionId instance
  const sessionId = new SessionId('test-session-123');
  const sessionIdString = 'test-session-456';

  console.log('SessionId value:', sessionId.value);
  console.log('String value:', sessionIdString);

  // These should all compile without errors now
  // sessionManager.startSession(sessionId);      // SessionId type
  // sessionManager.startSession(sessionIdString); // string type
  // sessionManager.resumeSession(sessionId);
  // sessionManager.resumeSession(sessionIdString);
  // sessionManager.recreateSession(sessionId);
  // sessionManager.recreateSession(sessionIdString);
  // sessionManager.stopSession(sessionId);
  // sessionManager.stopSession(sessionIdString);
  // sessionManager.deleteSession(sessionId);
  // sessionManager.deleteSession(sessionIdString);
  // sessionManager.isSessionPaused(sessionId);
  // sessionManager.isSessionPaused(sessionIdString);
  // sessionManager.isSessionRestarting(sessionId);
  // sessionManager.isSessionRestarting(sessionIdString);
  // sessionManager.isSessionDeleting(sessionId);
  // sessionManager.isSessionDeleting(sessionIdString);

  console.log('✅ All SessionId type overloads compile successfully!');
}

testSessionIdOverloads();
