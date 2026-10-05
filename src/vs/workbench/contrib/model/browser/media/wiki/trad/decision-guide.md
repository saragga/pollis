# Trading Agents — Decision Guide

## Which Model?

| You want to | Model | Why |
|---|---|---|
| See how beliefs (fundamentalist, chartist, noise) shape prices | **Trading Agents** | The strategy mix is the only input that changes |
| Know what the order book does with no strategies at all | **Limit Order Book** | Zero-intelligence flow: the null model for any agent story |
| Run a realistic exchange with accounts, cash, shares and order sizes | **Market Microstructure** | Brokerage.jl server with TradingAgents.jl agents |
| Repeat a run exactly, or average over many runs | Trading Agents or Limit Order Book | Seeded; the Brokerage session runs in wall-clock time |
| Count time in seconds rather than in orders | **Market Microstructure** | The only model with real time |

## Which Action?

| Question | Action |
|---|---|
| What did the price do? | Price Trajectory |
| How much liquidity is left in the book? | Order Book Depth |
| Does the model look like a real market? | Stylized Facts |
| How far does a trade move the price? | Price Impact |
| What if chartists were stronger, or market orders more frequent? | Stress Test |
| What if there were no chartists, or no cancellations? | Counterfactual |
| Fundamentalist-led against chartist-led markets | Fundamentalists vs Chartists |
| How much does trading through a book cost relative to a clearing price? | LOB vs Walrasian |
| Are prices a random walk? | Market Efficiency |
| One-screen summary | Microstructure Summary |

## Which Package?

| Need | Package |
|---|---|
| A fast in-memory matching engine to build your own market on | **LimitOrderBook.jl** |
| Ready-made trading agents that talk to an exchange | **TradingAgents.jl** |
| An exchange with user accounts, an order management system and an HTTP API | **Brokerage.jl** |

## Related Panels

- **Agent-Based Models**: agent-based models outside finance, with Agents.jl.
- **Point Processes** and **Point Process Simulation**: Hawkes processes, the standard model for clustered order arrivals.
- **Diffusion Processes**: continuous-time price models that ignore the order book.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
