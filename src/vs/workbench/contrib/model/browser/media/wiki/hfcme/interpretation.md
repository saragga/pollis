# Reading High-Frequency Covariance Results

An estimate describes how assets moved together inside one window of ticks. The readings below turn its raw numbers into statements about correlation, volatility and portfolio risk.

## Units of the raw matrix

`Sigma` is covariance over one time unit. With times in seconds, a diagonal entry is the variance per second, and the values look minute. `sigma` holds the matching volatility per square root of one second.

Nothing is wrong with small numbers here. Scaling is linear in variance and goes with the square root in volatility, so a per-second volatility of 0.0001 becomes 0.0001 × √23,400 ≈ 0.0153, or 1.53%, across a 6.5-hour session. Quote a volatility only with its time unit attached. `rho` is the exception, because correlation has no time unit and needs no scaling at all.

## Reading the correlation matrix

Entries of `rho` measure co-movement of the efficient prices across the window, with ones on the diagonal. **Correlation Heatmap** shows blocks of assets that move together, and **Strongest Pairs** ranks pairs by absolute correlation so negative links rank alongside positive ones.

A correlation on **Realized** that sits well below the same pair on a noise-robust tab is likely to be asynchrony rather than a real weak link, since the Epps effect pulls such values towards zero. A value above 1 in magnitude is impossible for a genuine correlation and flags an invalid matrix, which **Matrix Validity** will confirm.

## Annual and daily volatility

**Annualised Volatilities** computes `sqrt.(diag(covariance(est, Day(1)))) .* sqrt(252)`, in percent. The factor √252 ≈ 15.87 turns a daily volatility of 1% into 15.87% a year.

Treat the figure as the current window's pace of movement stated in annual units, not a forecast of the coming year. A window taken on a calm morning gives a low annual figure, and a window around an announcement a high one, though neither year may ever look like that. The daily step also inherits the choice of what a day means, which [Assumptions](assumptions.md) discusses.

## Portfolio volatility and risk shares

**Portfolio Volatility** uses equal weights and reports `daily_volatility` = √(w'Σw), with `risk_share` = w .* (Σw) / (w'Σw). The shares sum to 1, and each says what fraction of the portfolio's variance an asset accounts for.

A hand case shows the reading. Take two uncorrelated assets with variances 1 and 4 and weights of 0.5. Then Σw = (0.5, 2), the contributions are 0.25 and 1, w'Σw = 1.25, and the shares are 0.2 and 0.8. Equal capital is far from equal risk. A negative share can appear when an asset hedges the rest of the portfolio.

## Scenario quantiles

**Return Scenarios** reports `q01` and `q05`, the 1% and 5% quantiles of equal-weight daily returns, with `worst` the lowest of the 10,000 draws. Under the normal draws, these sit close to −2.326 and −1.645 times `daily_volatility`, so they are a restatement of the portfolio volatility rather than new evidence about tail risk.

`worst` moves from run to run with the draw and grows with the number of draws, so it is the least informative of the three. For real stress numbers, compare the quantiles with historical daily returns of the same portfolio.

## What the estimate does not say

The matrix measures a past window. Using it for tomorrow needs the extra claim that covariance persists, which is usually roughly true over short horizons and weakens with time. Forecasting models built on sequences of realised covariances exist for precisely that reason.

One window also carries estimation error that this panel does not report as a standard error. A small correlation difference between two pairs, or between two tabs, may be nothing but noise. Running the same estimator on neighbouring windows gives a rough feel for how much the numbers move.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
