# ODE Inference Methods: Interpretation

How to read the outputs: estimates and their scale, objective values, the three kinds of interval, the identifiability labels, posterior summaries and predictions.

## Estimates on the linear scale

The fits run on the log10 scale, and **Parameter Values** maps every estimate back to the linear scale, next to the value that simulated the data when the built-in problem is used. For **Bayesian Inference**, the action prints the posterior mean and standard deviation of each parameter instead.

An estimate close to its true value is reassuring, but [Villaverde, Fröhlich, Weindl, Hasenauer and Banga (2019)](#ref-VFWHB2019a) remark that a good agreement of model output and data does not imply that the parameter estimates are correct or reliable. The intervals and the identifiability outputs say how far the data pin each estimate down.

## Objective values

**Single-Start** and **Multi-Start** report the negative log-likelihood at the best fit. [Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) note that minimising the negative logarithm of the likelihood is mathematically equivalent to maximising the likelihood, because the logarithm is a monotonic function.

Objective values compare fits of the same data and noise model: a lower value is a better fit. In **Compare Optimizers**, an optimiser "reaches the best" from a start when its final value lies within 0.1 of the best value over all four optimisers, and the median run time is printed alongside.

## Three kinds of interval

| Model | Interval | Shape |
|---|---|---|
| **Profile Likelihood** | Likelihood-based, at **Confidence Level** | May be asymmetric, with "open" ends |
| **Single-Start**, **Multi-Start** | Wald 95%, ±1.96 standard errors from the Fisher information | Symmetric on the log10 scale |
| **Bayesian Inference** | 95% equal-tailed credible interval | Quantiles 0.025 and 0.975 of the draws |

A Wald interval that is symmetric on the log10 scale is asymmetric on the linear scale. An open end of a profile interval means the profile never crossed the threshold on that side, the sign of practical non-identifiability in the sense of [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a).

## The identifiability labels

StructuralIdentifiability.jl assigns each parameter and state one of three labels. Its documentation defines local identifiability as recovery up to finitely many options and global identifiability as unique recovery:

| Label | Meaning |
|---|---|
| `:globally` | Recoverable uniquely |
| `:locally` | Recoverable up to finitely many options, not uniquely |
| `:nonidentifiable` | Not recoverable, even locally |

A non-identifiable parameter may still enter a combination that is identifiable, and `find_identifiable_functions` lists such combinations; the documentation's example finds the sum and the product of two exchangeable parameters.

## Posterior summaries

For **Bayesian Inference**, the summary gives the posterior mean, standard deviation, effective sample size and R-hat of each parameter. The thresholds of [Vehtari, Gelman, Simpson, Carpenter and Bürkner (2021)](#ref-VGSCB2021a), R-hat under 1.01 and an effective sample size over 400, decide whether the summaries can be used.

The correlation matrix of **Identifiability** shows which parameters move together in the posterior: a correlation close to ±1 means the data determine a combination of the two better than either alone. Posterior means and credible intervals are on the linear scale, since `to_chains` returns the draws to the scale of the priors, as the PEtab.jl documentation explains.

## Predictions

**Simulate Model** plots all four states at the fitted parameters, including SE and S, which are not measured separately. **New Condition** predicts product formation with E(0) = 25, half the measured enzyme, from the fit: for the estimation models as a single dashed curve next to the measured condition, and for **Bayesian Inference** as the median and a 90% band over 200 posterior draws.

The band shows the spread that the uncertainty in c1, c2 and S0 carries into the prediction; measurement noise is not added to it.

## References

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923-1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

<a id="ref-RSBMS...2013a"></a>Raue, A., Schilling, M., Bachmann, J., Matteson, A., Schelker, M., Kaschek, D., Hug, S., Kreutz, C., Harms, B. D., Theis, F. J., Klingmüller, U., & Timmer, J. (2013). Lessons Learned from Quantitative Dynamical Modeling in Systems Biology. *PLOS ONE* 8(9), e74335. [doi:10.1371/journal.pone.0074335](https://doi.org/10.1371/journal.pone.0074335)

<a id="ref-VGSCB2021a"></a>Vehtari, A., Gelman, A., Simpson, D., Carpenter, B., & Bürkner, P.-C. (2021). Rank-Normalization, Folding, and Localization: An Improved R̂ for Assessing Convergence of MCMC. *Bayesian Analysis* 16(2), 667-718. [doi:10.1214/20-BA1221](https://doi.org/10.1214/20-BA1221)

<a id="ref-VFWHB2019a"></a>Villaverde, A. F., Fröhlich, F., Weindl, D., Hasenauer, J., & Banga, J. R. (2019). Benchmarking Optimization Methods for Parameter Estimation in Large Kinetic Models. *Bioinformatics* 35(5), 830-838. [doi:10.1093/bioinformatics/bty736](https://doi.org/10.1093/bioinformatics/bty736)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [PEtab Format](petab-format.md) · [Profile Likelihood](profile-likelihood.md) · [Identifiability](identifiability.md)
