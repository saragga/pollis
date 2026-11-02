# High-Frequency Covariance Assumptions

Every estimator here targets one quantity under a set of conditions on prices, noise and trading times. Knowing those conditions tells you which results to trust on a given data set.

## Efficient prices that move continuously

The target is integrated covariance: the accumulated covariance of the efficient log-prices over the window. The theory takes those prices to be a continuous semimartingale, a process with a drift and a Brownian part whose volatility may change freely through time ([Barndorff-Nielsen and Shephard (2004)](#ref-BS2004c)). Volatility need not follow any parametric model, which is the attraction of the approach. A sudden price jump breaks the continuity, and the estimators then pick up the jump's contribution as well, so a news announcement inside the window can inflate both a variance and a covariance. A window that contains a known announcement should be read with that in mind or split around it.

## Noise that sits on top of the price

The simple story is additive: observed log-price = efficient log-price + noise, with the noise independent across ticks and independent of the efficient price. Under that story the bias of realised variance is about 2nω², and two-scales correction removes it exactly in expectation.

Real noise can break both parts. Consecutive errors can be correlated, because quotes adjust gradually, and they can depend on the price move itself, because a trade carries information. Kernels tolerate some dependence in the noise, since they weigh several lags of autocovariance. A correction built on one lag or on two scales has less room for it.

## Trading times unrelated to prices

Asynchrony is handled on the premise that when an asset trades tells you nothing about where its efficient price is going. In practice trading tends to cluster when prices move, so the premise holds only approximately.

Refresh-time sampling makes its own demand. Each refresh point is the first moment at which every asset has traded since the last one, so the number of points cannot exceed the tick count of the least active asset ([Barndorff-Nielsen, Hansen, Lunde and Shephard (2011)](#ref-BHLS2011a)). One thinly traded asset therefore throws away most of the ticks of the liquid ones. **Trading Activity** shows the risk before you fit.

## Clean, correctly formed ticks

The panel takes one row per tick: time in seconds, asset as a Symbol and the log-price. Passing prices rather than log-prices silently changes the meaning of every number, because the returns are no longer log-returns and the scale depends on the price level.

Errors in the feed also matter more here than with daily data. A single bad print produces two huge returns of opposite sign and can dominate the sum of squares for the day. Crossed quotes, zero prices, and ticks outside the trading session should be removed before estimation, as none of the estimators is built to detect them.

## Scaling from one unit to a day

`covariance(est, Day(1))` scales the estimate by the number of time units in a day, which treats covariance as constant across that day. Intraday volatility usually has a pattern, high at the open and close, so any window that covers only part of a session misstates the daily figure.

Overnight moves are absent too. Ticks describe trading hours only, whereas a close-to-close daily return also holds the overnight gap. The length of the day matters as well: a 6.5-hour session holds 23,400 seconds against 86,400 in a calendar day, a factor of about 3.7 in variance. Compare the scaled figure with daily returns before quoting it as daily risk.

## Normal draws in the scenarios

**Return Scenarios** draws 10,000 daily return vectors from a zero-mean normal with the estimated daily covariance. Nothing in the covariance estimate supports that shape: it fixes second moments and says nothing about tails. Actual daily returns usually have fatter tails, so `q01` and `worst` tend to understate losses in stressed markets.

A zero mean is a sensible simplification over a day, because daily expected returns are small next to daily volatility. The covariance itself is also a backward-looking measure of the window it came from, and using it for tomorrow assumes that covariance persists.

## References

<a id="ref-BHLS2011a"></a>Barndorff-Nielsen, O. E., Hansen, P. R., Lunde, A., & Shephard, N. (2011). Multivariate Realised Kernels: Consistent Positive Semi-Definite Estimators of the Covariation of Equity Prices with Noise and Non-Synchronous Trading. *Journal of Econometrics* 162(2), 149-169. [doi:10.1016/j.jeconom.2010.07.009](https://doi.org/10.1016/j.jeconom.2010.07.009)

<a id="ref-BS2004c"></a>Barndorff-Nielsen, O. E., & Shephard, N. (2004). Econometric Analysis of Realized Covariation: High Frequency Based Covariance, Regression, and Correlation in Financial Economics. *Econometrica* 72(3), 885-925. [doi:10.1111/j.1468-0262.2004.00515.x](https://doi.org/10.1111/j.1468-0262.2004.00515.x)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
