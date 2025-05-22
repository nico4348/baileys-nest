import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('auth_data')
export class AuthDataEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  session_key: string;

  @Column({ type: 'text' })
  data: string;
}
