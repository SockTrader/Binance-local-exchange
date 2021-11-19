import { internalBuyLimitMock } from '../../__mocks__/order.mock';
import { btcSymbolMock } from '../../__mocks__/symbol.mock';
import container from '../../container';
import { InternalOrder } from '../../store/order.interfaces';
import { OrderStore } from '../../store/order.store';
import { LimitOrderMatcher } from './limitOrder.matcher';

describe('LimitOrderMatcher', () => {

  let orderMatcher: LimitOrderMatcher;

  const orderStoreMock = {
    update: jest.fn(),
    getNewTradeId: jest.fn(() => Math.round(Math.random() * 1000)),
  };

  beforeEach(() => {
    container.snapshot();

    container.rebind(OrderStore).toConstantValue(orderStoreMock as unknown as OrderStore);
    orderMatcher = container.resolve(LimitOrderMatcher);
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it.concurrent.each`
    type                      | expected
    ${'LIMIT'}                | ${true}
    ${'MARKET'}               | ${false}
    ${'LIMIT_MAKER'}          | ${false}
    ${'STOP'}                 | ${false}
    ${'STOP_MARKET'}          | ${false}
    ${'STOP_LOSS_LIMIT'}      | ${false}
    ${'TAKE_PROFIT_LIMIT'}    | ${false}
    ${'TAKE_PROFIT_MARKET'}   | ${false}
    ${'TRAILING_STOP_MARKET'} | ${false}
  `('should return $expected if order of $type is given', ({ type, expected }) => {
    expect(orderMatcher.shouldMatch({ type: type } as InternalOrder)).toEqual(expected);
  })

  it.concurrent.each([
    [3000.001],
    [3001]
  ])('should not match if price (%i) does not goes below or equals order price (3000)', async (price) => {
    orderMatcher.match(btcSymbolMock, internalBuyLimitMock, price);
    expect(orderStoreMock.update).not.toHaveBeenCalled();
  });

  it.concurrent.each([
    [3000],
    [2999]
  ])('should match if price (%i) goes below or equals order price (3000)', async (price) => {
    orderMatcher.match(btcSymbolMock, internalBuyLimitMock, price);
    expect(orderStoreMock.update).toHaveBeenCalledWith('id-abc', expect.objectContaining({
      status: 'FILLED',
      price: 3000,
      origQty: 1,
      cummulativeQuoteQty: 3000,
      executedQty: 1,
    }));
  });

  it.concurrent.each([
    [2890],
    [2999.99]
  ])('should not match if price (%i) does not goes above or equals order price (3000)', async (price) => {
    orderMatcher.match(btcSymbolMock, { ...internalBuyLimitMock, side: 'SELL' }, price);
    expect(orderStoreMock.update).not.toHaveBeenCalled();
  });

  it.concurrent.each([
    [3000],
    [3000.001],
    [3001]
  ])('should match if price (%i) goes above or equals order price (3000)', async (price) => {
    orderMatcher.match(btcSymbolMock, { ...internalBuyLimitMock, side: 'SELL' }, price);
    expect(orderStoreMock.update).toHaveBeenCalledWith('id-abc', expect.objectContaining({
      status: 'FILLED',
      price: 3000,
      origQty: 1,
      cummulativeQuoteQty: 3000,
      executedQty: 1,
    }));
  });

});
