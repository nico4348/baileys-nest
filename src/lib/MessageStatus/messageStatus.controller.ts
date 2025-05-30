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
import { MessageStatusCreate } from './application/MessageStatusCreate';
import { MessageStatusGetAll } from './application/MessageStatusGetAll';
import { MessageStatusGetOneById } from './application/MessageStatusGetOneById';
import { MessageStatusGetByMessageId } from './application/MessageStatusGetByMessageId';
import { MessageStatusDelete } from './application/MessageStatusDelete';
import { v4 as uuidv4 } from 'uuid';

@Controller('message-status')
export class MessageStatusController {
  constructor(
    private readonly messageStatusCreate: MessageStatusCreate,
    private readonly messageStatusGetAll: MessageStatusGetAll,
    private readonly messageStatusGetOneById: MessageStatusGetOneById,
    private readonly messageStatusGetByMessageId: MessageStatusGetByMessageId,
    private readonly messageStatusDelete: MessageStatusDelete,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: { message_id: string; status_id: string },
  ): Promise<{ id: string; message: string }> {
    const id = uuidv4();
    await this.messageStatusCreate.run(
      id,
      body.message_id,
      body.status_id,
      new Date(),
    );
    return { id, message: 'MessageStatus created successfully' };
  }

  @Get()
  async findAll() {
    return this.messageStatusGetAll.run();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.messageStatusGetOneById.run(id);
  }

  @Get('message/:messageId')
  async findByMessageId(@Param('messageId') messageId: string) {
    return this.messageStatusGetByMessageId.run(messageId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.messageStatusDelete.run(id);
  }
}