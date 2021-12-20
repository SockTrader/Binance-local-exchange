import container from '../container';
import { ApplicationConfig, ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {

  let service: ConfigurationService;

  beforeEach(() => {
    container.snapshot();

    service = container.resolve(ConfigurationService);
    service.setApplicationConfig({
      port: 1000,
      localTime: true
    } as ApplicationConfig);
  });

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  });

  it('should return a value for a given config key', () => {
    expect(service.get('port')).toEqual(1000);
  });

  it('should return all config values', () => {
    expect(service.getAll()).toEqual({ localTime: true, port: 1000 });
  });

  it('should throw if key could not be found', () => {
    expect(() => service.get('DOES_NOT_EXIST' as keyof ApplicationConfig)).toThrowError('DOES_NOT_EXIST could not be found in configuration')
  });

});
