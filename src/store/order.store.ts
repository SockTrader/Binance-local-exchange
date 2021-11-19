import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { injectable } from 'inversify';
import { InternalOrder } from './order.interfaces';

export interface OrderState extends EntityState<InternalOrder, string> {
  orderId: number;
  tradeId: number;
}

export function createInitialState(): OrderState {
  return {
    orderId: 0,
    tradeId: 0
  };
}

@injectable()
@StoreConfig({ name: 'order', idKey: 'clientOrderId' })
export class OrderStore extends EntityStore<OrderState> {

  constructor() {
    super(createInitialState());
  }

  getNewTradeId(): number {
    this.update(state => ({
      tradeId: state.tradeId + 1
    }));

    return this.getValue().tradeId;
  }

  createNewOrderId(): number {
    this.update(state => ({
      orderId: state.orderId + 1
    }));

    return this.getValue().orderId;
  }

}
