import { Injectable } from '@nestjs/common';
import {
  AuthenticationState,
  AuthenticationCreds,
  proto,
  initAuthCreds,
} from 'baileys';
import { AuthCredsInit } from '../application/AuthCredsInit';
import { BufferConverter } from '../Utils/Utils';
import { AuthStateTypeOrmRepository } from './TypeOrm/AuthDataTypeOrmRepository';

@Injectable()
export class AuthStateService {
  private bufferConverter = new BufferConverter();

  constructor(
    private readonly authStateRepository: AuthStateTypeOrmRepository,
    private readonly authCredsInit: AuthCredsInit,
  ) {}
  async getAuthState(sessionId: string): Promise<AuthenticationState> {
    console.log(`[${sessionId}] 🔍 Recuperando estado de autenticación...`);

    const credsData = await this.authStateRepository.findByKey(
      `${sessionId}:auth_creds`,
    );

    if (credsData) {
      console.log(
        `[${sessionId}] ✅ Credenciales encontradas en BD (${credsData.length} caracteres)`,
      );
      try {
        const parsedCreds = JSON.parse(credsData);
        console.log(`[${sessionId}] 📊 Credenciales parseadas:`, {
          hasNoiseKey: !!parsedCreds.noiseKey,
          hasSignedIdentityKey: !!parsedCreds.signedIdentityKey,
          hasRegistrationId: !!parsedCreds.registrationId,
          registered: parsedCreds.registered,
        });
      } catch (e) {
        console.warn(
          `[${sessionId}] ⚠️ Error parseando credenciales para log:`,
          e.message,
        );
      }
    } else {
      console.log(
        `[${sessionId}] ⚠️ No se encontraron credenciales - Creando nuevas`,
      );
    }

    const creds = credsData
      ? this.bufferConverter.jsonToBuffer(JSON.parse(credsData))
      : this.authCredsInit.initAuthCreds();

    console.log(
      `[${sessionId}] 🏗️ Estado de autenticación creado exitosamente`,
    );

    return {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          console.log(
            `[${sessionId}] 🔑 Recuperando keys - Tipo: ${type}, IDs: [${ids.join(', ')}]`,
          );
          const data: { [key: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              const keyData = await this.authStateRepository.findByKey(
                `${sessionId}:${type}-${id}`,
              );
              const value = keyData
                ? this.bufferConverter.jsonToBuffer(JSON.parse(keyData))
                : null;

              if (type === 'app-state-sync-key' && value) {
                data[id] = proto.Message.AppStateSyncKeyData.fromObject(value);
              } else {
                data[id] = value;
              }
            }),
          );
          console.log(
            `[${sessionId}] ✅ Keys recuperadas: ${Object.keys(data).length} encontradas`,
          );
          return data;
        },
        set: async (data: { [key: string]: { [key: string]: any } }) => {
          const totalItems = Object.values(data).reduce(
            (sum, categoryData) => sum + Object.keys(categoryData || {}).length,
            0,
          );
          console.log(
            `[${sessionId}] 💾 Guardando keys - ${totalItems} elementos en ${Object.keys(data).length} categorías`,
          );

          const tasks = Object.entries(data).flatMap(
            ([category, categoryData]) =>
              Object.entries(categoryData || {}).map(([id, value]) => {
                const key = `${sessionId}:${category}-${id}`;
                return value
                  ? this.authStateRepository.save(
                      key,
                      JSON.stringify(this.bufferConverter.bufferToJSON(value)),
                    )
                  : this.authStateRepository.deleteByKey(key);
              }),
          );
          await Promise.all(tasks);
          console.log(`[${sessionId}] ✅ Keys guardadas exitosamente`);
        },
      },
    };
  }
  async saveCreds(
    sessionId: string,
    creds: AuthenticationCreds,
  ): Promise<void> {
    console.log(`[${sessionId}] 💾 Iniciando guardado de credenciales...`);
    console.log(`[${sessionId}] 📊 Datos de credenciales:`, {
      hasNoiseKey: !!creds.noiseKey,
      hasSignedIdentityKey: !!creds.signedIdentityKey,
      hasRegistrationId: !!creds.registrationId,
      registered: creds.registered,
    });

    const credKey = `${sessionId}:auth_creds`;
    const serializedCreds = JSON.stringify(
      this.bufferConverter.bufferToJSON(creds),
    );

    console.log(`[${sessionId}] 🔑 Clave: ${credKey}`);
    console.log(
      `[${sessionId}] 📝 Tamaño serializado: ${serializedCreds.length} caracteres`,
    );

    try {
      await this.authStateRepository.save(credKey, serializedCreds);
      console.log(
        `[${sessionId}] ✅ Credenciales guardadas en base de datos exitosamente`,
      );
    } catch (error) {
      console.error(
        `[${sessionId}] ❌ Error guardando en base de datos:`,
        error,
      );
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.authStateRepository.deleteByKeyPattern(`${sessionId}:%`);
  }
}
