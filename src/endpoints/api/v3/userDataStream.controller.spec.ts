import { Request, Response } from 'express';
import container from '../../container';
import { UserDataStreamController } from './userDataStream.controller';

describe('UserDataStream', () => {

  const res = { header: jest.fn(() => res), json: jest.fn() } as unknown as Response<any, any>;
  const controller: UserDataStreamController = container.resolve(UserDataStreamController);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return a listenKey', async () => {
    await controller.postUserDataStream({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      listenKey: 'userDataStream',
    });
  });

  it('Should return empty response when refreshing listenKey', async () => {
    await controller.putUserDataStream({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({});
  });

  it('Should return empty response when deleting listenKey', async () => {
    await controller.deleteUserDataStream({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({});
  });

  it.concurrent.each([
    [controller.postUserDataStream.bind(controller)],
    [controller.putUserDataStream.bind(controller)],
    [controller.deleteUserDataStream.bind(controller)],
  ])('Should set X-Local header', async (fn) => {
    await fn({} as Request, res);
    expect(res.header).toHaveBeenCalledWith('X-Local', 'true');
  });

});
