# Loss Risk Measure Assumptions

Risk figures look like facts about the future, though each rests on assumptions about the data and about how the past carries forward. The sections here set out which measure needs what.

## Simple returns, one per period

The code compounds with `cumprod(1 .+ r)`, which is right only for simple returns. Log-returns would need an exponential of a cumulative sum, and treating them as simple returns understates both gains and drawdowns slightly. Small daily returns barely differ, but large monthly returns can.

**Multi-Period VaR** goes the other way: it sums returns over the horizon, which is exact for log-returns and close for small simple ones. The panel also assumes a regular period with `ppy = 252`. Every annualised figure is wrong for other frequencies until that line is changed, and gaps or stale prices in the series shrink measured risk with no warning.

## A past that represents the future

Historical VaR and ES read the future's tail directly from past returns, so what never happened in the sample cannot appear. A sample from a calm period gives a low VaR just as danger may be building, and a crisis stays in a rolling window for exactly its length and then drops out at once.

Every estimate here is unconditional or windowed. Returns are far from independent over time, because volatility clusters. A conditional approach, fitting a volatility model first and reading the tail from its residuals, reacts faster, as [McNeil and Frey (2000)](#ref-MF2000a) show. If the current market differs from the sample average, a long-sample figure says little about tomorrow.

## Tails, shapes and sample size

`var_norm` and `es_norm` assume normal returns, which usually understates extreme losses in financial data. Cornish-Fisher adjusts for skewness and kurtosis using the expansion from [Cornish and Fisher (1938)](#ref-CF1938a). The expansion works for moderate departures from normality only. With strong skewness or kurtosis the quantile function can stop being monotonic, and the result then has no meaning.

Historical estimates assume enough data to see the tail. At alpha 0.01, 1,000 observations give only 10 tail points, and a 250-period window gives about 2 or 3. ES at that level averages those few values, so a single point moves it strongly. Skewness and kurtosis are themselves dominated by a few extreme returns, so they are noisy inputs too.

## Independence for scaling

The square-root-of-time rule in **Multi-Period VaR** needs returns that are independent and identically distributed. Variances then add, so σ scales by √h, and h = 10 gives a factor of about 3.16 on the volatility term.

Positive autocorrelation makes the true multi-period risk larger than the rule suggests, and negative autocorrelation makes it smaller. Volatility clustering also breaks the rule, particularly when the current volatility differs from its average. The action prints a lag-1 autocorrelation for that reason, and a historical figure from overlapping returns as a check. Overlapping windows are themselves dependent, so that check has far fewer independent observations than it appears to have.

## Liquidity and positions held still

Each measure pretends that the position stays fixed through the period, and that it can be marked at the observed price. In a real crisis, selling moves prices, so losses go beyond what returns record, and stressed correlations rise while diversification melts away.

Drawdown also rests on the observed series. A smoothly marked illiquid asset shows small drawdowns, simply because its price is not being tested. Backfilled or survivorship-biased return histories have the same flattering effect. Check where the returns come from before believing any of these measures.

## References

<a id="ref-CF1938a"></a>Cornish, E. A., & Fisher, R. A. (1938). Moments and Cumulants in the Specification of Distributions. *Review of the International Statistical Institute* 5(4), 307-320. [doi:10.2307/1400905](https://doi.org/10.2307/1400905)

<a id="ref-MF2000a"></a>McNeil, A. J., & Frey, R. (2000). Estimation of Tail-Related Risk Measures for Heteroscedastic Financial Time Series: An Extreme Value Approach. *Journal of Empirical Finance* 7(3-4), 271-300. [doi:10.1016/S0927-5398(00)00012-8](https://doi.org/10.1016/S0927-5398(00)00012-8)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
