import { exchangeInfoQueryMock } from '../__mocks__/exchangeInfo.query.mock';
import container from '../container';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { InternalOrder } from '../store/order.interfaces';
import { OrderQuery } from '../store/order.query';
import { OrderStore } from '../store/order.store';
import { LimitOrderMatcher } from './orderMatchers/limitOrder.matcher';
import { MarketOrderMatcher } from './orderMatchers/marketOrder.matcher';
import { OrderMatchingService } from './orderMatching.service';

jest.mock('./configuration.service')

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
        ])
      }),
      expect.objectContaining({
        fills: expect.arrayContaining([
          expect.objectContaining({ tradeId: 2 }),
        ])
      }),
    ]))
  });

  it('should call correct OrderMatcher', async () => {
    const marketMatchSpy = jest.spyOn(MarketOrderMatcher.prototype, 'match');
    const limitMatchSpy = jest.spyOn(LimitOrderMatcher.prototype, 'match');

    await orderMatchingService.match('BTCUSDT', 10000);

    expect(marketMatchSpy).toHaveBeenCalledTimes(2);
    expect(limitMatchSpy).not.toHaveBeenCalled();
  });
});
