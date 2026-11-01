# Volatility Measurement — Parkinson

The Parkinson estimator measures daily volatility from nothing more than each day's high and low. [Parkinson (1980)](#ref-Par1980a) derived it from the distribution of the range of a Brownian motion.

## How the Parkinson Estimator Is Computed

The code, `parkinson_volatility(high, low)`, takes the log range log(H/L) of each day, squares it, adds up over the n days, and divides by 4 n log 2. The result is a variance per day, and the estimator returns its square root. The constant 4 log 2, about 2.77, is the expected squared range of a Brownian motion with unit variance over one period. Dividing by it turns an average squared range into a variance.

## Why the Range Beats Close-to-Close Returns

A daily return uses two prices and ignores the path between them, whereas the high and low summarise that whole path. Under the estimator's assumptions, it is about 5 times more efficient than the variance of close-to-close returns, so roughly one fifth as many days gives the same precision. That figure is an ideal, since it relies on a continuous path, and real data usually fall short of it.

## What the Parkinson Estimator Assumes

The price is taken to follow a geometric Brownian motion with no drift and constant volatility during the bar. A strong trend widens the range without any added variance, which biases the estimate upward. Each bar also stands alone, so nothing that happens while the market is closed enters: a gap between one close and the next open is simply missed. The estimate then measures trading-hours volatility, which understates total volatility for an asset with large overnight moves.

## Why Discrete Trading Biases the Range Downward

The true high and low of a continuous path are never quite observed, because trades occur only at some moments. The recorded range is thus narrower than the true range, which pushes the estimate down, and most strongly for illiquid assets with few trades. A bid-ask spread works the other way, as trades at the ask inflate the high and trades at the bid lower the low. The two effects need not cancel, and which one wins depends on the market and the asset.

## How to Use the Parkinson Result

The value is a daily volatility as a decimal, so 0.01 means about 1% per day, and **Annualise** gives the yearly figure. **Compare Estimators** sets it beside a benchmark computed from the midpoint of each day's range, as no close is entered. That midpoint is smoother than a true close, so the benchmark is only a rough guide. A Parkinson value far below volatility from actual closes suggests overnight moves or a sparse record of trades. As returns are absent, the **Barndorff-Nielsen and Shephard Test** does not apply on this tab.

## References

<a id="ref-Par1980a"></a>Parkinson, M. (1980). The extreme value method for estimating the variance of the rate of return. *Journal of Business* 53(1), 61. [doi:10.1086/296071](https://doi.org/10.1086/296071)

## See Also

- [Overview](overview.md) · [Garman-Klass](garman-klass.md) · [Rogers-Satchell](rogers-satchell.md) · [Yang-Zhang](yang-zhang.md)
