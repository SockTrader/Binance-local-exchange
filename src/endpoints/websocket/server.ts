import { Express } from 'express';
import http from 'http';
import { injectable, multiInject } from 'inversify';
import { Socket } from 'net';
import WebSocket from 'ws';
import { WEBSOCKET_EVENT_HANDLER, WebsocketEventHandler } from './websocketEventHandler';

@injectable()
export default class WebsocketServer {

  serverInstance?: http.Server;

  websocketInstance?: WebSocket.Server;

  constructor(
    @multiInject(WEBSOCKET_EVENT_HANDLER) private readonly eventHandlers: WebsocketEventHandler[],
  ) {
  }

  upgrade(app: Express) {
    const server = http.createServer(app);
    const websocketServer = new WebSocket.Server({
      noServer: true,
    });

    server.on('upgrade', (request, socket, head) => {
      websocketServer.handleUpgrade(request, socket as Socket, head, (websocket) => {
        websocketServer.emit('connection', websocket, request);
      });
    });

    websocketServer.on('connection', (connection, request) => {
      const remainingHandlers = this.eventHandlers.filter(handler => handler.shouldHandle(request));

      if (remainingHandlers.length <= 0) {
        throw new Error(`No handlers found for ${request?.url}`);
      }

      remainingHandlers.forEach(handler => handler.onMessage(connection, request));
    });

    this.serverInstance = server;
    this.websocketInstance = websocketServer;
  }
}
