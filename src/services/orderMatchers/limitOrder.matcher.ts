import { Symbol } from 'binance-api-node';
import { injectable } from 'inversify';
import { isInternalLimitOrder } from '../../internalOrder.utils';
import { InternalOrder } from '../../store/order.interfaces';
import { BaseOrderMatcher } from './baseOrderMatcher';

@injectable()
export class LimitOrderMatcher extends BaseOrderMatcher {

  shouldMatch(order: InternalOrder): boolean {
    return order.type === 'LIMIT';
  }

  match(symbol: Symbol, order: InternalOrder, price: number): void {
    if (!isInternalLimitOrder(order)) throw new Error('Limit order matcher can only match LIMIT orders');

    if (order.side === 'BUY' && price > order.price) return;
    if (order.side === 'SELL' && price < order.price) return;

    this.orderStore.update(order.clientOrderId, {
      price: order.price,
      origQty: order.origQty,
      executedQty: order.origQty,
      transactTime: new Date().getTime(),
      cummulativeQuoteQty: order.origQty * order.price,
      status: 'FILLED',
      fills: this._createFills(order, price, symbol, 2),
    });
  }

}
