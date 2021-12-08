import { QueryEntity } from '@datorama/akita';
import { OrderStatus_LT } from 'binance-api-node';
import { inject, injectable } from 'inversify';
import without from 'lodash.without';
import { map, mergeMap, Observable, pairwise, startWith } from 'rxjs';
import { InternalFilledOrder, InternalOrder } from './order.interfaces';
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

  /**
   * Emits a list of all filled orders
   * @returns {Observable<InternalFilledOrder[]>}
   */
  getFilledOrders$(): Observable<InternalFilledOrder[]> {
    return this.selectAll({
      filterBy: order => (order.status === <OrderStatus_LT>'FILLED')
    }) as Observable<InternalFilledOrder[]>;
  }

  /**
   * Emits a single order update by comparing prev and current emits
   * @returns {Observable<InternalFilledOrder>}
   */
  getFilledOrderUpdates$(): Observable<InternalFilledOrder> {
    return this.getFilledOrders$().pipe(
      startWith([]),
      pairwise(),
      map(([oldList, newList]) => without(newList, ...oldList)),
      mergeMap(v => v)
    );
  }
}
