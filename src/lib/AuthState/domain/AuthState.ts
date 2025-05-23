import { AuthStateData } from './AuthStateData';
import { AuthStateSessionKey } from './AuthStateSessionKey';
export class AuthState {
  data: AuthStateData;
  key: AuthStateSessionKey;

  constructor(data: AuthStateData, key: AuthStateSessionKey) {
    this.data = data;
    this.key = key;
  }
}
