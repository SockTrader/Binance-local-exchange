import { Express } from 'express';
import http from 'http';
import { Socket } from 'net';
import WebSocket from 'ws';
import { klineEventHandler } from './events/kline';
import { userDataStreamEventHandler } from './events/userDataStream';

export default class WebsocketServer {

  serverInstance: http.Server;

  websocketInstance: WebSocket.Server;

  constructor(app: Express) {
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
      console.log('url: ', request?.url);
      console.log('header: ', request.headers);

      if (request?.url === '/userDataStream') {
        userDataStreamEventHandler(connection, request);
      } else if (request.url?.includes('@kline')) {
        klineEventHandler(connection, request);
      } else {
        throw new Error(`Route ${request?.url} not implemented`);
      }

      connection.on('message', (message) => {
        console.log('raw message: ', message);
        //connection.send(JSON.stringify({ message: "response" }))
      });
    });

    this.serverInstance = server;
    this.websocketInstance = websocketServer;
  }
}
