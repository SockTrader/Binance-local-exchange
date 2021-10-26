import { QueryEntity } from '@datorama/akita';
import { singleton } from '@ood/singleton';
import { OrderState, OrderStore } from './order.store';

@singleton
export class OrderQuery extends QueryEntity<OrderState> {
  constructor(protected store: OrderStore) {
    super(store);
  }
}

export default new OrderQuery(new OrderStore());
