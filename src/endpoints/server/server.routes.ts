import express from 'express';
import container from '../../container';
import { ConfigController } from './config.controller';
import { DebugController } from './debug.controller';
import { MatchController } from './match.controller';

const router = express.Router();

const configController = container.resolve(ConfigController);
const debugController = container.resolve(DebugController);
const matchController = container.resolve(MatchController);

router.get('/debug', debugController.getDebugInfo.bind(debugController));
router.post('/debug/reset', debugController.postReset.bind(debugController));
router.get('/config', configController.getConfig.bind(configController));
router.post('/match', matchController.postMatch.bind(matchController));

export default router;
