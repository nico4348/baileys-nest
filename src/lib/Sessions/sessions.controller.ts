import { Controller, Get } from '@nestjs/common';

@Controller('sessions')
export class SessionsController {
  @Get()
  async getAll() {
    //consume el getAll de la clase SessionGetAll
    return;
  }
}
