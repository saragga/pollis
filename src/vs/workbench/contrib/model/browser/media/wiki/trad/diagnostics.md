# Trading Agents — Diagnostics

All diagnostics use **trade-to-trade log returns** $r_j = \log p_{j+1} - \log p_j$, where $p_j$ is the price of the $j$-th trade. Counting in trades rather than periods avoids the many zero returns of periods with no trade.

## Stylized Facts

| Statistic | Real markets | What a departure means |
|---|---|---|
| Excess kurtosis of $r$ | Positive, often 5 or more at short horizons | Near 0: returns too Gaussian; the model lacks bursts |
| Autocorrelation of $r$ at lag 1 | Slightly negative (bid-ask bounce), then near 0 | Large positive: trends that traders could exploit |
| Autocorrelation of $\lvert r \rvert$ | Positive and slowly decaying | Near 0: no volatility clustering |

The bid-ask bounce: with no news, consecutive trades alternate between the bid and the ask, so returns alternate in sign. It is a mechanical effect of the spread, not mean reversion in value.

## Price Impact: the Response Function

With trade signs $s_j = \pm 1$ (buyer- or seller-initiated), the response function (Bouchaud et al. 2004)

$$R(\ell) = \mathbb{E}\left[s_j \left(\log p_{j+\ell} - \log p_j\right)\right]$$

is the average price move $\ell$ trades after a trade, in its own direction. $R(\ell) > 0$ means trades move the price. If $R$ rises then flattens, impact is permanent; if it peaks and falls, part of the impact is temporary (the book refills). The Market Microstructure model uses the trade size as well: the Stress Test compares the move after the largest 5% of market orders with the rest.

## Variance Ratios

Lo and MacKinlay (1988): if prices are a random walk, the variance of $k$-trade returns is $k$ times the variance of one-trade returns:

$$\mathrm{VR}(k) = \frac{\operatorname{Var}\left(\log p_{j+k} - \log p_j\right)}{k \operatorname{Var}(r_j)} = 1.$$

Below 1 indicates mean reversion, above 1 trending.

## Averaging Over Seeds

Every model is random. The Stress Test, Counterfactual and Compare actions run 20 seeds per scenario and report mean ± standard error and the **paired** difference: both scenarios use the same seeds, so the same agents and draws, and the difference has a much smaller standard error than either mean. A difference less than about twice its standard error is not distinguishable from noise.

## Warning Signs

| Symptom | Likely cause |
|---|---|
| Very few trades | Agents' prices rarely cross: lower the mark-up or raise $T$; LOB: market-order rate $\mu$ too low |
| `NaN` spread for many periods | One side of the book is empty; seed more initial orders ($N$) |
| Price drifts far from $F$ and stays there | Chartists dominate ($s_2 \gg s_1$); the Compare action quantifies this |
| Kurtosis estimate jumps between runs | Too few returns: kurtosis needs thousands of observations |
| Market model: tape almost empty | Session too short, or the agents started before the market opened |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
