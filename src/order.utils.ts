import { NewOrderLimit, NewOrderMarketBase, NewOrderMarketQuote, NewOrderSpot, OrderType, Symbol } from 'binance-api-node';

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

export const isLimitOrder = (order: NewOrderSpot): order is NewOrderLimit => order.type === <OrderType.LIMIT>'LIMIT'

export const isMarketOrder = (order: NewOrderSpot): order is NewOrderMarketBase | NewOrderMarketQuote => order.type === <OrderType.MARKET>'MARKET'

export const isMarketOrderBase = (order: NewOrderSpot): order is NewOrderMarketBase => 'quantity' in order;

export const isMarketOrderQuote = (order: NewOrderSpot): order is NewOrderMarketQuote => 'quoteOrderQty' in order;
