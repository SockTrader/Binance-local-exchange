import Binance from 'binance-api-node';
import { Request, Response } from 'express';
import { injectable } from 'inversify';
import { config } from '../../../config';
import { Controller } from '../../../controller';

@injectable()
export class TimeController implements Controller<'getTime'>{

  async getTime(req: Request, res: Response) {
    if (config.local.time) {
      return res.header('X-Local', 'true').json(new Date().getTime());
    } else {
      return res.header('X-Local', 'false').json(await Binance().time());
    }
  }

}
