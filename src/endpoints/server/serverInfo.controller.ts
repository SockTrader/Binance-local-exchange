import config from 'config';
import { Request, Response } from 'express';
import { injectable } from 'inversify';
import { Controller } from '../controller';

@injectable()
export class ServerInfoController implements Controller<'getServerInfo'> {

  async getServerInfo(req: Request, res: Response) {
    return res
      .header('X-Local', 'true')
      .json(config);
  }

}
