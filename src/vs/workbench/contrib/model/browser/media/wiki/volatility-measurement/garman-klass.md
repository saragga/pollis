# Volatility Measurement — Garman-Klass

The Garman-Klass estimator adds a day's opening and closing prices to its range. [Garman and Klass (1980)](#ref-GK1980a) sought the combination of these prices with the smallest sampling error under a driftless Brownian motion.

## How the Garman-Klass Estimator Is Computed

For each day, `garman_klass_volatility` computes 0.5 log(H/L)² − (2 log 2 − 1) log(C/O)². The coefficient 2 log 2 − 1 is about 0.386. The value is averaged over the n days, and the estimator returns the square root as a daily volatility. No day can contribute a negative term, since the open-to-close move never exceeds the high-low range, and 0.5 is larger than 0.386.

## Why the Garman-Klass Estimator Subtracts the Open-to-Close Term

The first term is a range-based variance, and the second is a correction that uses what the day's net move reveals about that range. The formula subtracts the move because a large range is less surprising when the day also ended far from where it began, so the range and the net move are partly the same information. The weights make the combination unbiased under the assumed model with lower variance than the range alone.

## What the Garman-Klass Estimator Assumes

The estimator assumes a price with no drift and constant volatility within the bar, with an opening price that follows on from the earlier close. For a price trending strongly during the day, the formula attributes the trend to variance and comes out biased, and **Rogers-Satchell** was designed to remove this effect. Because only same-day prices appear, volatility from one close to the next open is outside the estimate, which is the reason for using **Yang-Zhang** with significant overnight gaps.

## When to Prefer Garman-Klass Over Parkinson

With complete bars and a price without much drift, **Garman-Klass** uses more of the data than **Parkinson** and is expected to be more precise. It also inherits weaknesses of the data: open and close prices are noisier for thinly traded assets, and an opening auction can print an unrepresentative price. Where these prices are poor, or are missing in some of the sample, **Parkinson** may be the more dependable of the two. Setting the two results side by side is a cheap check.

## How to Read a Garman-Klass Result

The result is a daily volatility as a decimal. **Compare Estimators** shows it next to close-to-close volatility from the same prices. A close-to-close figure well above it suggests overnight variance that this formula leaves out, and the difference is a rough sign of how much **Yang-Zhang** might add. **Rolling Volatility** applies the same formula over a window of 21 days, which indicates how the level changes through time and how noisy a short window is.

## References

<a id="ref-GK1980a"></a>Garman, M. B. and Klass, M. J. (1980). On the estimation of security price volatilities from historical data. *Journal of Business* 53(1), 67. [doi:10.1086/296072](https://doi.org/10.1086/296072)

## See Also

- [Overview](overview.md) · [Parkinson](parkinson.md) · [Rogers-Satchell](rogers-satchell.md) · [Yang-Zhang](yang-zhang.md)
