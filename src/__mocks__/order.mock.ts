import { InternalLimitOrder, InternalMarketOrder } from '../store/order.interfaces';

export const internalBuyMarketMock: InternalMarketOrder = {
  origQty: 1,
  clientOrderId: 'id-abc',
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

export const internalBuyLimitMock: InternalLimitOrder = {
  origQty: 1,
  cummulativeQuoteQty: 1,
  side: 'BUY',
  status: 'NEW',
  type: 'LIMIT',
  symbol: 'BTCUSDT',
  clientOrderId: 'id-abc',
  isWorking: true,
  orderId: 1,
  orderListId: -1,
  time: 1637137810715,
  timeInForce: 'GTC',
  price: 3000,
  updateTime: 1637137810715,
}
