import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthDataEntity } from './AuthDataEntity';
import { AuthDataRepository } from '../../domain/AuthDataRepository';

@Injectable()
export class AuthDataTypeOrmRepository implements AuthDataRepository {
  constructor(
    @InjectRepository(AuthDataEntity)
    private readonly authDataRepository: Repository<AuthDataEntity>,
  ) {}

  async save(key: string, data: string): Promise<void> {
    await this.authDataRepository.save({
      session_key: key,
      data: data,
    });
  }

  async findByKey(key: string): Promise<string | null> {
    const entity = await this.authDataRepository.findOne({
      where: { session_key: key },
    });
    return entity ? entity.data : null;
  }

  async deleteByKey(key: string): Promise<void> {
    await this.authDataRepository.delete({ session_key: key });
  }

  async deleteByKeyPattern(pattern: string): Promise<void> {
    await this.authDataRepository
      .createQueryBuilder()
      .delete()
      .where('session_key LIKE :pattern', { pattern })
      .execute();
  }
}
