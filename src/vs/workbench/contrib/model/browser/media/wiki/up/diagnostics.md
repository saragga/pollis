# Uncertainty Propagation: Diagnostics

The **Diagnose** and **Compare** groups of the **Uncertainty Propagation** panel check two things: whether the particles are enough for the statistics in use, and whether the output is close enough to a normal distribution for a mean and a standard deviation to describe it.

## Convergence in Particles

**Convergence in Particles** plots the running mean and the running standard deviation over the first k particles of the output, for about 100 values of k from 20 to n. It also runs the variables and the expression ten more times, with seeds **Seed** + 1 to **Seed** + 10, and computes for the mean, the standard deviation and the two ends of the interval the standard deviation of the average of the ten estimates.

This follows the adaptive procedure of [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b), clause 7.9.4: a result is deemed to have stabilised when twice that standard deviation is less than the numerical tolerance δ associated with the standard uncertainty. With two significant digits, u(y) is written as c × 10^ℓ, with c a two-digit integer, and δ = ½ × 10^ℓ. The action prints twice the standard deviation, δ and whether each result has stabilised.

## Sampling variance

[Bagge Carlson (2020)](#ref-Car2020a) describe the variance introduced by Monte Carlo sampling as decreasing like 1/N in the number of particles, so that halving the standard deviation of an estimate takes four times the particles. The same variance does not depend on the dimension of the space, which allows the method to be used on high-dimensional problems.

The package samples common univariate distributions systematically, which, as [Bagge Carlson (2020)](#ref-Car2020a) explain, has lower variance than standard random sampling.

## Fewer Particles

**Fewer Particles** evaluates the expression again on the first 10%, 25% and 50% of the particles of each input, and on all n, and tabulates the mean, the standard deviation and the two ends of the interval for each size. The description of the action calls it a view of how much the estimates move with a smaller sample.

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) note that the estimate and its standard uncertainty generally settle considerably faster than the ends of the coverage interval as the number of trials grows, and that the larger the coverage probability, the more trials the ends need for a given numerical tolerance.

## Shape of the Output

**Shape of the Output** reports the skewness and the excess kurtosis of the output particles, `skewness(p)` and `kurtosis(p)`, and two intervals at the chosen coverage probability: the mean plus or minus k standard deviations, with k the normal quantile, and the probabilistically symmetric coverage interval of the particles.

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) list skewness and kurtosis, with the mode and the median, among the information that the sorted model values provide beyond the expectation and the standard deviation.

## Against Linear Propagation as a check

**Against Linear Propagation** builds a `measurement(pmean(v), pstd(v))` from the mean and standard deviation of each input, evaluates the expression on them with Measurements.jl and sets the linear mean and standard deviation beside the Monte Carlo ones. It then forms the interval y ± U_p of the linear result, with U_p the standard uncertainty times the normal quantile, and computes the endpoint differences d_low = |y − U_p − y_low| and d_high = |y + U_p − y_high|, equations (19) and (20) of [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b), with the tolerance δ of the Monte Carlo standard uncertainty.

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) recommend applying both the linear framework and the Monte Carlo method when it is unclear whether the conditions for the first hold, and comparing their coverage intervals: if both ends agree within a numerical tolerance set by the meaningful digits of the standard uncertainty, the linear framework is validated for that case. A favourable comparison lets the linear framework be used again for sufficiently similar problems.

## Tails

**Tail Probabilities** gives the probability that the output exceeds its mean by 1, 2 and 3 standard deviations, `@prob(result > m + k * s)`, next to `ccdf(Normal(), k)`, the probability under a normal distribution. In the MonteCarloMeasurements.jl documentation, `@prob` returns the empirical probability of a condition, the share of particles that fulfil it. The documentation's example returns the same value for `@prob p < 1` and for `mean(p.particles .< 1)`.

## References

<a id="ref-Car2020a"></a>Bagge Carlson, F. (2020). MonteCarloMeasurements.jl: Nonlinear Propagation of Arbitrary Multivariate Distributions by means of Method Overloading. *arXiv* 2001.07625. [doi:10.48550/arXiv.2001.07625](https://doi.org/10.48550/arXiv.2001.07625)

<a id="ref-JCGM2008b"></a>Joint Committee for Guides in Metrology. (2008b). *Evaluation of Measurement Data — Supplement 1 to the “Guide to the Expression of Uncertainty in Measurement” — Propagation of Distributions Using a Monte Carlo Method* (JCGM 101:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
