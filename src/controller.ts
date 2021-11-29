import { RequestHandler } from "express";

export type Controller<T extends string> = {
  [key in T]: RequestHandler;
};
