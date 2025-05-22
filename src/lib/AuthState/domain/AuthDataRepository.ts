// Interfaz del puerto para el repositorio (no importa nada externo)
export interface AuthDataRepository {
  save(key: string, data: string): Promise<void>;
  findByKey(key: string): Promise<string | null>;
  deleteByKey(key: string): Promise<void>;
  deleteByKeyPattern(pattern: string): Promise<void>;
}
