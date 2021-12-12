import { InternalLimitOrder, InternalMarketOrder } from '../store/order.interfaces';

export const internalBuyMarketMock: InternalMarketOrder = {
  origQty: 1,
  clientOrderId: '1',
  isWorking: true,
  orderId: 1,
  orderListId: -1,
  side: 'BUY',
  status: 'NEW',
  symbol: 'BTCUSDT',
  time: 1637137810715,
  timeInForce: 'GTC',
  transactTime: 1637137810715,
  type: 'MARKET',
  updateTime: 1637137810715,
}

export const internalSellMarketMock: InternalMarketOrder = {
  ...internalBuyMarketMock,
  clientOrderId: '2',
  side: 'SELL',
}

export const internalBuyLimitMock: InternalLimitOrder = {
  origQty: 1,
  cummulativeQuoteQty: 1,
  side: 'BUY',
  status: 'NEW',
  type: 'LIMIT',
  symbol: 'BTCUSDT',
  clientOrderId: '3',
  isWorking: true,
  orderId: 1,
  orderListId: -1,
  time: 1637137810715,
  timeInForce: 'GTC',
  price: 3000,
  updateTime: 1637137810715,
}

export const internalSellLimitMock: InternalLimitOrder = {
  ...internalBuyLimitMock,
  clientOrderId: '4',
  side: 'SELL',
}
