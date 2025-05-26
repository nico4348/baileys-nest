import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('auth_data')
export class AuthDataEntity {
  @PrimaryColumn('varchar', { length: 255 })
  session_key: string;

  @Column('text')
  data: string;
}
