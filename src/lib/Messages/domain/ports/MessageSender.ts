export interface TextPayload {
  text: string;
  quoted?: any;
}

export interface MediaPayload {
  url: string;
  caption?: string;
  media_type?: string;
  mime_type: string;
  file_name?: string;
  file_path?: string;
}

export interface ReactPayload {
  key: any;
  emoji: string;
}

export interface MessageSender {
  sendTextMessage(
    sessionId: string,
    jid: string,
    payload: TextPayload,
    quoted?: any,
  ): Promise<any>;

  sendMediaMessage(
    sessionId: string,
    jid: string,
    mediaType: string,
    payload: MediaPayload,
    quoted?: any,
  ): Promise<any>;

  sendReactMessage(
    sessionId: string,
    jid: string,
    payload: ReactPayload,
  ): Promise<any>;

  setOnlinePresence(sessionId: string, jid?: string): Promise<void>;

  setOfflinePresence(sessionId: string, jid?: string): Promise<void>;
}