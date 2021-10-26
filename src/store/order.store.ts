import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { singleton } from '@ood/singleton';
import { Order } from 'binance-api-node';

export interface OrderState extends EntityState<Order, number> {
}

@singleton
@StoreConfig({ name: 'order', idKey: 'clientOrderId' })
export class OrderStore extends EntityStore<OrderState> {

  constructor() {
    super();
  }

}
