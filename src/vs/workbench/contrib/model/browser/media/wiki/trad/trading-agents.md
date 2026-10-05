# Trading Agents

`TradingAgents.jl` (Aaron Wheeler, Varnerlab, Cornell; MIT licence, unregistered) provides trading agents for the `Brokerage.jl` exchange. Each agent type is a single function that logs in to the exchange over HTTP, creates its accounts, waits for the market to open and trades until it closes. The call **blocks until the close**, so in one Julia session the agents run as tasks (`@async`) or on separate workers.

## Agent Types

| Function | Agent | Behaviour |
|---|---|---|
| `FT_run` | Fundamental traders | Each forms a private value $V = m\,(1 + u)$ around the mid price $m$, with $u \sim N(0, \sigma^2)$ and $\sigma$ the recent volatility (at least 0.10). Sells its whole holding with a limit order above the mid if $m > V$; buys as many shares as its cash allows with a limit order below the mid if $V > m$. The larger the mispricing, the closer to the mid it quotes |
| `ZT_run` | Zero-intelligence liquidity takers | Pick a random fraction of wealth to hold in shares, rebalance to it with **market orders** |
| `RandomMM_run` | Random market maker | Quotes a bid and an ask at random distances from the mid, cancels unfilled quotes, hedges a random fraction of its inventory with market orders |
| `PLT_run`, `PLP_run` | Parallel liquidity takers and providers | Successors of `ZT_run` and `FT_run` that run on `Distributed` workers (call `addprocs` first) |
| `PMM_run` | Several random market makers | Many random market makers as asynchronous tasks |
| `AdaptiveMM_run` | Adaptive market maker | Learns its quoting and hedging policy while trading |

Agents are activated in random order with Pareto-distributed probabilities, so a few are very active and most trade rarely, and each waits `trade_freq` seconds with probability `prob_wait` between orders.

## Calling Convention

Parameters are positional named tuples:

```julia
FT_run(num_traders, num_assets,
       (init_cash_range = 5000.0:0.01:15000.0, init_shares_range = 50:1:150,
        prob_wait = 0.5, trade_freq = 1, num_ids = 30),             # first account id - 1
       (host_ip_address = "0.0.0.0", port = "8080",
        username = "Fundamental Trader", password = "value123"))

ZT_run(num_traders, num_assets,
       (username = "Zero Trader", password = "zero123",
        init_cash_range = 5000.0:0.01:15000.0, init_shares_range = 50:1:150,
        prob_wait = 0.5, trade_freq = 1, num_MM = 30 + num_ft),     # skip the FT accounts
       (host_ip_address = "0.0.0.0", port = "8080"))

RandomMM_run(ticker,
       (id = 1, eps_min = -0.5, eps_max = 0.5, inventory_limit = 3000,
        unit_trade_size = 15, trade_freq = 2),
       (cash = 0, z = 0),                                            # initial cash and inventory
       (host_ip_address = "0.0.0.0", port = "8080", username = "Market Maker", password = "liquidity000"))
```

Account ids are positional: ids 1–30 are reserved for market makers, the first agent group takes the next ids, and `num_ids` / `num_MM` tells each group where its accounts start. Start the second group only after the first group's accounts exist (the panel polls `Mapper.PORTFOLIO_COUNTER[]`).

## Notes

- `FT_run` and `ZT_run` are marked deprecated in favour of `PLP_run` and `PLT_run`, but they still work and need no worker processes.
- The fundamental traders' value is centred on the current mid price, not on a fixed fundamental: they supply liquidity around wherever the price is, rather than pulling it to a fixed value as in Chiarella-Iori.
- Package version 1.0.0-DEV. The JuliaCon 2023 talk *Introducing a Financial Simulation Ecosystem in Julia* walks through both packages.

## See Also
- [Market Microstructure](market-microstructure.md) · [Limit Order Book](limit-order-book.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
