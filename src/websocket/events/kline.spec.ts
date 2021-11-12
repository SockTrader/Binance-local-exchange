import Binance, { Candle } from 'binance-api-node';
import http from 'http';
import { WebSocket } from 'ws';
import { getPairFromStream, getPeriodFromStream, klineEventHandler } from './kline';

describe('klineEventHandler', () => {
  let binanceMock: any;

  beforeEach(() => {
    binanceMock = Binance();
    binanceMock._reset();

    jest.clearAllMocks();
  });

  it('should receive a response on the connection when a new candle has been received', async () => {
    const connectionMock = { send: jest.fn()} as unknown as WebSocket;
    const requestMock = { url: 'BTC/USDT@kline_1h'} as http.IncomingMessage;

    klineEventHandler(connectionMock, requestMock);

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

  it('should extract pair from stream name', () => {
    expect(getPairFromStream('BTC/USDT@kline_1h')).toEqual('BTCUSDT');
    expect(getPairFromStream('BTCUSDT@kline_1h')).toEqual('BTCUSDT');
  });

  it('should extract period from stream name', () => {
    expect(getPeriodFromStream('BTC/USDT@kline_1h')).toEqual('1h');
  });

});
