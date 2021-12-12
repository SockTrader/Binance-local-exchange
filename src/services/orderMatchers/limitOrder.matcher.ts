import { Symbol } from 'binance-api-node';
import { injectable } from 'inversify';
import { InternalLimitOrder, InternalOrder } from '../../store/order.interfaces';
import { BaseOrderMatcher } from './baseOrderMatcher';

@injectable()
export class LimitOrderMatcher extends BaseOrderMatcher {

  shouldMatch(order: InternalOrder): boolean {
    return order.type === 'LIMIT';
  }

  match(symbol: Symbol, order: InternalLimitOrder, price: number): void {
    if (order.side === 'BUY' && price > order.price) return;
    if (order.side === 'SELL' && price < order.price) return;

    this.orderStore.update(order.clientOrderId, {
      price: order.price,
      origQty: order.origQty,
      executedQty: order.origQty,
      transactTime: new Date().getTime(),
      cummulativeQuoteQty: order.origQty * order.price,
      status: 'FILLED',
      fills: this._createFills(order, order.price, symbol, 1),
    });
  }

}
