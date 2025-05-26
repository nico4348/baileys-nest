import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDataEntity } from './AuthDataEntity';
import { AuthStateRepository } from '../../domain/AuthStateRepository';
import { AuthState } from '../../domain/AuthState';
import { AuthStateData } from '../../domain/AuthStateData';
import { AuthStateSessionKey } from '../../domain/AuthStateSessionKey';

@Injectable()
export class AuthStateTypeOrmRepository implements AuthStateRepository {
  constructor(
    @InjectRepository(AuthDataEntity)
    private readonly authStateRepository: Repository<AuthDataEntity>,
  ) {}

  // Crea un nuevo AuthState o lo actualiza si existe
  async create(authState: AuthState): Promise<AuthState> {
    const key = authState.key.value;
    const data = JSON.stringify(authState.data.toJSON());
    await this.authStateRepository.upsert({ session_key: key, data }, [
      'session_key',
    ]);
    return authState;
  }

  async getOneById(id: AuthStateSessionKey): Promise<AuthState | null> {
    const entity = await this.authStateRepository.findOne({
      where: { session_key: id.value },
    });
    if (!entity) return null;
    const parsed = JSON.parse(entity.data);
    return new AuthState(new AuthStateData(parsed), id);
  }

  async getAll(): Promise<AuthState[]> {
    const entities = await this.authStateRepository.find();
    return entities.map((e) => {
      const key = new AuthStateSessionKey(e.session_key);
      const parsed = JSON.parse(e.data);
      return new AuthState(new AuthStateData(parsed), key);
    });
  }

  async update(authState: AuthState): Promise<AuthState> {
    return this.create(authState);
  }

  async delete(id: AuthStateSessionKey): Promise<void> {
    await this.authStateRepository.delete({ session_key: id.value });
  }

  async saveData(sessionId: string, key: string, data: string): Promise<void> {
    const session_key = `${sessionId}:${key}`;
    await this.authStateRepository.upsert({ session_key, data }, [
      'session_key',
    ]);
  }

  async getData(sessionId: string, key: string): Promise<string | null> {
    const session_key = `${sessionId}:${key}`;
    const entity = await this.authStateRepository.findOne({
      where: { session_key },
    });
    return entity ? entity.data : null;
  }

  async removeData(sessionId: string, key: string): Promise<void> {
    const session_key = `${sessionId}:${key}`;
    await this.authStateRepository.delete({ session_key });
  }

  async save(key: string, data: string): Promise<void> {
    await this.authStateRepository.upsert({ session_key: key, data: data }, [
      'session_key',
    ]);
  }

  async findByKey(key: string): Promise<any | null> {
    const entity = await this.authStateRepository.findOne({
      where: { session_key: key },
    });
    return entity ? entity.data : null;
  }

  async deleteByKey(key: string): Promise<void> {
    await this.authStateRepository.delete({ session_key: key });
  }

  async deleteByKeyPattern(pattern: string): Promise<void> {
    await this.authStateRepository
      .createQueryBuilder()
      .delete()
      .where('session_key LIKE :pattern', { pattern })
      .execute();
  }
}
