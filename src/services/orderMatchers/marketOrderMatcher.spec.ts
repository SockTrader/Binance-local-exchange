import { internalBuyMarketMock, internalSellMarketMock } from '../../__mocks__/order.mock';
import { btcSymbolMock } from '../../__mocks__/symbol.mock';
import container from '../../container';
import { OrderStore } from '../../store/order.store';
import { MarketOrderMatcher } from './marketOrder.matcher';

jest.mock('../../services/configuration.service');

describe('MarketOrderMatcher', () => {

  let orderMatcher: MarketOrderMatcher;
  let updateOrderStoreSpy: jest.SpyInstance;

  beforeEach(() => {
    container.snapshot();

    orderMatcher = container.resolve(MarketOrderMatcher);
    updateOrderStoreSpy = jest.spyOn(container.resolve(OrderStore), 'update');
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it('should match order', () => {
    orderMatcher.match(btcSymbolMock, internalBuyMarketMock, 10000);

    expect(updateOrderStoreSpy).toHaveBeenCalledWith('1', expect.objectContaining({
      price: 10000,
      origQty: 1,
      executedQty: 1,
      cummulativeQuoteQty: 10000,
      status: 'FILLED',
    }));
  });

  it('should charge 10 USDT commission for a MARKET SELL order @ 10000 USDT', () => {
    orderMatcher.match(btcSymbolMock, internalSellMarketMock, 10000);

    expect(updateOrderStoreSpy).toHaveBeenCalledWith('2', expect.objectContaining({
      fills: expect.arrayContaining([{
        commission: 10,
        commissionAsset: 'USDT',
        price: 10000,
        qty: 1,
        tradeId: 1,
      }])
    }));
  });

  it('should charge 0.001 BTC commission for a MARKET BUY order @ 10000 USDT', () => {
    orderMatcher.match(btcSymbolMock, internalBuyMarketMock, 10000);

    expect(updateOrderStoreSpy).toHaveBeenCalledWith('1', expect.objectContaining({
      fills: expect.arrayContaining([{
        commission: 0.001,
        commissionAsset: 'BTC',
        price: 10000,
        qty: 1,
        tradeId: 1,
      }])
    }));
  });

});
