import { AuthenticationState, proto } from 'baileys';
import { AuthCredsInit } from './AuthCredsInit';
import { BufferConverter } from '../Utils/Utils';
import { AuthStateRepository } from '../domain/AuthStateRepository';
import { AuthStateSessionKey } from '../domain/AuthStateSessionKey';

export class AuthStateGet {
  private bufferConverter = new BufferConverter();

  constructor(
    private readonly authStateRepository: AuthStateRepository,
    private readonly authCredsInit: AuthCredsInit,
  ) {}
  async run(sessionId: string): Promise<AuthenticationState> {
    const credsData = await this.authStateRepository.findByKey(
      new AuthStateSessionKey(`${sessionId}:auth_creds`),
    );

    const creds = credsData
      ? this.bufferConverter.jsonToBuffer(JSON.parse(credsData))
      : this.authCredsInit.initAuthCreds();

    return {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [key: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              const keyData = await this.authStateRepository.findByKey(
                new AuthStateSessionKey(`${sessionId}:${type}-${id}`),
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
          return data;
        },
        set: async (data: { [key: string]: { [key: string]: any } }) => {
          const tasks = Object.entries(data).flatMap(
            ([category, categoryData]) =>
              Object.entries(categoryData || {}).map(([id, value]) => {
                const key = `${sessionId}:${category}-${id}`;
                return value
                  ? this.authStateRepository.save(
                      new AuthStateSessionKey(key),
                      JSON.stringify(this.bufferConverter.bufferToJSON(value)),
                    )
                  : this.authStateRepository.deleteByKey(
                      new AuthStateSessionKey(key),
                    );
              }),
          );
          await Promise.all(tasks);
        },
      },
    };
  }
}
