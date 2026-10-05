# Trading Agents — Factsheet

Prices in modern stock markets are set in a **limit order book**: traders post buy (bid) and sell (ask) orders at prices of their choice, and a trade happens whenever an incoming order meets a resting one. This panel simulates such markets in Julia, from heterogeneous trading agents down to the order flow, and measures what comes out: the spread, volatility, fat tails and price impact.

| | |
|---|---|
| **Purpose** | Simulate continuous double auction markets and the statistics they produce |
| **Julia stack** | `LimitOrderBook.jl` (the matching engine), `TradingAgents.jl` and `Brokerage.jl` (a full exchange with agents), `StatsBase.jl`, `Plots.jl` |
| **Price grid** | Whole ticks of 0.01: the book stores integer prices, so orders at the same price always meet |
| **Order size** | One share per order in the Trading Agents and Limit Order Book models; agent-chosen sizes in Market Microstructure |
| **Output** | Trade prices `tp`, trade signs `sgn` (+1 buyer-initiated), spread, last price `p`, final book depth |

## The Three Models

| Model | Who trades | What it isolates | Reference |
|---|---|---|---|
| Trading Agents | $N$ agents mixing fundamentalist, chartist and noise forecasts | How beliefs drive volatility, fat tails and mispricing | Chiarella and Iori (2002) |
| Limit Order Book | Nobody: Poisson limit orders, market orders and cancellations | What the book mechanics alone do to spread, depth and impact | Smith, Farmer, Gillemot and Krishnamurthy (2003) |
| Market Microstructure | TradingAgents.jl fundamental traders, liquidity takers and a market maker on a Brokerage.jl exchange | An end-to-end exchange with accounts, cash and shares, in wall-clock time | Wheeler and Varner (2023) |

## Minimal Example

```julia
using LimitOrderBook

ob = OrderBook{Int,Int,Int,Int}()               # size, price (ticks), order id, account id
submit_limit_order!(ob, 1, BUY_ORDER, 9_999, 5)  # bid 5 shares at 99.99
submit_limit_order!(ob, 2, SELL_ORDER, 10_001, 3) # ask 3 shares at 100.01
best_bid_ask(ob)                                 # (9999, 10001): a two-tick spread
fills, _ = submit_market_order!(ob, BUY_ORDER, 2) # buy 2 shares at the best ask
```

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md) · [Trading Agents](trading-agents.md) · [Limit Order Book](limit-order-book.md) · [Market Microstructure](market-microstructure.md)
