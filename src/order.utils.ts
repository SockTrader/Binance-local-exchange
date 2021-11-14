import { NewOrderLimit, NewOrderSpot, OrderType, Symbol } from 'binance-api-node';
import { WithQuantity, WithQuoteQuantity } from './store/order.interfaces';

export enum FixedFormat {
  BAP, // baseAssetPrecision
  BCP, // baseCommissionPrecision
  QAP, // quoteAssetPrecision
  QCP, // quoteCommissionPrecision
  QP // quotePrecision
}

export const createFixedFormatter = (symbol: Symbol) => (value: number, format: FixedFormat) => {
  switch (format) {
    case FixedFormat.BAP:
      return value.toFixed(symbol.baseAssetPrecision);
    case FixedFormat.BCP:
      return value.toFixed(symbol.baseCommissionPrecision);
    case FixedFormat.QAP:
      return value.toFixed(symbol.quoteAssetPrecision);
    case FixedFormat.QCP:
      return value.toFixed(symbol.quoteCommissionPrecision);
    case FixedFormat.QP:
      return value.toFixed(symbol.quotePrecision);
    default:
      throw new Error('Invalid format given');
  }
};

export const getBaseQuantity = <T>(order: unknown, price: number): number => {
  if (isOrderMarketQuote(order)) {
    return order.quoteOrderQty / price;
  }

  if (isOrderMarketBase(order)) {
    return order.quantity;
  }

  throw new Error('Invalid order given');
}

export const getQuoteQuantity = <T>(order: unknown, price: number): number => {
  if (isOrderMarketQuote(order)) {
    return order.quoteOrderQty;
  }

  if (isOrderMarketBase(order)) {
    return order.quantity * price;
  }

  throw new Error('Invalid order given');
}

export const isOrderMarketBase = <T>(order: T): order is WithQuantity<T> => {
  return 'quantity' in order;
}

export const isOrderMarketQuote = <T>(order: T): order is WithQuoteQuantity<T> => {
  return 'quoteOrderQty' in order;
}

export const isLimitOrder = (order: NewOrderSpot): order is NewOrderLimit => {
  return order.type === <OrderType.LIMIT>'LIMIT'
}

export const isMarketOrder = (order: NewOrderSpot): order is NewOrderLimit => {
  return order.type === <OrderType.MARKET>'MARKET'
}
