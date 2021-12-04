import { prices } from '../__mocks__/binance-api-node';
import container from '../container';
import { BinanceService } from './binance.service';

describe('BinanceService', () => {

  let binanceService: BinanceService;

  beforeEach(() => {
    container.snapshot();
    jest.useFakeTimers();

    binanceService = container.resolve(BinanceService);
  });

  afterEach(() => {
    container.restore();

    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('getCurrentPrice', () => {
    it('should fetch latest price from Binance API if not cached', async () => {
      const price = await binanceService.getCurrentPrice('BTCUSDT');

      expect(price).toEqual(10000);
      expect(prices).toHaveBeenCalledWith({ symbol: 'BTCUSDT' })
    });

    it('should not fetch latest price twice when called within PRICE_CACHE_TIME', async () => {
      await binanceService.getCurrentPrice('BTCUSDT');

      jest.advanceTimersByTime(1000 * 60);

      await binanceService.getCurrentPrice('BTCUSDT');

      expect(prices).toHaveBeenCalledOnce();
    });

    it('should re-fetch latest price when PRICE_CACHE_TIME has been expired', async () => {
      await binanceService.getCurrentPrice('BTCUSDT');
      await binanceService.getCurrentPrice('BTCUSDT');

      jest.advanceTimersByTime(1000 * 60 + 1);

      await binanceService.getCurrentPrice('BTCUSDT');

      expect(prices).toHaveBeenCalledTimes(2);
    });

    it('should throw if price could not be determined', async () => {
      prices.mockReset().mockRejectedValue('' as never);
      await expect(binanceService.getCurrentPrice('DOES_NOT_EXIST')).rejects.toThrowError('Unable to determine price for symbol \"DOES_NOT_EXIST\"');
    });
  });
});
