import chalk from "chalk";
import express from "express";
import http from "http";
import * as httpProxy from "http-proxy";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

// Create Express Server
const app = express();

morgan.token("headers", (req, res) => JSON.stringify(req.headers))


app.use(morgan(":method\n\t:url\n\t:headers"));


// Configuration
const PORT = 3000;
const HOST = "localhost";
const API_SERVICE_URL = "https://api.binance.com";


// Proxy endpoints
app.use("*", createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq: http.ClientRequest, req: http.IncomingMessage, res: http.ServerResponse, options: httpProxy.ServerOptions) => {
    if (req.headers['x-mbx-apikey']) {
      console.error(chalk.red("Sending an API key is not allowed because of security reasons. Script will exit now."));
      process.exit(1);
    }

    if (req.url?.includes('/order')) {
      console.log(req.url);
      res
        .writeHead(200, { 'Content-Type': 'application/json;charset=UTF-8' })
        .end(JSON.stringify({route: 'caught!'}));
    }
  }
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
