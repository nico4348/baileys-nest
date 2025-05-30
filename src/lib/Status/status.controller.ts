import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { StatusCreate } from './application/StatusCreate';
import { StatusGetAll } from './application/StatusGetAll';
import { StatusGetOneById } from './application/StatusGetOneById';
import { StatusGetOneByName } from './application/StatusGetOneByName';
import { StatusUpdate } from './application/StatusUpdate';
import { StatusDelete } from './application/StatusDelete';
import { v4 as uuidv4 } from 'uuid';

@Controller('status')
export class StatusController {
  constructor(
    private readonly statusCreate: StatusCreate,
    private readonly statusGetAll: StatusGetAll,
    private readonly statusGetOneById: StatusGetOneById,
    private readonly statusGetOneByName: StatusGetOneByName,
    private readonly statusUpdate: StatusUpdate,
    private readonly statusDelete: StatusDelete,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: { name: string; description: string },
  ): Promise<{ id: string; message: string }> {
    const id = uuidv4();
    await this.statusCreate.run(id, body.name, body.description, new Date());
    return { id, message: 'Status created successfully' };
  }

  @Get()
  async findAll() {
    return this.statusGetAll.run();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.statusGetOneById.run(id);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    return this.statusGetOneByName.run(name);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; description: string },
  ) {
    await this.statusUpdate.run(id, body.name, body.description);
    return { message: 'Status updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.statusDelete.run(id);
  }
}