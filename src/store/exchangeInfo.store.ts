import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { singleton } from '@ood/singleton';
import { Symbol } from 'binance-api-node';

export interface ExchangeInfoState extends EntityState<Symbol, number> {
}

@singleton
@StoreConfig({ name: 'exchangeInfo', idKey: 'symbol' })
export class ExchangeInfoStore extends EntityStore<ExchangeInfoState> {
  constructor() {
    super();
  }
}
