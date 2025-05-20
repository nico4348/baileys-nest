import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Session } from '../Sessions/SessionsEntity'; // Assuming this is the correct path

@Entity('session_logs')
export class SessionLogs {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'varchar', length: 20 })
  log_type: string;

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Session, (session) => session.sessionLogs)
  @JoinColumn({ name: 'session_id' })
  session: Session;
}
