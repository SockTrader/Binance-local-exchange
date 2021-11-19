import { OrderType, Symbol } from 'binance-api-node';
import config from 'config';
import { inject, injectable } from 'inversify';
import { getBaseQuantity } from '../../internalOrder.utils';
import { InternalOrder, InternalOrderFill } from '../../store/order.interfaces';
import { OrderStore } from '../../store/order.store';

@injectable()
export abstract class BaseOrderMatcher {

  abstract shouldMatch(order: InternalOrder): boolean;

  abstract match(symbol: Symbol, order: InternalOrder, price: number): void;

  constructor(
    @inject(OrderStore) protected orderStore: OrderStore
  ) {
  }

  protected _createFills(order: InternalOrder, price: number, symbol: Symbol, amount: number = 1): InternalOrderFill[] | undefined {
    const quantity = getBaseQuantity(order, price);
    const commission: number = order.type === <OrderType.MARKET>'MARKET'
      ? config.get('fees.taker')
      : config.get('fees.maker');

    let fills: InternalOrderFill[] = [];

    for (let i = 0; i < amount; i++) {
      const individualTradeQty = quantity / amount;

      const fee = order.side === 'BUY'
        ? individualTradeQty * commission
        : individualTradeQty * (commission * price);

      fills.push({
        tradeId: this.orderStore.getNewTradeId(),
        price: price,
        qty: individualTradeQty,
        commissionAsset: order.side === 'BUY' ? symbol.baseAsset : symbol.quoteAsset,
        commission: fee
      });
    }

    return fills;
  }

}
