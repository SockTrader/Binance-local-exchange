import { Request, Response } from 'express';
import { userDataStreamDELETEHandler, userDataStreamPOSTHandler, userDataStreamPUTHandler } from './userDataStream';

describe('UserDataStream', () => {

  const res = { header: jest.fn(() => res), json: jest.fn() } as unknown as Response<any, any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return a listenKey', async () => {
    await userDataStreamPOSTHandler({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      listenKey: 'userDataStream',
    });
  });

  it('Should return empty response when refreshing listenKey', async () => {
    await userDataStreamPUTHandler({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({});
  });

  it('Should return empty response when deleting listenKey', async () => {
    await userDataStreamDELETEHandler({} as Request, res);

    expect(res.json).toHaveBeenCalledWith({});
  });

  it.concurrent.each([
    [userDataStreamPOSTHandler],
    [userDataStreamPUTHandler],
    [userDataStreamDELETEHandler],
  ])('Should set X-Local header', async (fn) => {
    await fn({} as Request, res);
    expect(res.header).toHaveBeenCalledWith( 'X-Local', 'true');
  });

});
