import { exchangeInfoQueryMock } from '../__mocks__/exchangeInfo.query.mock';
import container from '../container';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { InternalOrder } from '../store/order.interfaces';
import { OrderQuery } from '../store/order.query';
import { OrderStore } from '../store/order.store';
import { OrderMatchingService } from './orderMatching.service';

describe('Order Matching service', () => {
  let orderMatchingService: OrderMatchingService;
  let orderStore: OrderStore;
  let orderQuery: OrderQuery;

  const buyOrder: InternalOrder = {
    origQty: 1,
    clientOrderId: '1',
    isWorking: true,
    orderId: 1,
    orderListId: -1,
    side: 'BUY',
    status: 'NEW',
    symbol: 'BTCUSDT',
    time: new Date().getTime(),
    timeInForce: 'GTC',
    transactTime: new Date().getTime(),
    type: 'MARKET',
    updateTime: new Date().getTime(),
  }

  const sellOrder: InternalOrder = {
    ...buyOrder,
    clientOrderId: '2',
    side: 'SELL',
  }

  beforeEach(() => {
    container.snapshot();

    container.rebind(ExchangeInfoQuery).toConstantValue(exchangeInfoQueryMock);
    orderMatchingService = container.resolve(OrderMatchingService);
    orderStore = container.resolve(OrderStore);
    orderQuery = container.resolve(OrderQuery);

    orderStore.set([buyOrder, sellOrder]);
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it('should have incrementing trade id\'s', async () => {
    await orderMatchingService.match('BTCUSDT', 10000);

    expect(orderQuery.getAll()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        fills: expect.arrayContaining([
          expect.objectContaining({ tradeId: 1 }),
          expect.objectContaining({ tradeId: 2 }),
        ])
      }),
      expect.objectContaining({
        fills: expect.arrayContaining([
          expect.objectContaining({ tradeId: 3 }),
          expect.objectContaining({ tradeId: 4 }),
        ])
      }),
    ]))
  });

  it('should correctly calculate commission for a MARKET BUY order', async () => {
    await orderMatchingService.match('BTCUSDT', 10000);

    const [buy] = orderQuery.getAll().filter(o => o.side === 'BUY');
    expect(buy.fills?.[0]).toEqual(expect.objectContaining({ commission: 0.0005 }));
  });

  it('should correctly calculate commission for a MARKET SELL order', async () => {
    await orderMatchingService.match('BTCUSDT', 10000);

    const [sell] = orderQuery.getAll().filter(o => o.side === 'SELL');
    expect(sell.fills?.[0]).toEqual(expect.objectContaining({ commission: 5 }));
  });

  it('should match MARKET BUY order', async () => {
    await orderMatchingService.match('BTCUSDT', 10000);

    const [buy] = orderQuery.getAll().filter(o => o.side === 'BUY');
    expect(buy).toEqual(expect.objectContaining({
      clientOrderId: '1',
      cummulativeQuoteQty: 10000,
      executedQty: 1,
      isWorking: true,
      orderId: 1,
      orderListId: -1,
      origQty: 1,
      price: 10000,
      side: 'BUY',
      status: 'FILLED',
      symbol: 'BTCUSDT',
      time: expect.any(Number),
      timeInForce: 'GTC',
      transactTime: expect.any(Number),
      type: 'MARKET',
      updateTime: expect.any(Number),
    }));
  });
});
