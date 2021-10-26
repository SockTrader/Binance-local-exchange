import { QueryEntity } from '@datorama/akita';
import { singleton } from '@ood/singleton';
import { map, Observable } from 'rxjs';
import { Symbol } from 'binance-api-node';
import { ExchangeInfoState, ExchangeInfoStore } from './exchangeInfo.store';

@singleton
export class ExchangeInfoQuery extends QueryEntity<ExchangeInfoState> {
  constructor(protected store: ExchangeInfoStore) {
    super(store);
  }

  getSymbol$(symbol: string): Observable<Symbol | undefined> {
    return this.selectAll({
      filterBy: ({ symbol: currentSymbol }) => currentSymbol.toUpperCase() === symbol.toUpperCase()
    }).pipe(
      map(v => v[0])
    );
  }
}

export default new ExchangeInfoQuery(new ExchangeInfoStore());
