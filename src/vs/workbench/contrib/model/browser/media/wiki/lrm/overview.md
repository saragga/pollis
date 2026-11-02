# Loss Risk Measures

Variance treats a large gain and a large loss as equally risky, yet investors worry only about the loss. Loss risk measures look at that side alone: how far a portfolio falls, how often it misses a target and how bad its worst periods are.

## Why variance is not enough

Variance became the standard measure of portfolio risk with [Markowitz (1952)](#ref-Mar1952a), and it has great mathematical convenience. For a symmetric normal return, it also fully describes the losses.

Real return series are not so obliging. Two series can share a variance while one has frequent small gains and rare crashes and the other the reverse, and an investor would never treat them alike. A strategy that sells insurance can look smooth for years, with low variance, and then lose years of profit at once. Loss measures make that left tail visible.

## Four families in four tabs

| Tab | Question | Headline numbers |
|---|---|---|
| **Drawdown** | How far did wealth fall from its high? | Maximum and average drawdown, Calmar, Sterling |
| **Downside Risk** | How far do returns fall below a target? | Semi-deviation, downside deviation, Sortino, Omega |
| **Value at Risk** | What loss is exceeded only rarely? | Historical, normal and Cornish-Fisher VaR |
| **Expected Shortfall** | When that loss is exceeded, how bad is it on average? | Historical, normal and Cornish-Fisher ES |

The first works on the path of returns over time, and it depends on their order. The other three use the distribution alone, so shuffling the returns would not change them.

## The numbers on a simple path

Wealth going 1, 1.2, 0.9, 1.1 has a drawdown of 0.9 / 1.2 − 1 = −25% at its low point, and −8.3% one step later. Recovering from a fall needs a larger gain than the fall itself: −25% needs +33%, and −50% needs +100%.

For the default `0.0004 .+ 0.01 .* randn(1000)`, the true 5% quantile gives a VaR of 1.645 × 0.01 − 0.0004 ≈ 1.6%, and the true ES is 2.063 × 0.01 − 0.0004 ≈ 2.0%. So in the worst one day in twenty, the loss is at least 1.6%, and it averages about 2.0%. Estimates from a given sample will sit around those values.

## Actions around the measures

**Wealth Index** and **Tail Histogram** draw the path and the tail. **Return Distribution**, **Drawdown Chart** and **VaR Backtest** check the data and test a VaR. **Rolling VaR Forecast** and **Multi-Period VaR** look forward, **VaR Methods** and **VaR vs Expected Shortfall** set estimates side by side, and **Risk-Adjusted Performance** and **CVaR Decomposition** relate the risk to return and to the assets in a portfolio.

## References

<a id="ref-Mar1952a"></a>Markowitz, H. M. (1952). Portfolio Selection. *Journal of Finance* 7(1), 77-91. [doi:10.2307/2975974](https://doi.org/10.2307/2975974)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
