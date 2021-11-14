import { NewOrderLimit, NewOrderMarketBase, OrderSide, OrderType } from 'binance-api-node';
import { exchangeInfoQueryMock } from '../__mocks__/exchangeInfo.query.mock';
import container from '../container';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { OrderStore } from '../store/order.store';
import { OrderService } from './order.service';

describe('Order service', () => {
  let orderService: OrderService;
  let orderStore: OrderStore;
  let addSpy: jest.SpyInstance;

  const btcMarketBuy: NewOrderMarketBase = {
    symbol: 'BTCUSDT',
    type: <OrderType.MARKET>'MARKET',
    side: <OrderSide.BUY>'BUY',
    quantity: '1'
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

    orderService = container.resolve(OrderService);
    orderStore = container.resolve(OrderStore);

    addSpy = jest.spyOn(orderStore, 'add');
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it('should have incrementing order id\'s', async () => {
    await orderService.addFromOrderSpot(btcMarketBuy);
    await orderService.addFromOrderSpot(btcMarketBuy);

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ orderId: 1 }));
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ orderId: 2 }));
  });

  it('should add an MARKET Order to the OrderStore', async () => {
    await orderService.addFromOrderSpot(btcMarketBuy);

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: expect.any(String),
      symbol: 'BTCUSDT',
      status: 'NEW',
      side: 'BUY',
      timeInForce: 'GTC',
      type: 'MARKET'
    }));
  });

  it('should add an LIMIT Order to the OrderStore', async () => {
    await orderService.addFromOrderSpot(btcLimitSell);

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: expect.any(String),
      symbol: 'BTCUSDT',
      status: 'NEW',
      side: 'SELL',
      timeInForce: 'GTC',
      type: 'LIMIT'
    }));
  });
});
