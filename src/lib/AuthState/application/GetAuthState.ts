// Caso de uso para obtener el estado de autenticación
import { AuthDataRepository } from '../domain/AuthDataRepository';

export class GetAuthState {
  constructor(
    private readonly authDataRepository: AuthDataRepository,
    private readonly bufferConverter: any,
    private readonly authCredsInitializer: any,
  ) {}

  async execute(sessionId: string): Promise<any> {
    // Implementación del caso de uso que coordina operaciones
    const creds =
      (await this.readData(sessionId, 'auth_creds')) ||
      this.authCredsInitializer.initAuthCreds();

    return {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: Record<string, any> = {};
          await Promise.all(
            ids.map(async (id) => {
              const value = await this.readData(sessionId, `${type}-${id}`);
              data[id] = value;
            }),
          );
          return data;
        },
        set: async (data: Record<string, Record<string, any>>) => {
          const tasks = Object.entries(data).flatMap(
            ([category, categoryData]) =>
              Object.entries(categoryData || {}).map(([id, value]) => {
                const key = `${category}-${id}`;
                return value
                  ? this.writeData(sessionId, key, value)
                  : this.removeData(sessionId, key);
              }),
          );
          await Promise.all(tasks);
        },
      },
    };
  }

  private getKey(sessionId: string, key: string): string {
    return `${sessionId}:${key}`;
  }

  private async writeData(
    sessionId: string,
    key: string,
    data: any,
  ): Promise<void> {
    const serialized = JSON.stringify(this.bufferConverter.bufferToJSON(data));
    await this.authDataRepository.save(this.getKey(sessionId, key), serialized);
  }

  private async readData(sessionId: string, key: string): Promise<any | null> {
    const result = await this.authDataRepository.findByKey(
      this.getKey(sessionId, key),
    );
    return result
      ? this.bufferConverter.jsonToBuffer(JSON.parse(result))
      : null;
  }

  private async removeData(sessionId: string, key: string): Promise<void> {
    await this.authDataRepository.deleteByKey(this.getKey(sessionId, key));
  }
}
