import { InternalLimitOrder, InternalMarketOrder, InternalMarketQuoteOrder, InternalOrder } from './store/order.interfaces';

export const getBaseQuantity = (order: InternalOrder, price?: number): number => {
  if (!isInternalMarketQuoteOrder(order)) {
    return order.origQty;
  } else if (price != null) {
    return order.cummulativeQuoteQty / price;
  }

  throw new Error('Could not determine base quantity when price is undefined');
}

export const getQuoteQuantity = (order: InternalOrder, price?: number): number => {
  if (isInternalMarketQuoteOrder(order)) {
    return order.cummulativeQuoteQty;
  } else if (price != null) {
    return order.origQty * price
  }

  throw new Error('Could not determine quote quantity when price is undefined');
}

export const isInternalMarketOrder = (order: InternalOrder): order is InternalMarketOrder => 'origQty' in order && order.type === 'MARKET';

export const isInternalMarketQuoteOrder = (order: InternalOrder): order is InternalMarketQuoteOrder => 'cummulativeQuoteQty' in order && order.type === 'MARKET';

export const isInternalLimitOrder = (order: InternalOrder): order is InternalLimitOrder => order.type === 'LIMIT';
