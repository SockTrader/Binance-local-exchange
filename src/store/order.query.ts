import { QueryEntity } from '@datorama/akita';
import { Order, OrderStatus_LT } from 'binance-api-node';
import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { OpenOrder } from './order.interfaces';
import { OrderState, OrderStore } from './order.store';

@injectable()
export class OrderQuery extends QueryEntity<OrderState> {
  constructor(
    @inject(OrderStore) protected store: OrderStore
  ) {
    super(store);
  }

  getOpenOrdersForSymbol$(symbol: string): Observable<(Order | OpenOrder)[]> {
    return this.selectAll({
      filterBy: order => {
        return (<OrderStatus_LT[]>['NEW', 'PARTIALLY_FILLED']).includes(order.status) && order.symbol === symbol
      }
    });
  }
}
