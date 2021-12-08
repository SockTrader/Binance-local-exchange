import Binance from 'binance-api-node';
import http from 'http';
import { WebSocket } from 'ws';
import container from '../../../container';
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

    binanceMock.ws._sendKlineEvent([
      {
        'e': 'kline',     // Event type
        'E': 123456789,   // Event time
        's': 'BNBBTC',    // Symbol
        'k': {
          't': 123400000, // Kline start time
          'T': 123460000, // Kline close time
          's': 'BNBBTC',  // Symbol
          'i': '1m',      // Interval
          'f': 100,       // First trade ID
          'L': 200,       // Last trade ID
          'o': '0.0010',  // Open price
          'c': '0.0020',  // Close price
          'h': '0.0025',  // High price
          'l': '0.0015',  // Low price
          'v': '1000',    // Base asset volume
          'n': 100,       // Number of trades
          'x': false,     // Is this kline closed?
          'q': '1.0000',  // Quote asset volume
          'V': '500',     // Taker buy base asset volume
          'Q': '0.500',   // Taker buy quote asset volume
          'B': '123456'   // Ignore
        }
      }
    ]);

    const mockCall0 = (connectionMock.send as jest.Mock).mock.calls[0]
    expect(JSON.parse(mockCall0)).toEqual(expect.objectContaining({
      e: 'kline',
      k: expect.objectContaining({
        'c': '0.0020'
      }),
    }));
  });

  it('should throw if stream name is invalid', async () => {
    const connectionMock = { send: jest.fn() } as unknown as WebSocket;
    const requestMock = {} as http.IncomingMessage;

    await expect(eventHandler.onMessage(connectionMock, requestMock)).rejects.toThrow('Invalid stream name: undefined')
  });

  it('should extract pair from stream name', () => {
    expect(eventHandler.getPairFromStream('btc/UsDt@kline_1h')).toEqual('BTCUSDT');
    expect(eventHandler.getPairFromStream('bTcUsDt@kline_1h')).toEqual('BTCUSDT');
    expect(eventHandler.getPairFromStream('BTC/USDT@kline_1h')).toEqual('BTCUSDT');
    expect(eventHandler.getPairFromStream('BTCUSDT@kline_1h')).toEqual('BTCUSDT');
  });

  it('should extract period from stream name', () => {
    expect(eventHandler.getPeriodFromStream('BTC/USDT@kline_1h')).toEqual('1h');
    expect(eventHandler.getPeriodFromStream('BTC/USDT@kline_1H')).toEqual('1h');
  });

});
