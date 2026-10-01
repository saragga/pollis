# Trading Agents — Assumptions

## Trading Agents (Chiarella-Iori)

- **One agent per period, one share per order.** Time is counted in orders, not seconds, and every order is for a single share, so a marketable order trades exactly one share at the best quote.
- **Fixed, known fundamental value.** $F$ does not move. Fundamentalists all know it; they differ only in how much weight they put on it.
- **Fixed strategies.** Each agent's weights are drawn once and never change: there is no learning and no switching between strategies.
- **Orders expire after $\tau$ periods**, the agent's forecast horizon.
- **No budgets or inventories.** Agents can always buy or sell one share.
- **Illustrative parameters.** $L = 20$, $\tau = 20$, $k_{\max} = 0.01$ and $\sigma_\epsilon = 0.005$ are chosen to give a lively market, not estimated from data.

## Limit Order Book (Zero Intelligence)

- **Independent Poisson order flow.** Arrivals do not depend on the past, so order flow has no memory and its sign is not persistent (unlike real markets).
- **Limit orders never cross.** Buys are placed below the ask and sells above the bid; all trading comes from market orders.
- **Uniform prices within $K$ ticks** of the opposite quote, and **cancellation in proportion to the number of resting orders**.

## Market Microstructure (Brokerage)

- **Wall-clock time.** The exchange opens 30 seconds after the code starts and runs for the Session Length. Thread scheduling and network timing make every run different, and a run cannot be repeated with the same seed.
- **One exchange per Julia session.** The server, port 8080 and the trade tape are global; a second session needs a fresh Julia process.
- **The tape records market orders only.** Brokerage logs a trade when a market order executes, not when a limit order crosses the spread, so the fundamental traders' marketable limit orders are missing from the statistics.
- **Accounts are numbered by position.** Ids 1–30 are reserved for market makers; the fundamental traders' accounts must exist before the liquidity takers start, or the two groups trade from the same accounts.

## Computational

- **Integer tick prices.** The book stores prices as whole ticks; a price is multiplied by the tick (0.01) only for display. With floating-point prices, a price computed two ways can differ in the last bit, and a cancellation would miss its price level.
- **Package workarounds.** `LimitOrderBook.jl` 0.1.0 has two bugs (see [Limit Order Book](limit-order-book.md)): marketable *sell* limit orders are dropped instead of matched, and cancelling an order that is no longer in the book corrupts the order count. The panel therefore sends every marketable order as a one-share market order (identical for one-share orders) and removes filled orders from its list of live orders, so it never cancels a missing order.
- **Single runs are random draws.** One simulation is one draw; the Predict and Compare actions average over 20 seeds and report standard errors.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
