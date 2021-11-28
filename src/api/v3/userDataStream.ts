import { Request, Response, Router } from 'express';

const router = Router();

export const userDataStreamPOSTHandler = (req: Request<{}, {}, {}>, res: Response<{ listenKey: string }>) => {
  res
    .header('X-Local', 'true')
    .json({ listenKey: 'userDataStream' });
};

export const userDataStreamPUTHandler = (req: Request<{}, {}, {}>, res: Response<{}>) => {
  res
    .header('X-Local', 'true')
    .json({});
};

export const userDataStreamDELETEHandler = (req: Request<{}, {}, {}>, res: Response<{}>) => {
  res
    .header('X-Local', 'true')
    .json({});
};

router.post('', userDataStreamPOSTHandler);
router.put('', userDataStreamPUTHandler);
router.delete('', userDataStreamDELETEHandler);

export const userDataStream = router;
