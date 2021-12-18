import { OrderType, Symbol } from 'binance-api-node';
import { inject, injectable } from 'inversify';
import { ConfigurationService } from '../configuration.service';
import { InternalOrder, InternalOrderFill } from '../../store/order.interfaces';
import { OrderStore } from '../../store/order.store';
import { getBaseQuantity } from '../../utils/internalOrder.utils';

@injectable()
export abstract class BaseOrderMatcher {

  constructor(
    @inject(OrderStore) protected orderStore: OrderStore,
    @inject(ConfigurationService) private readonly config: ConfigurationService,
  ) {
  }

  abstract shouldMatch(order: InternalOrder): boolean;

  abstract match(symbol: Symbol, order: InternalOrder, price: number): void;

  protected _createFills(order: InternalOrder, price: number, symbol: Symbol, amount: number = 1): InternalOrderFill[] | undefined {
    const quantity = getBaseQuantity(order, price);
    const commission: number = order.type === <OrderType.MARKET>'MARKET'
      ? this.config.get('feeTaker')
      : this.config.get('feeMaker');

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
