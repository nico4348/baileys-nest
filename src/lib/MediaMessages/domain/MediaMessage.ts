import { MediaMessageCaption } from './MediaMessageCaption';
import { MediaMessageFileName } from './MediaMessageFileName';
import { MediaMessageFilePath } from './MediaMessageFilePath';
import { MediaMessageId } from './MediaMessageId';
import { MediaMessageMediaType } from './MediaMessageMediaType';
import { MediaMessageMessageId } from './MediaMessageMessageId';
import { MediaMessageMimeType } from './MediaMessageMimeType';

export class MediaMessage {
  id: MediaMessageId;
  message_id: MediaMessageMessageId;
  caption: MediaMessageCaption;
  media_type: MediaMessageMediaType;
  mime_type: MediaMessageMimeType;
  file_name: MediaMessageFileName;
  file_path: MediaMessageFilePath;

  constructor(
    id: MediaMessageId,
    message_id: MediaMessageMessageId,
    caption: MediaMessageCaption,
    media_type: MediaMessageMediaType,
    mime_type: MediaMessageMimeType,
    file_name: MediaMessageFileName,
    file_path: MediaMessageFilePath,
  ) {
    this.id = id;
    this.message_id = message_id;
    this.caption = caption;
    this.media_type = media_type;
    this.mime_type = mime_type;
    this.file_name = file_name;
    this.file_path = file_path;
  }
}
