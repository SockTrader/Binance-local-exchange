import config from 'config';
import { Request, Response } from 'express';
import { exchangeInfoGETHandler } from './exchangeInfo.controller';

jest.mock('config');
jest.mock('binance-api-node');

xdescribe('ExchangeInfo', () => {

  const configSpy = jest.spyOn(config, 'get');

  describe('As local', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      req = {} as Request;
      res = { json: jest.fn(), header: jest.fn(() => res) } as unknown as Response<any, any>;

      configSpy.mockReturnValueOnce(true);
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('Should return local JSON as response', async () => {
      await exchangeInfoGETHandler(req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        timezone: 'UTC',
        serverTime: expect.any(Number),
        rateLimits: expect.arrayContaining([
          expect.objectContaining({
            rateLimitType: expect.any(String),
            interval: expect.any(String),
            intervalNum: expect.any(Number),
            limit: expect.any(Number),
          })
        ]),
        exchangeFilters: expect.any(Array),
        symbols: expect.arrayContaining([
          expect.objectContaining({
            symbol: 'ETHBTC',
            status: expect.any(String),
            baseAsset: "ETH",
            quoteAsset: "BTC",
          })
        ])
      }));
    });

    it('Should set Content-Type header', async () => {
      await exchangeInfoGETHandler(req, res, jest.fn());

      expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/json');
    });

    it('Should set X-Local header', async () => {
      await exchangeInfoGETHandler(req, res, jest.fn());

      expect(res.header).toHaveBeenCalledWith('X-Local', 'true');
    });
  });

  describe('As remote', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      req = {} as Request;
      res = { json: jest.fn(), header: jest.fn(() => res) } as unknown as Response<any, any>;

      configSpy.mockReturnValueOnce(false);
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('Should set Content-Type header', async () => {
      await exchangeInfoGETHandler(req, res, jest.fn());

      expect(res.header).toHaveBeenCalledWith('Content-Type', 'application/json');
    });

    it('Should set X-Local header', async () => {
      await exchangeInfoGETHandler(req, res, jest.fn());

      expect(res.header).toHaveBeenCalledWith('X-Local', 'false');
    });
  });

});
