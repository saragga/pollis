# Market Microstructure

`Brokerage.jl` (Aaron Wheeler, Varnerlab, Cornell; MIT licence, unregistered) is a simulated exchange and brokerage. It keeps user accounts and portfolios in an SQLite database, routes orders through an order management system to a limit order book (`VLLimitOrderBook.jl`, a modified copy of `LimitOrderBook.jl` with account tracking and cross-matching fixes), and serves everything over HTTP. Agents from `TradingAgents.jl`, or your own code, trade through its client functions.

## Architecture

| Module | Role |
|---|---|
| `Model` | Data types: users, portfolios, orders |
| `Mapper` | SQLite storage of users and portfolios; `PORTFOLIO_COUNTER`, `MM_COUNTER` |
| `OMS` | Order management: the order book `OMS.ob`, market schedule, trade tape, price buffer |
| `Service`, `Resource` | Business rules and HTTP routes |
| `Client` | Functions an agent calls over HTTP |

## Running a Session

```julia
using Brokerage, Dates
DBFILE = joinpath(mktempdir(), "portfolios.sqlite")      # the package folder is read-only
AUTHFILE = "file://" * joinpath(dirname(pathof(Brokerage)), "../resources/authkeys.json")
Mapper.MM_COUNTER[] = 30                                  # ids 1-30 reserved for market makers
OMS.NUM_ASSETS[] = 1
OMS.MARKET_OPEN_T[] = now() + Second(30)
OMS.MARKET_CLOSE_T[] = OMS.MARKET_OPEN_T[] + Minute(2)
OMS.init_LOB!(OMS.ob, [100.0], OMS.LP_order_vol, OMS.LP_cancel_vol, OMS.trade_volume_t, OMS.price_buffer)
server = @async Brokerage.run(DBFILE, AUTHFILE)           # HTTP server on 0.0.0.0:8080
```

`init_LOB!` seeds the book with liquidity around the opening price, so the first agents find quotes to trade against.

## Client API

| Call | Does |
|---|---|
| `Client.createUser`, `Client.loginUser` | Register and log in |
| `Client.placeLimitOrder(ticker, side, price, size, acct)` | Limit order (`side` is `"BUY_ORDER"` or `"SELL_ORDER"`) |
| `Client.placeMarketOrder(ticker, side, size, acct)` | Market order |
| `Client.placeCancelOrder(ticker, id, side, price, acct)` | Cancel |
| `Client.provideLiquidity`, `Client.hedgeTrade`, `Client.cancelQuote` | Market-maker versions of the above |
| `Client.getBidAsk(ticker)`, `Client.getMidPrice(ticker)` | Quotes |
| `Client.getBookDepth(ticker)` | Price levels with volumes and order counts |
| `Client.getPriceSeries(ticker)` | Recent prices (the buffer the fundamental traders use) |
| `Client.getTradeVolume(ticker)` | Net signed volume of market orders |
| `Client.getHoldings(acct)`, `Client.getCash(acct)` | Portfolio |
| `Client.getMarketSchedule()` | Open and close times |

## The Trade Tape

During the session the OMS appends one row per market order to `OMS.tick_time`, `OMS.tick_last_prices`, `OMS.tick_trading_volume` (signed shares), `OMS.tick_bid_prices` and `OMS.tick_ask_prices`. The panel reads these after the close.

**Limitation**: only market orders are logged. When a limit order crosses the spread and trades, nothing is written to the tape, so in the panel's session the fundamental traders' trades are missing and the statistics describe the liquidity takers' and the market maker's market orders.

## Notes

- The server, port 8080 and the tape are global to the Julia session: restart Julia before a second session.
- Everything runs in wall-clock time, so results vary between runs and cannot be seeded.
- Wheeler and Varner (2023) run the same stack with thousands of agents on many workers.

## See Also
- [Trading Agents](trading-agents.md) · [Limit Order Book](limit-order-book.md) · [Assumptions](assumptions.md) · [Overview](overview.md)
