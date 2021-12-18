import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ConfigurationService } from '../../services/configuration.service';
import { Controller } from '../../controller';

@injectable()
export class ConfigController implements Controller<'getConfig'> {

  constructor(
    @inject(ConfigurationService) private readonly config: ConfigurationService,
  ) {
  }

  async getConfig(req: Request, res: Response) {
    return res
      .header('X-Local', 'true')
      .json(this.config.getAll());
  }

}
