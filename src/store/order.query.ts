import { QueryEntity } from '@datorama/akita';
import { OrderStatus_LT } from 'binance-api-node';
import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { InternalOrder } from './order.interfaces';
import { OrderState, OrderStore } from './order.store';

@injectable()
export class OrderQuery extends QueryEntity<OrderState> {
  constructor(
    @inject(OrderStore) protected store: OrderStore
  ) {
    super(store);
  }

  getOpenOrdersForSymbol$(symbol: string): Observable<InternalOrder[]> {
    return this.selectAll({
      filterBy: order => {
        return (<OrderStatus_LT[]>['NEW', 'PARTIALLY_FILLED']).includes(order.status) && order.symbol === symbol
      }
    });
  }

  getFilledOrders$(): Observable<InternalOrder[]> {
    return this.selectAll({
      filterBy: order => (order.status === <OrderStatus_LT>'FILLED')
    });

  }
}
