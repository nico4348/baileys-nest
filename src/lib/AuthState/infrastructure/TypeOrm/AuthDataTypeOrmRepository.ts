import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDataEntity } from './AuthDataEntity';
import { AuthStateRepository } from '../../domain/AuthStateRepository';
import { AuthStateSessionKey } from '../../domain/AuthStateSessionKey';

@Injectable()
export class AuthStateTypeOrmRepository implements AuthStateRepository {
  constructor(
    @InjectRepository(AuthDataEntity)
    private readonly authStateRepository: Repository<AuthDataEntity>,
  ) {}

  async save(key: AuthStateSessionKey, data: string): Promise<void> {
    await this.authStateRepository.upsert(
      { session_key: key.value, data: data },
      ['session_key'],
    );
  }

  async findByKey(key: AuthStateSessionKey): Promise<any | null> {
    const entity = await this.authStateRepository.findOne({
      where: { session_key: key.value },
    });
    return entity ? entity.data : null;
  }

  async deleteByKey(key: AuthStateSessionKey): Promise<void> {
    await this.authStateRepository.delete({ session_key: key.value });
  }

  async deleteByKeyPattern(pattern: string): Promise<void> {
    await this.authStateRepository
      .createQueryBuilder()
      .delete()
      .where('session_key LIKE :pattern', { pattern })
      .execute();
  }
}
