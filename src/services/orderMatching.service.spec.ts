import { of } from 'rxjs';
import { exchangeInfoQueryMock } from '../__mocks__/exchangeInfo.query.mock';
import container from '../container';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { OpenOrder } from '../store/order.interfaces';
import { OrderQuery } from '../store/order.query';
import { OrderStore } from '../store/order.store';
import { OrderMatchingService } from './orderMatching.service';

describe('Order Matching service', () => {
  let orderMatchingService: OrderMatchingService;
  let orderStore: OrderStore;
  let orderQuery: OrderQuery;

  const buyOrder: OpenOrder = {
    type: 'MARKET',
    symbol: 'BTCUSDT',
    status: 'NEW',
    clientOrderId: '1',
    side: 'BUY',
    quantity: 1,
    isWorking: true,
    orderId: 1,
    orderListId: -1,
    timeInForce: 'GTC',
    time: new Date().getTime(),
    updateTime: new Date().getTime(),
  }

  const sellOrder: OpenOrder = {
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

  it('should throw when symbol could not be found in cache', async () => {
    (exchangeInfoQueryMock.getSymbol$ as jest.Mock).mockReturnValueOnce(of(undefined));
    await expect(() => orderMatchingService.match('ETHUSDT', 10000)).rejects.toThrowError('Symbol \'ETHUSDT\' could not be found in ExchangeInfo cache.');
  });

  it('should contain filled trades for a MARKET BUY Order', async () => {
    await orderMatchingService.match('BTCUSDT', 10000);

    const [buy] = orderQuery.getAll().filter(o => o.side === 'BUY');
    expect(buy).toEqual(expect.objectContaining({
      fills: [
        {
          commission: '0.00050000',
          commissionAsset: 'BTC',
          price: '10000.00000000',
          qty: '0.50000000',
          tradeId: 1,
        },
        {
          commission: '0.00050000',
          commissionAsset: 'BTC',
          price: '10000.00000000',
          qty: '0.50000000',
          tradeId: 2,
        }
      ],
    }));
  });

  it('should contain filled trades for a MARKET SELL Order', async () => {
    await orderMatchingService.match('BTCUSDT', 10000);

    const [sell] = orderQuery.getAll().filter(o => o.side === 'SELL');
    expect(sell).toEqual(expect.objectContaining({
      fills: [
        {
          commission: '5.00000000',
          commissionAsset: 'USDT',
          price: '10000.00000000',
          qty: '0.50000000',
          tradeId: 3,
        },
        {
          commission: '5.00000000',
          commissionAsset: 'USDT',
          price: '10000.00000000',
          qty: '0.50000000',
          tradeId: 4,
        }
      ],
    }));
  });
});
