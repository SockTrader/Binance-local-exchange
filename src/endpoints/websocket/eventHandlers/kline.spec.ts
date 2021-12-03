import Binance, { Candle } from 'binance-api-node';
import http from 'http';
import { WebSocket } from 'ws';
import container from '../../container';
import { KlineEventHandler } from './kline';

describe('klineEventHandler', () => {
  let binanceMock: any;
  let eventHandler: KlineEventHandler;

  beforeEach(() => {
    container.snapshot();

    binanceMock = Binance();
    binanceMock._reset();

    eventHandler = container.resolve(KlineEventHandler);

    jest.clearAllMocks();
  });

  afterEach(() => {
    container.restore();
  });

  it('should receive a response on the connection when a new candle has been received', async () => {
    const connectionMock = { send: jest.fn() } as unknown as WebSocket;
    const requestMock = { url: 'BTC/USDT@kline_1h' } as http.IncomingMessage;

    await eventHandler.onMessage(connectionMock, requestMock);

    binanceMock.ws._sendCandles([{
      open: 120,
      high: 150,
      low: 80,
      close: 110,
    } as unknown as Candle]);

    expect(connectionMock.send).toHaveBeenCalledWith(JSON.stringify({
      open: 120,
      high: 150,
      low: 80,
      close: 110,
    }));
  });

  it('should throw if stream name is invalid', async () => {
    const connectionMock = { send: jest.fn() } as unknown as WebSocket;
    const requestMock = {} as http.IncomingMessage;

    await expect(eventHandler.onMessage(connectionMock, requestMock)).rejects.toThrow('Invalid stream name: undefined')
  });

  it('should extract pair from stream name', () => {
    expect(eventHandler.getPairFromStream('BTC/USDT@kline_1h')).toEqual('BTCUSDT');
    expect(eventHandler.getPairFromStream('BTCUSDT@kline_1h')).toEqual('BTCUSDT');
  });

  it('should extract period from stream name', () => {
    expect(eventHandler.getPeriodFromStream('BTC/USDT@kline_1h')).toEqual('1h');
  });

});
