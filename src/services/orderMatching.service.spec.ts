import { of } from 'rxjs';
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
  let exchangeInfoQuery: ExchangeInfoQuery;

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
    exchangeInfoQuery = {
      getSymbol$: jest.fn(() => of({
        symbol: 'BTCUSDT',
        status: 'TRADING',
        baseAsset: 'BTC',
        baseAssetPrecision: 8,
        quoteAsset: 'USDT',
        quotePrecision: 8,
        quoteAssetPrecision: 8,
        baseCommissionPrecision: 8,
        quoteCommissionPrecision: 8,
        orderTypes: [
          'LIMIT',
          'LIMIT_MAKER',
          'MARKET',
          'STOP_LOSS_LIMIT',
          'TAKE_PROFIT_LIMIT'
        ],
        icebergAllowed: true,
        ocoAllowed: true,
        quoteOrderQtyMarketAllowed: true,
        isSpotTradingAllowed: true,
        isMarginTradingAllowed: true,
        filters: [
          {
            filterType: 'PRICE_FILTER',
            minPrice: '0.01000000',
            maxPrice: '1000000.00000000',
            tickSize: '0.01000000'
          },
          {
            filterType: 'PERCENT_PRICE',
            multiplierUp: '5',
            multiplierDown: '0.2',
            avgPriceMins: 5
          },
          {
            filterType: 'LOT_SIZE',
            minQty: '0.00001000',
            maxQty: '9000.00000000',
            stepSize: '0.00001000'
          },
          {
            filterType: 'MIN_NOTIONAL',
            minNotional: '10.00000000',
            applyToMarket: true,
            avgPriceMins: 5
          },
          {
            filterType: 'ICEBERG_PARTS',
            limit: 10
          },
          {
            filterType: 'MARKET_LOT_SIZE',
            minQty: '0.00000000',
            maxQty: '95.46320577',
            stepSize: '0.00000000'
          },
          {
            filterType: 'MAX_NUM_ORDERS',
            maxNumOrders: 200
          },
          {
            filterType: 'MAX_NUM_ALGO_ORDERS',
            maxNumAlgoOrders: 5
          }
        ],
        permissions: [
          'SPOT',
          'MARGIN'
        ]
      })),
    } as unknown as ExchangeInfoQuery;

    //orderStore = new OrderStore();
    //orderQuery = new OrderQuery(orderStore);

    orderMatchingService = container.resolve(OrderMatchingService);
    orderStore = container.resolve(OrderStore);

    orderStore.set([buyOrder, sellOrder]);
  });

  afterEach(() => {
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
    (exchangeInfoQuery.getSymbol$ as jest.Mock).mockReset().mockReturnValueOnce(of(undefined));
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
