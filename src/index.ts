#!/usr/bin/env node

import { akitaConfig } from '@datorama/akita';
import chalk from 'chalk';
import { Option, program } from 'commander';
import 'reflect-metadata';
import { version } from '../package.json';
import { createApplication } from './application';
import { ConfigurationService } from './services/configuration.service';
import container from './container';
import WebsocketServer from './endpoints/websocket/server';

akitaConfig({ resettable: true });

program
  .version(version)
  .addOption(new Option('--I-KNOW-WHAT-I-AM-DOING <number>', 'removes security warnings')
    .default(false)
    .env('I_KNOW_WHAT_I_AM_DOING')
  )
  .addOption(new Option('-p, --port <number>', 'port number')
    .default(8000)
    .env('PORT')
  )
  .addOption(new Option('-lt, --local-time', 'local time')
    .default(true)
    .env('LOCAL_TIME')
  )
  .addOption(new Option('-lei, --local-exchange-info', 'local exchange info')
    .default(true)
    .env('LOCAL_EXCHANGE_INFO')
  )
  .addOption(new Option('-fm, --fee-maker <number>', 'maker fee')
    .argParser(parseFloat)
    .default(0.001)
    .env('FEES_MAKER')
  )
  .addOption(new Option('-ft, --fee-taker <number>', 'taker fee')
    .argParser(parseFloat)
    .default(0.001)
    .env('FEES_TAKER')
  )
  .parse(process.argv);

const configService = container.resolve(ConfigurationService);
configService.setApplicationConfig(program.opts());

const server = container.resolve(WebsocketServer);
server.upgrade(createApplication(configService.getAll()));

//start our server
server.serverInstance?.listen(configService.get('port'), () => {
  const address = server.serverInstance?.address();
  const port = typeof address === 'string' ? address : address?.port;

  console.log(`Binance local exchange is listening on port: ${port}\n`);

  if (!configService.get('IKNOWWHATIAMDOING')) {
    const msg = `Don't send any API keys or signed signatures.
Binance local exchange doesn't need any of these to operate.`;

    console.warn(chalk.bgYellow(chalk.white(msg)));
  }
});
