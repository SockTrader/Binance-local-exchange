import { NewOrderLimit, NewOrderMarketBase, OrderSide, OrderType } from 'binance-api-node';
import container from '../container';
import { OrderStore } from '../store/order.store';
import { OrderService } from './order.service';

describe('Order service', () => {
  let orderService: OrderService;
  let orderStore: OrderStore;

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
    jest.clearAllMocks();

    orderStore = {
      add: jest.fn(),
    } as unknown as OrderStore;

    orderService = container.resolve(OrderService);
  });

  it('should have incrementing order id\'s', async () => {
    await orderService.addFromOrderSpot(btcMarketBuy);
    await orderService.addFromOrderSpot(btcMarketBuy);

    expect(orderStore.add).toHaveBeenCalledWith(expect.objectContaining({ orderId: 1 }));
    expect(orderStore.add).toHaveBeenCalledWith(expect.objectContaining({ orderId: 2 }));
  });

  it('should add an MARKET Order to the OrderStore', async () => {
    await orderService.addFromOrderSpot(btcMarketBuy);

    expect(orderStore.add).toHaveBeenCalledWith(expect.objectContaining({
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

    expect(orderStore.add).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: expect.any(String),
      symbol: 'BTCUSDT',
      status: 'NEW',
      side: 'SELL',
      timeInForce: 'GTC',
      type: 'LIMIT'
    }));
  });
});
