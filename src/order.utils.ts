import { NewOrderMarketBase, NewOrderMarketQuote, NewOrderSpot, Symbol } from 'binance-api-node';

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

export const getBaseQuantity = (order: NewOrderSpot, price: number): number => {
  if (isOrderMarketQuote(order)) {
    return parseFloat(order.quoteOrderQty) / price;
  }

  return parseFloat(order.quantity);
}

export const getQuoteQuantity = (order: NewOrderSpot, price: number): number => {
  if (isOrderMarketQuote(order)) {
    return parseFloat(order.quoteOrderQty);
  }

  return parseFloat(order.quantity) * price;
}

export const isOrderMarketBase = (order: NewOrderSpot): order is NewOrderMarketBase => {
  return 'quantity' in order;
}

export const isOrderMarketQuote = (order: NewOrderSpot): order is NewOrderMarketQuote => {
  return 'quoteOrderQty' in order;
}
