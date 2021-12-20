import { EventEmitter } from 'events';
import { Express } from 'express';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import ws from '../../__mocks__/ws';
import container from '../../container';
import { WEBSOCKET_EVENT_HANDLER } from './websocketEventHandler';
import WebsocketServer from './websocketServer';

const httpServer = new EventEmitter();

jest.mock('http', () => ({
  createServer: jest.fn(() => httpServer)
}));

describe('WebsocketServer', () => {

  let websocketServer: WebsocketServer;

  const request = { url: 'MY_URL' } as IncomingMessage;
  const eventHandler1 = { shouldHandle: jest.fn(() => false), onMessage: jest.fn() };
  const eventHandler2 = { shouldHandle: jest.fn(() => true), onMessage: jest.fn() };

  beforeEach(() => {
    container.snapshot();
    container.unbind(WEBSOCKET_EVENT_HANDLER);
    container.bind(WEBSOCKET_EVENT_HANDLER).toConstantValue(eventHandler1);
    container.bind(WEBSOCKET_EVENT_HANDLER).toConstantValue(eventHandler2);

    websocketServer = container.resolve(WebsocketServer);
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it('should handle server upgrades', () => {
    websocketServer.createFromExpressApp({} as Express);
    httpServer.emit('upgrade');

    expect(ws.Server.prototype.handleUpgrade).toHaveBeenCalledTimes(1);
  });

  it('should emit connection event on server upgrade', () => {
    const spy = jest.spyOn(ws.Server.prototype, 'emit');
    websocketServer.createFromExpressApp({} as Express);

    httpServer.emit('upgrade');

    expect(spy).toHaveBeenCalledWith('connection', expect.anything(), undefined);
  });

  it('should handle incoming messages', () => {
    websocketServer.handleEvent({} as WebSocket, request);

    expect(eventHandler2.onMessage).toHaveBeenCalledWith({}, { url: 'MY_URL' });
  });

  it('should not call event handler if not \'interested\'', () => {
    websocketServer.handleEvent({} as WebSocket, request);

    expect(eventHandler1.onMessage).not.toHaveBeenCalled();
  });

  it('should throw if non of the handlers can handle the event', () => {
    eventHandler2.shouldHandle.mockImplementationOnce(() => false);

    expect(() => websocketServer.handleEvent({} as WebSocket, request)).toThrow('No handlers found for MY_URL');
  });
});
