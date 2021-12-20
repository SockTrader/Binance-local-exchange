import { Express } from 'express';
import http, { IncomingMessage } from 'http';
import { injectable, multiInject } from 'inversify';
import { Socket } from 'net';
import WebSocket from 'ws';
import { WEBSOCKET_EVENT_HANDLER, WebsocketEventHandler } from './websocketEventHandler';

@injectable()
export default class WebsocketServer {

  wsServer: WebSocket.Server;

  constructor(
    @multiInject(WEBSOCKET_EVENT_HANDLER) private readonly eventHandlers: WebsocketEventHandler[],
  ) {
    this.wsServer = new WebSocket.Server({
      noServer: true,
    });

    this.wsServer.on('connection', this.handleEvent.bind(this));
  }

  handleEvent(connection: WebSocket, request: IncomingMessage) {
    const remainingHandlers = this.eventHandlers.filter(handler => handler.shouldHandle(request));

    if (remainingHandlers.length <= 0) {
      throw new Error(`No handlers found for ${request?.url}`);
    }

    remainingHandlers.forEach(handler => handler.onMessage(connection, request));
  }

  createFromExpressApp(app: Express): http.Server {
    const server = http.createServer(app);

    server.on('upgrade', (request, socket, head) => {
      this.wsServer.handleUpgrade(request, socket as Socket, head, (websocket) => {
        this.wsServer.emit('connection', websocket, request);
      });
    });

    return server;
  }
}
