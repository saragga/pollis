# ECDF

The **empirical cumulative distribution function** (ECDF) at a value *x* is the fraction of observations less than or equal to *x*. It is a step function that rises by 1/n at each data point — a complete, assumption-free picture of a distribution.

## Construction
```julia
using StatsPlots
plot(sort(x), (1:length(x)) ./ length(x); seriestype = :steppost,
    xlabel = "Value", ylabel = "F(x)", label = "Empirical")
```
StatsPlots also provides `ecdfplot(x)`.

## Comparing to a Theory
Overlay a theoretical CDF to judge fit:
```julia
using Distributions
ecdfplot(x; label = "Empirical")
plot!(t -> cdf(Normal(mean(x), std(x)), t); label = "Normal CDF")
```
The **largest vertical gap** between the two curves is the Kolmogorov–Smirnov statistic.

## Strengths
- No binning or bandwidth choice — nothing to tune.
- Handles ties and small samples gracefully.
- Two ECDFs on one axis compare groups directly.

## See Also
- [QQ Plot](qq.md) · [Decision Guide](decision-guide.md)
