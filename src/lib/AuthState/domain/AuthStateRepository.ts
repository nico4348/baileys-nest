import { AuthState } from './AuthState';
import { AuthStateSessionKey } from './AuthStateSessionKey';

export interface AuthStateRepository {
  create(authState: AuthState): Promise<AuthState>;
  getAll(): Promise<AuthState[]>;
  getOneById(id: AuthStateSessionKey): Promise<AuthState | null>;
  update(authState: AuthState): Promise<AuthState>;
  delete(id: AuthStateSessionKey): Promise<void>;
}
