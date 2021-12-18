import Binance from 'binance-api-node';
import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { ConfigurationService } from '../../../services/configuration.service';
import { Controller } from '../../../controller';
import { ExchangeInfoStore } from '../../../store/exchangeInfo.store';

@injectable()
export class ExchangeInfoController implements Controller<'getExchangeInfo'> {

  constructor(
    @inject(ExchangeInfoStore) private readonly exchangeInfoStore: ExchangeInfoStore,
    @inject(ConfigurationService) private readonly config: ConfigurationService,
  ) {
  }

  async getExchangeInfo(req: Request, res: Response) {
    if (this.config.get('localExchangeInfo')) {
      const filepath = path.join(__dirname, './../../../data/exchangeInfo.data.json');
      const result = JSON.parse(await fs.readFile(filepath, 'utf8'));

      this.exchangeInfoStore.upsertMany(result.symbols);

      return res
        .header('Content-Type', 'application/json')
        .header('X-Local', 'true')
        .json(result);
    } else {
      const result = await Binance().exchangeInfo();

      this.exchangeInfoStore.upsertMany(result.symbols);

      return res.header('X-Local', 'false').json(result);
    }
  }

}
