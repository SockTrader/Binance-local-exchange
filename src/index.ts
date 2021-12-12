#!/usr/bin/env node

import 'reflect-metadata';
import config from 'config';
import container from './container';
import { akitaConfig } from '@datorama/akita';
import { createApplication } from './application';
import WebsocketServer from './endpoints/websocket/server';

akitaConfig({ resettable: true });

const app = createApplication();
const server = container.resolve(WebsocketServer);
server.upgrade(app);

//start our server
server.serverInstance?.listen(config.get('port'), () => {
  //@ts-ignore
  console.log(`Server started on port ${server.serverInstance.address()!.port}`);
});
