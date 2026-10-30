# Interpretation

## Summary of the Estimate
**Summary of the Estimate** gives the main features of the estimate:
- **Histogram**: the modal bin's midpoint, the mean and standard deviation from the bins, and the median of the data.
- **Kernel Density**: the mode, mean, standard deviation and median of the smoothed density.
- **Parametric**: the mean, median, mode, standard deviation, skewness, kurtosis and the 5% and 95% quantiles of the fitted distribution.
On Old Faithful the mean, about 3.5 minutes, falls between the two peaks, where few eruptions are: for a bimodal density, the mean and the median are poor summaries, and the modes say more.

## Fitted Parameters
For a parametric fit, the parameters printed by the main code are maximum-likelihood estimates, with their standard errors from the bootstrap actions. Each family has its own parameterisation in Distributions.jl: Gamma by shape and scale, Exponential by scale, not rate.

## Density at New Points
**Density at New Points** evaluates the estimate at the 5%, 25%, 50%, 75% and 95% quantiles of the data. A density value is not a probability: it is probability per unit of x, and can exceed 1 when the spread is small.

## Probability of an Interval
**Probability of an Interval** gives the estimate's probability of the interval (a, b], set in the code to (-1, 1], beside the share of the data in it; change a and b to an interval within the data's range. The histogram counts only bins wholly inside the interval.

## Draw New Samples
**Draw New Samples** draws 1000 values from the estimate: uniformly within bins chosen by their counts, the data plus kernel noise (a smoothed bootstrap), or from the fitted distribution. Their mean should match the data's.

## Candidate Distributions by AIC
**Candidate Distributions by AIC** fits eight continuous families and sorts them by AIC, lowest first, with BIC beside it. A difference in AIC under 2 is no real preference; over 10 is decisive. The best family by AIC may still fit poorly: check its CDF.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
