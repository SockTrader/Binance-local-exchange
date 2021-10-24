import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Order } from '../entities/order';

export interface OrderState extends EntityState<Order, number> {
  orders: Order[];
}

export const createInitialState = (): OrderState => ({
  orders: [],
});

// @TODO idKey ..

@StoreConfig({ name: 'order', idKey: '_id' })
export class OrderStore extends EntityStore<OrderState> {
  constructor() {
    super(createInitialState());
  }
}
