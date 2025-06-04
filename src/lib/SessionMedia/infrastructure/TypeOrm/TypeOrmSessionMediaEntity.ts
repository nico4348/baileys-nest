import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('session_media')
export class TypeOrmSessionMediaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ name: 's3_url', type: 'text' })
  s3Url: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'media_type', type: 'varchar', length: 50 })
  mediaType: string;

  @Column({ name: 'description', type: 'varchar', length: 4096, nullable: true })
  description: string;

  @Column({ name: 'is_uploaded', type: 'boolean', default: false })
  isUploaded: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}