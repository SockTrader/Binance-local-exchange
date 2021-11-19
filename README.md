<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/SockTrader/Binance-local-exchange/master/docs/assets/binance.png" alt="Binance logo" /></p>

<h1 align="center">Binance Local Exchange</h1>

## What is "BLE" or "Binance Local Exchange"

You can interact with BLE as if you would be trading with the real Binance API without taking the risk of making an actual trade.
All orders calls will be saved in memory (as long as the server is running) and will be internally matched once the price on Binance hits the expected target.
In case of a MARKET order the order will be settled at the current market price on Binance.

Once the order is settled an ExecutionReport is emitted according to the interface of the Binance API.
Note that BLE is not 100% local, some endpoints are (always) proxied to Binance.
For example `kline` events will always be proxied to Binance so that BLE can correctly match the orders internally.

### Getting started

- Clone repo `git clone https://github.com/SockTrader/Binance-local-exchange`
- Install dependencies `cd Binance-local-exchange && npm install`
- Start server `npm run start`
- Use `localhost:8000` (instead of `https://api.binance.com`) in your project to make API calls

### API endpoints

| Method | Path                   | Implemented   |
| ------ | --------------------   | ------------- |
| GET    | /api/v3/exchangeInfo   | ✅ |
| POST   | /api/v3/order          | ✅ |
| GET    | /api/v3/time           | ✅ |
| POST   | /api/v3/userDataStream | 🚧 |


### Websocket streams

| Stream         | Implemented   |
| -------------- | ------------- |
| kline          | 🚧 |
| userDataStream | 🚧 |

## Roadmap
- Spot account trades
- Margin account trades
- Configuration
- ...
