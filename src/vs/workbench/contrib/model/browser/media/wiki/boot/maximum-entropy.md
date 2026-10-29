# Maximum Entropy Bootstrap

The **maximum entropy bootstrap** (Vinod, 2006) resamples a time series without cutting it into blocks and without assuming it is stationary. Each replicate keeps the series' **time order** and much of its **shape**, so statistics of the dependence, such as autocorrelations, carry over to the replicates.

## The Algorithm
1. **Sort** the series, and remember the rank of each observation in time.
2. Take the midpoints between consecutive sorted values as **intermediate points**, and extend the range a little beyond the smallest and largest values.
3. Build the **maximum entropy density** on these intervals, uniform within each, with exponential tails, constrained so that its mean matches the mean of the data.
4. Draw n values from this density (n sorted uniform numbers through its quantile function).
5. **Reorder** them by the original ranks: the smallest draw goes where the smallest observation was, and so on.

Step 5 is what keeps the dependence: a replicate rises and falls where the original series does, with slightly different values.

## Why Not Resample Observations
Basic resampling draws observations independently, which turns any series into white noise. The standard error of a mean of a positively autocorrelated series then comes out too small, and an autocorrelation statistic is pulled towards zero. **Compare Schemes** shows this in the panel.

## Compared with Block Bootstraps
Block bootstraps resample stretches of consecutive observations; they need a block length, and they assume stationarity. The maximum entropy bootstrap needs no tuning parameter and copes with trends and level shifts. On the other hand, its replicates stay close to the original path, so it can understate the variability of statistics that depend on the long-run behaviour of the series.

## In Bootstrap.jl

    bootstrap(statistic, series, MaximumEntropySampling(1000))

## See Also
- [Resampling Schemes](resampling-schemes.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
