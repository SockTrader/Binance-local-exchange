import http from 'http';
import WebSocket from 'ws';

export const WEBSOCKET_EVENT_HANDLER = Symbol('WEBSOCKET_EVENT_HANDLER');

export interface WebsocketEventHandler {

  shouldHandle(request: http.IncomingMessage): boolean;

  onMessage(connection: WebSocket, request: http.IncomingMessage): Promise<void>;

}
