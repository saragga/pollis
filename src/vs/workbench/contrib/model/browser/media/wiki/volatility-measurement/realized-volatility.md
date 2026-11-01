# Volatility Measurement — Realized Volatility

Realized volatility measures a day's variation directly from its intraday returns. [Andersen and Bollerslev (1998)](#ref-AB1998a) showed that such a measure makes a far less noisy benchmark for volatility forecasts than squared daily returns do.

## How Realized Volatility Is Computed

`realized_volatility(price)` takes the differences of log prices, squares them, adds them up, and returns the square root of the sum. Nothing is averaged and nothing is annualised, so the result depends on the period covered by **Price**: one day of prices gives one daily volatility. A series of several days returns the volatility of the whole span, overnight moves included, and this is not a daily figure.

## What Realized Variance Estimates

For a price that moves continuously without noise, the sum of squared returns approaches the integrated variance of the period as the time between returns shrinks. This limit requires no assumption that volatility is constant, and no model of how it changes, which is the appeal of the measure. If the price also jumps, the sum approaches integrated variance plus the sum of the squared jumps, so realized variance alone cannot tell the two apart.

## How Often to Sample Prices for Realized Volatility

Finer sampling should improve the estimate, but at very high frequency prices also contain market noise such as bid-ask bounce. That noise adds to every squared return, so the sum grows with the number of returns and overstates variance. A common compromise is a few minutes between prices, in the range where noise is small next to variance, and a plot of the estimate against the sampling interval helps locate it. When tick data are all there is to use, **Two Scales Volatility** corrects the bias instead of discarding observations.

## How the Jump Test Compares Realized and Bipower Variation

The **Barndorff-Nielsen and Shephard Test** computes realized variance RV, bipower variation BPV, and a tripower quarticity TPQ that sets the scale. With n returns, Z = (RV − BPV) / sqrt(avar), where avar = ((pi/2)² + pi − 5) × TPQ / n. Under no jumps, Z is approximately standard normal, and a large positive value signals jumps, so the panel reports a one-sided p-value. The approximation needs many intraday returns: on daily data, the panel warns that the result is only indicative, and noise can also distort it at very high frequency.

## How Bipower Variation Differs in Practice

The bipower estimate of [Barndorff-Nielsen and Shephard (2004)](#ref-BS2004a) replaces squared returns by products of adjacent absolute returns, so a jump's contribution comes multiplied by a normal-sized neighbour. **Compare Estimators** prints realized and bipower volatility together, where a large gap signals jumps. Two caveats apply. Two adjacent jumps both remain in the estimate, and sampling at the finest frequency can lower bipower through zero returns between stale prices, which imitates a jump signal.

## How to Read a Realized Volatility Result

The output is a volatility for the span of the series, as a decimal. Use **Annualise** only when that span is one day, since it multiplies by the square root of 252. Trading hours are all that an intraday series can cover, so the overnight part of daily risk is absent. **Rolling Volatility** works over 21 consecutive returns on this tab, which gives a view of change within the series, and it is not a series of daily values.

## References

<a id="ref-AB1998a"></a>Andersen, T. G. and Bollerslev, T. (1998). Answering the skeptics: yes, standard volatility models do provide accurate forecasts. *International Economic Review* 39(4), 885–905. [doi:10.2307/2527343](https://doi.org/10.2307/2527343)

<a id="ref-BS2004a"></a>Barndorff-Nielsen, O. E. and Shephard, N. (2004). Power and bipower variation with stochastic volatility and jumps. *Journal of Financial Econometrics* 2(1), 1–37. [doi:10.1093/jjfinec/nbh001](https://doi.org/10.1093/jjfinec/nbh001)

## See Also

- [Overview](overview.md) · [Introduction to HF Volatility](intro-hf-finance.md) · [Two Scales Volatility](two-scales-volatility.md)
