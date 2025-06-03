import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ConnectionPort } from '../domain/ports/ConnectionPort';
import { SessionStatePort } from '../domain/ports/SessionStatePort';

@Injectable()
export class SessionDependencyInitializer implements OnModuleInit {
  constructor(
    @Inject('ConnectionPort') private readonly connection: ConnectionPort,
    @Inject('SessionStatePort') private readonly sessionState: SessionStatePort,
  ) {}

  onModuleInit() {
    // Establecer la referencia del session state manager en el connection manager
    // Esto resuelve la dependencia circular de forma controlada
    this.connection.setSessionStateManager(this.sessionState);
  }
}
