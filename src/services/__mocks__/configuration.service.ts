import { injectable } from 'inversify';
import { ApplicationConfig } from '../configuration.service';

const config: ApplicationConfig = {
  IKNOWWHATIAMDOING: true,
  feeMaker: 0.001,
  feeTaker: 0.001,
  localTime: true,
  localExchangeInfo: true,
  port: 8000
};

@injectable()
export class ConfigurationService {
  getAll = jest.fn(() => config);

  get = jest.fn(<K extends keyof ApplicationConfig>(key: K) => {
    return config[key];
  });
}
