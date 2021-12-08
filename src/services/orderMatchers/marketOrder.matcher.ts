import { Symbol } from 'binance-api-node';
import { injectable } from 'inversify';
import { getBaseQuantity, getQuoteQuantity } from '../../internalOrder.utils';
import { InternalOrder } from '../../store/order.interfaces';
import { BaseOrderMatcher } from './baseOrderMatcher';

@injectable()
export class MarketOrderMatcher extends BaseOrderMatcher {

  shouldMatch(order: InternalOrder): boolean {
    return order.type === 'MARKET';
  }

  match(symbol: Symbol, order: InternalOrder, price: number): void {
    const quantity = getBaseQuantity(order, price);
    const executedQuantity = quantity;
    const cumQuoteQuantity = getQuoteQuantity(order, price);

    this.orderStore.update(order.clientOrderId, {
      price: price,
      origQty: quantity,
      executedQty: executedQuantity,
      cummulativeQuoteQty: cumQuoteQuantity,
      status: 'FILLED',
      fills: this._createFills(order, price, symbol, 1),
    });
  }

}
