import { NewOrderLimit, NewOrderMarketBase, NewOrderMarketQuote, OrderSide, OrderType } from 'binance-api-node';
import { exchangeInfoQueryMock } from '../__mocks__/exchangeInfo.query.mock';
import container from '../container';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { OrderStore } from '../store/order.store';
import { OrderService } from './order.service';
import { OrderMatchingService } from './orderMatching.service';

describe('Order service', () => {
  let orderService: OrderService;
  let orderStore: OrderStore;
  let addSpy: jest.SpyInstance;

  const orderMatchingServiceMock: OrderMatchingService = {
    matchWithMarketPrice: jest.fn()
  } as unknown as OrderMatchingService

  const btcMarketBuy: NewOrderMarketBase = {
    symbol: 'BTCUSDT',
    type: <OrderType.MARKET>'MARKET',
    side: <OrderSide.BUY>'BUY',
    quantity: '1'
  };

  const btcMarketBuyQuote: NewOrderMarketQuote = {
    symbol: 'BTCUSDT',
    type: <OrderType.MARKET>'MARKET',
    side: <OrderSide.BUY>'BUY',
    quoteOrderQty: '1000',
  };

  const btcLimitSell: NewOrderLimit = {
    symbol: 'BTCUSDT',
    type: <OrderType.LIMIT>'LIMIT',
    side: <OrderSide.SELL>'SELL',
    price: '10000',
    quantity: '1'
  };

  beforeEach(() => {
    container.snapshot();

    container.rebind(ExchangeInfoQuery).toConstantValue(exchangeInfoQueryMock);
    container.rebind(OrderMatchingService).toConstantValue(orderMatchingServiceMock);

    orderService = container.resolve(OrderService);
    orderStore = container.resolve(OrderStore);

    addSpy = jest.spyOn(orderStore, 'add');
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it('should have incrementing order id\'s', async () => {
    await orderService.addFromSpotOrder(btcMarketBuy);
    await orderService.addFromSpotOrder(btcMarketBuy);

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ orderId: 1 }));
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ orderId: 2 }));
  });

  it('should add an MARKET Order to the OrderStore', async () => {
    await orderService.addFromSpotOrder(btcMarketBuy);

    expect(addSpy.mock.calls[0][0]).toStrictEqual({
      origQty: 1,
      clientOrderId: expect.any(String),
      isWorking: true,
      orderId: 1,
      orderListId: -1,
      side: 'BUY',
      status: 'NEW',
      symbol: 'BTCUSDT',
      time: expect.any(Number),
      timeInForce: 'GTC',
      transactTime: expect.any(Number),
      type: 'MARKET',
      updateTime: expect.any(Number),
    });
  });

  it('should add an quote MARKET Order to the OrderStore', async () => {
    await orderService.addFromSpotOrder(btcMarketBuyQuote);

    expect(addSpy.mock.calls[0][0]).toStrictEqual({
      cummulativeQuoteQty: 1000,
      clientOrderId: expect.any(String),
      isWorking: true,
      orderId: 1,
      orderListId: -1,
      side: 'BUY',
      status: 'NEW',
      symbol: 'BTCUSDT',
      time: expect.any(Number),
      timeInForce: 'GTC',
      transactTime: expect.any(Number),
      type: 'MARKET',
      updateTime: expect.any(Number),
    });
  });

  it('should immediately match market order', async () => {
    await orderService.addFromSpotOrder(btcMarketBuy);
    expect(orderMatchingServiceMock.matchWithMarketPrice).toHaveBeenCalledWith('BTCUSDT');
  });

  it('should add an LIMIT Order to the OrderStore', async () => {
    await orderService.addFromSpotOrder(btcLimitSell);

    expect(addSpy.mock.calls[0][0]).toStrictEqual({
      origQty: 1,
      price: 10000,
      clientOrderId: expect.any(String),
      isWorking: true,
      orderId: 1,
      orderListId: -1,
      side: 'SELL',
      status: 'NEW',
      symbol: 'BTCUSDT',
      time: expect.any(Number),
      timeInForce: 'GTC',
      type: 'LIMIT',
      updateTime: expect.any(Number),
    });
  });

  it('should not contain properties that are calculated by the OrderMatching.service for a MARKET BUY order', async () => {
    await orderService.addFromSpotOrder(btcMarketBuy);

    expect(addSpy.mock.calls[0][0]).not.toContainAnyEntries([
      ['fills', expect.any(Array)],
      ['cummulativeQuoteQty', expect.any(Number)],
      ['price', expect.any(Number)],
    ]);
  });

  it('should not contain properties that are calculated by the OrderMatching.service for a MARKET Quote BUY order', async () => {
    await orderService.addFromSpotOrder(btcMarketBuyQuote);

    expect(addSpy.mock.calls[0][0]).not.toContainAnyEntries([
      ['fills', expect.any(Array)],
      ['origQty', expect.any(Number)],
      ['price', expect.any(Number)],
    ]);
  });

  it('should not contain properties that are calculated by the OrderMatching.service for a LIMIT sell order', async () => {
    await orderService.addFromSpotOrder(btcLimitSell);

    expect(addSpy.mock.calls[0][0]).not.toContainAnyEntries([
      ['fills', expect.any(Array)],
    ]);
  });
});
