import Binance from 'binance-api-node';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ConfigurationService } from '../../../config';
import { Controller } from '../../../controller';

@injectable()
export class TimeController implements Controller<'getTime'> {

  constructor(
    @inject(ConfigurationService) private readonly config: ConfigurationService,
  ) {
  }

  async getTime(req: Request, res: Response) {
    if (this.config.get('localTime')) {
      return res.header('X-Local', 'true').json(new Date().getTime());
    } else {
      return res.header('X-Local', 'false').json(await Binance().time());
    }
  }

}
