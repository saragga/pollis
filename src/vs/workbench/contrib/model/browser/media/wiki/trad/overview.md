# Trading Agents — Overview

## The Continuous Double Auction

Almost every stock exchange runs a **continuous double auction**. Buyers and sellers send orders at any time:

- A **limit order** names a side, a size and a worst acceptable price. If it cannot trade at once it **rests** in the book.
- A **market order** names a side and a size, and trades at once against the best resting orders.
- A **cancellation** removes a resting limit order.

The highest resting buy price is the **best bid** $b$, the lowest resting sell price the **best ask** $a$. Their difference $a - b$ is the **spread**, and $(a + b)/2$ the **mid price**. An incoming order that reaches the other side (a buy at or above $a$, a sell at or below $b$) is **marketable**: it trades against resting orders in **price-time priority**, best price first and, at the same price, oldest order first. A large market order **walks the book**, emptying one price level after another, so its average price is worse than the best quote. That is **price impact**.

## Trading Agents: Chiarella and Iori (2002)

Each period one agent $i$, drawn at random, forecasts the return over the next $\tau$ periods by mixing three views:

$$\hat r_i = \frac{g_{1i}\,\frac{1}{\tau}\log\frac{F}{p_t} + g_{2i}\,\bar r_t + n_i\,\epsilon_t}{g_{1i} + g_{2i} + n_i}, \qquad \hat p_i = p_t\, e^{\hat r_i \tau},$$

- **fundamentalist**: the price returns to the fundamental value $F$ at rate $1/\tau$;
- **chartist**: the mean return $\bar r_t$ of the last $L$ trades continues;
- **noise**: $\epsilon_t \sim N(0, \sigma_\epsilon^2)$.

The weights $g_{1i}, g_{2i}, n_i$ are drawn once per agent as $|N(0, s^2)|$ with scales $s_1, s_2, s_n$, so the market is **heterogeneous**. An agent expecting a rise ($\hat p_i > p_t$) bids $\hat p_i (1 - k)$, one expecting a fall asks $\hat p_i (1 + k)$, with a random mark-up $k \sim U(0, k_{\max})$. A marketable order trades at once; the others rest and are cancelled after $\tau$ periods. Prices are not set by anyone: they are whatever the book matches.

## Limit Order Book: Zero Intelligence

Smith, Farmer, Gillemot and Krishnamurthy (2003) strip out the traders entirely. Orders arrive as independent Poisson processes:

| Event | Rate | Price |
|---|---|---|
| Limit buy / limit sell | $\alpha$ per price level, over $K$ levels | Uniform within $K$ ticks of the opposite quote, never crossing |
| Market buy / market sell | $\mu / 2$ each | Best opposite quote |
| Cancellation | $\delta$ per resting order | — |

Even with no beliefs at all, this flow produces a realistic spread, a concave depth profile and positive price impact. It is the null model for every agent-based market: whatever it already explains needs no behavioural story. Gode and Sunder (1993) made the related point that a double auction is allocatively efficient even with "zero-intelligence" traders.

## Market Microstructure: Brokerage.jl

Wheeler and Varner (2023) built a full exchange as a web service. `Brokerage.jl` holds accounts (cash and shares in an SQLite database), an order management system around a limit order book, and an HTTP interface. `TradingAgents.jl` provides agents that log in over HTTP and trade in wall-clock time: fundamental traders, zero-intelligence liquidity takers and several market makers. The panel runs the exchange and the agents in the same Julia session for a short session.

## Stylized Facts

Real markets share a few robust statistical regularities (Cont 2001), and a market model is judged by whether it reproduces them:

1. **Fat tails**: returns have positive excess kurtosis.
2. **No linear predictability**: return autocorrelation is close to zero beyond very short lags (where the bid-ask bounce makes it negative).
3. **Volatility clustering**: absolute returns are positively autocorrelated for a long time.
4. **Persistent order flow and positive impact**: buys follow buys, and a buy moves the price up (Bouchaud, Gefen, Potters and Wyart 2004).

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
