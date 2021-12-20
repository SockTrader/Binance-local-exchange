import { Request, Response } from 'express';
import container from '../../container';
import { ConfigurationService } from '../../services/configuration.service';
import { ConfigController } from './config.controller';

describe('ConfigController', () => {

  let controller: ConfigController;

  const res = { json: jest.fn(), header: jest.fn(() => res) } as unknown as Response<any, any>;
  const configurationService = { getAll: jest.fn() };

  beforeEach(() => {
    container.snapshot();

    container.rebind(ConfigurationService).toConstantValue(configurationService as unknown as ConfigurationService);
    controller = container.resolve(ConfigController);
  })

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  })

  it('should return all configuration options', async () => {
    configurationService.getAll.mockReturnValueOnce({ config: 'mocked' });

    await controller.getConfig({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({ config: 'mocked' });
  });

});
