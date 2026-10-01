# Trading Agents — Interpretation

## Prices and Mispricing

- **Last trade price $p$** is constant between trades. In the Trading Agents model compare it with the dashed line at $F$: the mean of $|p - F| / F$ is the average **mispricing**.
- Fundamentalists pull $p$ towards $F$; chartists push it along its recent trend, creating bubbles and crashes; noise traders supply randomness and liquidity.

## Spread and Depth

- The **spread** is the cost of trading immediately: a buy-then-sell round trip loses about one spread. Read it in ticks and in basis points of the price.
- **Depth** is the number of shares resting near the best quotes. A deep book absorbs market orders with little impact; a thin book lets one order move the price several ticks.
- In the zero-intelligence model, more market orders ($\mu$ up) eat the book: the spread widens and depth falls. More cancellations ($\delta$ up) have the same effect from the other side.

## Statistics

| Output | Reading |
|---|---|
| Excess kurtosis $> 0$ | Fat tails: large moves are more frequent than under a normal distribution |
| Lag-1 return autocorrelation $< 0$ | Bid-ask bounce |
| Autocorrelation of $\lvert r \rvert > 0$ | Volatility clustering: calm and turbulent spells |
| $R(\ell) > 0$ | Trades move the price in their own direction |
| $\mathrm{VR}(k) < 1$ / $> 1$ | Mean reversion (bounce, fundamentalists) / trending (chartists) |
| Sign autocorrelation $> 0$ | Persistent order flow: buys follow buys |
| Buyer-initiated share far from 50% | One-sided pressure, usually a trending price |

## Reading the Compare Output

Each line reads like this (the numbers are made up for illustration)

```
vol  base 0.00123 +- 1.2e-05   chartists x3 0.00187 +- 2.0e-05   difference 0.00064 +- 1.5e-05
```

that is, the mean and standard error of the statistic in each scenario over 20 seeds, then the mean paired difference and its standard error. Report a difference only when it is several standard errors from zero.

## LOB vs Walrasian

The Walrasian benchmark lets all $N$ agents forecast every period and sets the price that clears their demands, $p_t = \frac{1}{N}\sum_i \hat p_i$. There is no spread, no queue and no waiting. The gap between the two columns is the effect of **market microstructure** itself: trading one order at a time through a book, at the prices others have posted.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
