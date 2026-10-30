# Assumptions

## Independent Draws from One Distribution
Every estimator here treats the sample as independent draws from a single distribution. Dependent data, such as a time series with persistence, still give a sensible picture of the marginal distribution, but the bootstrap intervals and the goodness-of-fit test become too narrow. Data from several groups give a mixture: Old Faithful's two peaks are short and long eruptions.

## Histogram
A histogram assumes the density is roughly constant within each bin. Its shape depends on the number of bins and on where the edges fall: the same data can look unimodal or bimodal. **Bin Intervals** matters only for observations exactly on an edge, which is common with rounded data.

## Kernel Density
A kernel estimate assumes the density is **smooth** at the scale of the bandwidth. It spreads mass beyond the data: a variable that cannot be negative gets some density below zero, and a sharp edge, such as a uniform's, is blurred. **Silverman's rule** assumes a roughly normal shape, and tends to **oversmooth** multimodal data; cross-validation adapts better. The kernel's shape matters much less than the bandwidth.

## Parametric
A parametric fit assumes the data come from the chosen family. When the family is wrong, the maximum-likelihood estimate is the member closest to the data in the Kullback-Leibler sense, which can be far from the truth: a Normal fitted to Old Faithful puts its peak between the two real ones, where there is almost no data. Discrete families need integer data: Poisson and Geometric counts, Binomial successes out of 6 trials, Categorical classes.

## Sample Size
Non-parametric estimates need more data than parametric ones: hundreds of observations for a reliable shape in one dimension, many more in two. With small samples, a parametric family is often the safer choice.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
