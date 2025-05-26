import { AuthStateSessionKey } from './AuthStateSessionKey';

export interface AuthStateRepository {
  save(key: AuthStateSessionKey, data: string): Promise<void>;
  findByKey(key: AuthStateSessionKey): Promise<any | null>;
  deleteByKey(key: AuthStateSessionKey): Promise<void>;
  deleteByKeyPattern(pattern: string): Promise<void>;
}
