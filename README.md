WIP

# Binance proxy server
Start paper trading on realtime exchange data without taking the risk of making actual trades.
Interact with the proxy server as if you would interact with the real binance exchange. All order calls will be caught
and an appropriate Order / Trade / ExecutionReport is emitted once an Order can be filled. 

Make sure to subscribe to the [user data stream](https://binance-docs.github.io/apidocs/spot/en/#user-data-streams) to receive the mocked events.

Note: for security reasons all API calls that contain the X-MBX-APIKEY header will be blocked, the script will exit with code 1. Use at your own risk. 

## ROADMAP
Spot account trades
Margin account trades
Configuration
..
