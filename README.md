<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/SockTrader/Binance-local-exchange/master/docs/assets/binance.png" alt="Binance logo" /></p>

<h1 align="center">Binance Local Exchange</h1>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg" alt="License: GPL v3"></a>
  <a href="https://codeclimate.com/github/SockTrader/Binance-local-exchange/maintainability"><img src="https://api.codeclimate.com/v1/badges/ef5537a6aa6b8cb10cba/maintainability" /></a>
  <a href="https://gitter.im/SockTrader/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge"><img src="https://badges.gitter.im/SockTrader/community.svg" alt="Gitter"></a>
</p>


## What is "BLE" or "Binance Local Exchange"

You can interact with BLE as if you would be trading with the real Binance API without taking the risk of making an actual trade.
All orders calls will be saved in memory (as long as the server is running) and will be internally matched once the price on Binance hits the expected target.
In case of a MARKET order the order will be settled at the current market price on Binance.

Once the order is settled an ExecutionReport is emitted according to the interface of the Binance API.
Note that BLE is not 100% local, some endpoints are (always) proxied to Binance.
For example `kline` events will always be proxied to Binance so that BLE can correctly match the orders internally.


### Quick start

- `npx @socktrader/binance-local-exchange`


### Help, it's not working?

- I can't create an order: make sure to call GET /api/v3/exchangeInfo. (why?)
- I am not receiving any executionReports:
  - make sure to call POST /api/v3/userDataStream. (why?)
  - make sure to listen for Kline/Candlestick Streams. (why?)

Still not working? Please open a [bug report](https://github.com/SockTrader/Binance-local-exchange/issues/new)

### API endpoints

| Method | Path                   | Implemented |
|--------|------------------------|-------------|
| GET    | /api/v3/exchangeInfo   | ✅           |
| POST   | /api/v3/order          | ✅           |
| GET    | /api/v3/time           | ✅           |
| POST   | /api/v3/userDataStream | ✅           |


### Websocket streams

| Stream         | Implemented |
|----------------|-------------|
| kline          | ✅           |
| userDataStream | ✅           |


### Internal server endpoints

Can be used to debug or get more information about the internal state of the server

| Method | Path           | Implemented | Body / Query                      | Info                                                 |
|--------|----------------|-------------|-----------------------------------|------------------------------------------------------|
| GET    | /server/debug  | ✅           |                                   | Returns the state of the internal stores             |
| GET    | /server/config | ✅           |                                   | Returns the configuration that is used by the server |
| POST   | /server/match  | ✅           | { symbol: string, price: number } | Tries to match open orders.                          |


## Roadmap
- Add extra security measurements
- Spot account trades
- Margin account trades
- Configuration
- ...


## How to contribute?

- Clone repo `git clone https://github.com/SockTrader/Binance-local-exchange`
- Install dependencies `cd Binance-local-exchange && npm install`
- Start server `npm run start` or in watch mode `npm run watch`
- Make code changes, test with Postman, create unit tests
- Open pull request


## Contributors
<a href="https://github.com/SockTrader/Binance-local-exchange/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SockTrader/Binance-local-exchange" />
</a>


## DISCLAIMER
Use at your own risk. Neither SockTrader nor any project contributor can be held responsible for any potential losses.
