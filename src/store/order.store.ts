import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Order } from 'binance-api-node';
import { injectable } from 'inversify';
import { OpenOrder } from './order.interfaces';

export interface OrderState extends EntityState<OpenOrder | Order, string> {
}

@injectable()
@StoreConfig({ name: 'order', idKey: 'clientOrderId' })
export class OrderStore extends EntityStore<OrderState> {

  constructor() {
    super();
  }

}
