import { Container } from 'inversify';
import { BinanceService } from './services/binance.service';
import { ExchangeInfoService } from './services/exchangeInfo.service';
import { OrderService } from './services/order.service';
import { LimitOrderMatcher } from './services/orderMatchers/limitOrder.matcher';
import { MarketOrderMatcher } from './services/orderMatchers/marketOrder.matcher';
import { BaseOrderMatcher } from './services/orderMatchers/baseOrderMatcher';
import { OrderMatchingService } from './services/orderMatching.service';
import { ExchangeInfoQuery } from './store/exchangeInfo.query';
import { ExchangeInfoStore } from './store/exchangeInfo.store';
import { OrderQuery } from './store/order.query';
import { OrderStore } from './store/order.store';

const container = new Container({ skipBaseClassChecks: true });

container.bind<BaseOrderMatcher>(BaseOrderMatcher).to(MarketOrderMatcher);
container.bind<BaseOrderMatcher>(BaseOrderMatcher).to(LimitOrderMatcher);

container.bind<OrderQuery>(OrderQuery).toSelf();
container.bind<ExchangeInfoQuery>(ExchangeInfoQuery).toSelf();
container.bind<ExchangeInfoService>(ExchangeInfoService).toSelf();

container.bind<OrderService>(OrderService).toSelf().inSingletonScope();
container.bind<OrderMatchingService>(OrderMatchingService).toSelf().inSingletonScope();
container.bind<OrderStore>(OrderStore).toSelf().inSingletonScope();
container.bind<ExchangeInfoStore>(ExchangeInfoStore).toSelf().inSingletonScope();
container.bind<BinanceService>(BinanceService).toSelf().inSingletonScope();

export default container;
