# Volatility Measurement — Two Scales Volatility

Two Scales Volatility keeps all the tick data and removes the noise bias, in place of thinning the data to avoid it. [Zhang, Mykland and Aït-Sahalia (2005)](#ref-ZMA2005a) combine one sum over all returns with an average of sums over sparser grids.

## How Two Scales Volatility Is Computed

`two_scales_volatility(price; K)` computes rv_all from all n returns. It then splits the prices into K offset grids, taking every K-th price from each starting point, computes a realized variance on each, and averages them into rv_slow. With n_bar = (n − K + 1) / K, the average number of returns per grid, the estimate is (rv_slow − (n_bar / n) × rv_all) / (1 − n_bar / n). The function returns its square root, for the whole span of the series.

## Why Two Time Scales Remove the Noise Bias

Market noise adds to realized variance an amount proportional to the number of returns. So rv_all is dominated by noise and carries little else at the finest scale, which makes it a measure of noise. The sparse sum rv_slow holds the variance sought, plus a smaller noise bias in proportion to n_bar. Subtracting n_bar / n of rv_all removes that smaller bias, and dividing by 1 − n_bar / n is the small-sample adjustment that makes up for the variance removed along the way.

## Why Averaging Over Subsamples Matters

A single sparse grid would discard most of the data, and which grid is chosen would be arbitrary. Averaging over all K offset grids uses every price, and reduces the sampling error that a single grid would have. This is what makes the estimator better than simply sampling every few minutes. In the original article, the estimator converges at rate n^(−1/6) when K grows like n^(2/3), and it is consistent despite the noise, which plain realized variance is not.

## How to Choose Subsamples K

**Subsamples K** sets the slow time scale, with a default of 5, and the panel's tooltip gives 5 to 30 as typical values. A larger K lessens the noise left in the slow scale, and it leaves each grid with fewer returns. The theoretical rate implies that K should rise with the number of prices, so a value suited to a few hundred quotes will be small for many thousands of ticks. Try several values and look for a range where the estimate is stable: a result that keeps falling as K rises suggests that noise remains.

## Why Two Scales Volatility Can Return NaN

The formula subtracts one estimate from another, so in a short sample or a calm stretch the variance can come out negative, and it has no square root. The function returns `NaN` in that case and raises no error. **Rolling Volatility** is the likeliest place to see this, as its window of 21 returns is very short for the method, and gaps in the line are to be expected. Such values show that the sample is too short for the estimator, and a longer window is the remedy.

## What Two Scales Volatility Assumes

The estimator treats noise as independent of the price and independent across ticks. Real noise can be correlated in time or depend on order flow, for instance through runs of trades on one side, which this basic form does not handle, and irregular spacing and stale quotes also affect it. It targets integrated variance with no jumps, so a jump stays in the estimate just as in realized variance. For data with possible jumps, **Bipower** answers a different question, and the two can be compared.

## References

<a id="ref-ZMA2005a"></a>Zhang, L., Mykland, P. A. and Aït-Sahalia, Y. (2005). A tale of two time scales: determining integrated volatility with noisy high-frequency data. *Journal of the American Statistical Association* 100(472), 1394–1411. [doi:10.1198/016214505000000169](https://doi.org/10.1198/016214505000000169)

## See Also

- [Overview](overview.md) · [Realized Volatility](realized-volatility.md) · [Introduction to HF Volatility](intro-hf-finance.md)
