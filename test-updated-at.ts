// Script de prueba para verificar updated_at
import { SessionsGetOneById } from './src/lib/Sessions/application/SessionsGetOneById';
import { SessionsUpdate } from './src/lib/Sessions/application/SessionsUpdate';
import { TypeOrmSessionsRepository } from './src/lib/Sessions/infrastructure/TypeOrm/TypeOrmSessionsRepository';

// Este script debería ejecutarse con el contexto de la aplicación
// para verificar si updated_at se actualiza correctamente

async function testUpdatedAt() {
  try {
    // Supongamos que tenemos una sesión existente
    const sessionId = 'test-session-id';

    console.log('=== Prueba de updated_at ===');

    // 1. Obtener la sesión actual
    const sessionsGetOneById = new SessionsGetOneById(/* repository */);
    const session = await sessionsGetOneById.run(sessionId);

    if (!session) {
      console.log('No se encontró la sesión para probar');
      return;
    }

    console.log(
      'Fecha updated_at antes de actualizar:',
      session.updatedAt.value,
    );

    // 2. Esperar 2 segundos para asegurar diferencia en timestamp
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Actualizar la sesión
    const sessionsUpdate = new SessionsUpdate(/* repository */);
    await sessionsUpdate.run(
      session.id.value,
      session.sessionName.value,
      session.phone.value,
      session.status.value,
      session.createdAt.value,
      new Date(), // Nueva fecha updated_at
      session.isDeleted.value,
      session.deletedAt.value || undefined,
    );

    // 4. Obtener la sesión actualizada
    const updatedSession = await sessionsGetOneById.run(sessionId);
    console.log(
      'Fecha updated_at después de actualizar:',
      updatedSession.updatedAt.value,
    );

    // 5. Comparar fechas
    if (updatedSession.updatedAt.value > session.updatedAt.value) {
      console.log('✅ updated_at se actualizó correctamente');
    } else {
      console.log('❌ updated_at NO se actualizó');
    }
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Nota: Este script es solo para referencia
// Para ejecutarlo necesitarías inicializar la aplicación correctamente
console.log('Script de prueba para updated_at creado');
