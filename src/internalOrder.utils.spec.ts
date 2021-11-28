import { getBaseQuantity, getQuoteQuantity } from './internalOrder.utils';
import { InternalOrder } from './store/order.interfaces';

describe('InternalOrderUtils', () => {

  const quoteMarketOrder: InternalOrder = {
    type: 'MARKET',
    cummulativeQuoteQty: 10
  } as InternalOrder;

  const marketOrder: InternalOrder = {
    type: 'MARKET',
    origQty: 10
  } as InternalOrder;

  it('should return base quantity for Market Order', () => {
    expect(getBaseQuantity(marketOrder)).toEqual(10);
  });

  it('should return base quantity for Quote Market Order', () => {
    expect(getBaseQuantity(quoteMarketOrder, 500)).toEqual(0.02);
  });

  it('should throw if price is undefined for Quote Market Order', () => {
    expect(() => getBaseQuantity(quoteMarketOrder)).toThrow('Could not determine base quantity');
  });

  it('should return quote quantity for Market Order', () => {
    expect(getQuoteQuantity(marketOrder, 500)).toEqual(5000);
  });

  it('should return quote quantity for Quote Market Order', () => {
    expect(getQuoteQuantity(quoteMarketOrder)).toEqual(10);
  });

  it('should throw if price is undefined for Quote Market Order', () => {
    expect(() => getQuoteQuantity(marketOrder)).toThrow('Could not determine quote quantity');
  });
});
