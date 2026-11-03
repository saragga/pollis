# Uncertainty Propagation: Interpretation

How to read what the **Uncertainty Propagation** panel prints: the estimate and its standard uncertainty, the interval, the percentiles and tail probabilities, and the contribution of each input to the standard uncertainty.

## Estimate and standard uncertainty

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) take the average of the M model values as the estimate of the output and their standard deviation, with divisor M − 1, as its standard uncertainty. The panel prints both as `pmean(result)` and `pstd(result)`.

For a nonlinear model the estimate will not in general agree with the model evaluated at the best estimates of the inputs, since E(f(X)) differs from f(E(X)). As the number of trials grows, the average approaches E(f(X)) whenever that expectation exists, whether the model is linear or not. A difference between the two means of **Against Linear Propagation**, whose linear mean is the expression evaluated at the input means, reflects that.

## The interval

The panel's interval runs from the quantile at `tail` to the quantile at `1 - tail`, with `tail = (100 - CI) / 200`. [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) call the interval between the (1 − p)/2 and (1 + p)/2 quantiles the probabilistically symmetric 100p% coverage interval.

For an asymmetric distribution, the shortest interval with the same probability is an alternative, which for a unimodal density contains the mode. For a symmetric density the two intervals coincide. Since the density of the output is in general not symmetric, [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) point out that a coverage interval is not necessarily centred on the estimate, and **Output Distribution** draws the mean and both ends over the histogram of the particles.

## In Plain Terms

**In Plain Terms** states the estimate, the mean of the particles, with its standard uncertainty, their standard deviation, and the probabilistically symmetric coverage interval at the chosen coverage probability. It rounds the standard uncertainty to two significant digits and the other values to the same decimal position, and gives the relative uncertainty as the standard deviation in percent of the absolute mean.

Among the items [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) would typically report are the estimate, its standard uncertainty, the coverage probability, the ends of the interval and whether the interval is probabilistically symmetric or shortest. In their clause 5.5.2, the estimate, its standard uncertainty and the ends of the interval are reported to the same decimal position as the least significant digit of the standard uncertainty, for which one or two significant digits would usually be adequate.

## Percentiles and probabilities

**Percentiles** lists the output quantiles at 1, 5, 10, 25, 50, 75, 90, 95 and 99%. [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) explain that the sampled values give a step function approximation to the distribution function of the output: the probability that the output is no greater than a value y₀ is approximated by the share of model values no greater than y₀.

**Tail Probabilities** uses the same idea for exceedances, through `@prob`, and adds the normal probability at the same number of standard deviations. Where the two columns differ, the particles describe tails that a normal distribution with the same mean and standard deviation would not.

## Which Input Matters

**Which Input Matters** follows Annex B of [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b): for each input, it evaluates the expression with all other inputs held at their means, its best estimates. The standard deviation of the resulting output is the contribution of that input, and its ratio to the standard deviation of the input can be taken as a sensitivity coefficient, one that takes all higher-order terms of the Taylor series into account. The action ranks the inputs by their contributions.

The decomposition of [Joint Committee for Guides in Metrology (2008a)](#ref-JCGM2008a) for the linear case writes the combined variance as a sum of terms, one for each input, each the squared product of a sensitivity coefficient and the standard uncertainty of that input. [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) add that such a table, the uncertainty budget, may be useful to identify the dominant terms, but where the propagation of distributions is more appropriate it should be regarded as a qualitative tool.

**Output Against Each Input** draws the output particles against the particles of each input in turn. The description of the action reads a clear pattern as a sign of which inputs drive the output, and its shape as a sign of whether the relation is linear.

## References

<a id="ref-JCGM2008a"></a>Joint Committee for Guides in Metrology. (2008a). *Evaluation of Measurement Data — Guide to the Expression of Uncertainty in Measurement* (JCGM 100:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf)

<a id="ref-JCGM2008b"></a>Joint Committee for Guides in Metrology. (2008b). *Evaluation of Measurement Data — Supplement 1 to the “Guide to the Expression of Uncertainty in Measurement” — Propagation of Distributions Using a Monte Carlo Method* (JCGM 101:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
