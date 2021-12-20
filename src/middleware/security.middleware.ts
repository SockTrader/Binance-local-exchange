import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';
import { ApplicationConfig } from '../services/configuration.service';

export const verifyRequest = (config: ApplicationConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (config.IKNOWWHATIAMDOING) return next();

    if (!!req.headers['x-mbx-apikey']) {
      const warning = `YOU'RE CURRENTLY EXPOSING YOUR API KEY IN THE REQUEST HEADERS.
THIS COULD LEAD TO SEVERE SECURITY ISSUES AND POTENTIALLY STOLEN FUNDS,
IF YOUR SECRET API KEY HAS BEEN COMPROMISED!`;

      console.warn(chalk.bgYellow(chalk.black(warning)));
      process.exit(1);
    }

    if ((!req.query?.signature || !req.body?.signature)) {
      const error = `A SIGNED SIGNATURE HAS BEEN FOUND IN THE REQUEST.
THIS IS A MAJOR SECURITY RISK AND COULD POTENTIALLY LEAD TO STOLEN FUNDS.
WE HIGHLY RECOMMEND TO STOP SENDING THE SIGNED SIGNATURE OR USE A FAKE API KEY AND SECRET COMBINATION.`;

      console.error(chalk.bgRed(chalk.white(error)));
      process.exit(1);

    }
  };
}
