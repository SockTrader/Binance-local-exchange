import { EventEmitter } from 'events';
import http, { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { WebSocket } from 'ws';

class server extends EventEmitter {
  handleUpgrade(
    request: IncomingMessage,
    socket: Duplex,
    upgradeHead: Buffer,
    callback: (client: WebSocket, request: IncomingMessage) => void,
  ): void {
  };
}

server.prototype.handleUpgrade = jest.fn((req: http.IncomingMessage, socket, head, callback) => {
  callback(
    { type: 'WebSocket' } as unknown as WebSocket,
    { type: 'IncomingMessage' } as unknown as IncomingMessage
  );
});

export default {
  Server: server
}
