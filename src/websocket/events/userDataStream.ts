import http from 'http';
import WebSocket from 'ws';

export const userDataStreamEventHandler = (connection: WebSocket, request: http.IncomingMessage) => {
  connection.send(JSON.stringify({
    type: 'test',
  }));
};
