import chalk from "chalk";
import express from "express";
import { exchangeInfo } from "./api/v3/exchangeInfo";
import { order } from "./api/v3/order";
import { time } from "./api/v3/time";
import { userDataStream } from "./api/v3/userDataStream";
import WebsocketServer from "./websocket/server";

const app = express();

app.all("*", ((req, res, next) => {
  console.log(chalk.blue(`[REQ] ${req.method} ${req.path}`))
  return next();
}));

app.use("/api/v3/exchangeInfo", exchangeInfo);
app.use("/api/v3/userDataStream", userDataStream);
app.use("/api/v3/time", time);
app.use("/api/v3/order", order);

app.get("*", (req, res) => {
  const msg = `Route ${req.url} could not be found`;
  console.error(msg);

  res.status(404).send(msg);
});

app.disable("x-powered-by");

const server = new WebsocketServer(app);

//start our server
server.serverInstance.listen(process.env.PORT || 8000, () => {
  //@ts-ignore
  console.log(`Server started on port ${server.serverInstance.address()!.port}`);
});
