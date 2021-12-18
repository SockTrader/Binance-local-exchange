import { injectable } from 'inversify';

export interface ApplicationConfig {
  port: number;
  localTime: boolean;
  localExchangeInfo: boolean;
  feeMaker: number;
  feeTaker: number;
  IKNOWWHATIAMDOING: boolean;
}

@injectable()
export class ConfigurationService {

  private config!: ApplicationConfig;

  setApplicationConfig(cfg: ApplicationConfig) {
    this.config = cfg;
  }

  get<K extends keyof ApplicationConfig>(key: K) {
    if (!(key in this.config)) {
      throw new Error(`${key} could not be found in configuration`);
    }

    return this.config[key];
  }

  getAll() {
    return this.config;
  }
}
