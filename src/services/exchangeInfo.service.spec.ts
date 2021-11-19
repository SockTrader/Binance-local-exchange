import { of } from 'rxjs';
import { exchangeInfoQueryMock } from '../__mocks__/exchangeInfo.query.mock';
import container from '../container';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { ExchangeInfoService } from './exchangeInfo.service';

describe('ExchangeInfoService', () => {

  let exchangeInfoService: ExchangeInfoService;

  beforeEach(() => {
    container.snapshot();

    container.rebind(ExchangeInfoQuery).toConstantValue(exchangeInfoQueryMock);
    exchangeInfoService = container.resolve(ExchangeInfoService);
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it('should throw when symbol could not be found in cache', async () => {
    (exchangeInfoQueryMock.getSymbol$ as jest.Mock).mockReturnValueOnce(of(undefined));
    await expect(() => exchangeInfoService.getSymbol('ETHUSDT')).rejects.toThrowError('Symbol \'ETHUSDT\' could not be found in ExchangeInfo cache.');
  });

});
