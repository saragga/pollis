# Parameter Estimation for ODEs: Diagnostics

How to check a fit: the observed against the simulated values, the waterfall of the starts, the standardised residuals and practical identifiability.

## Observed against simulated

**Observed vs. Simulated** plots the measurements against the fitted observables, with PEtab.jl's plotting recipe at the best parameters. A fit that passes through the data of both observables at all times is the first condition for trusting the estimates. The action draws the first simulation condition of the problem, the only one of the built-in problem; with a problem of one's own that has several conditions, the others are not drawn.

## The waterfall plot

**Waterfall Plot** sorts the final objective values of all starts, best first. The PEtab.jl tutorial explains its reading: the plateaus correspond to different local optima, and the lowest plateau indicates the best solution found. The panel also prints how many finished starts end within 0.1 of the best value and how many failed.

A long first plateau means that the best minimum is found again and again, which supports it as the global one. [Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) describe the rate at which a multi-start reaches the global optimum as tied to the size of its basin of attraction compared with the whole search space.

## Standardised residuals

**Residual Analysis** computes the residuals of the best fit, standardised by the noise σ of each observable, prints their mean and standard deviation, and plots them. As the printed note says, the mean should be near 0 and the standard deviation near 1 if the model and its noise model fit, and for an observable with an estimated σ, a standard deviation near 1 holds by construction.

Residuals that drift with time, or that keep one sign over long stretches, point to a model structure or a noise model that does not match the data, the point [Raue, Schilling, Bachmann, Matteson, Schelker, Kaschek, Hug, Kreutz, Harms, Theis, Klingmüller and Timmer (2013)](#ref-RSBMS...2013a) make about realistic variance components.

## Practical identifiability

**Identifiability** gives the practical counterpart of Structural Identifiability of ODEs:

| Tab | Output | Reading |
|---|---|---|
| **Single-Start**, **Multi-Start** | Eigenvalues and condition number of the Fisher information, least informed direction | A tiny eigenvalue marks a direction the data barely constrain |
| **Profile Likelihood** | Return codes of both sides of each profile | Identifiable only if both sides cross the threshold |

The profile criterion follows [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a), through the definitions that [Borisov and Metelkin (2020)](#ref-BM2020a) restate.

## References

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923-1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

<a id="ref-RSBMS...2013a"></a>Raue, A., Schilling, M., Bachmann, J., Matteson, A., Schelker, M., Kaschek, D., Hug, S., Kreutz, C., Harms, B. D., Theis, F. J., Klingmüller, U., & Timmer, J. (2013). Lessons Learned from Quantitative Dynamical Modeling in Systems Biology. *PLOS ONE* 8(9), e74335. [doi:10.1371/journal.pone.0074335](https://doi.org/10.1371/journal.pone.0074335)
## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PEtab Format](petab-format.md) · [Profile Likelihood](profile-likelihood.md) · [Identifiability](../odeident/identifiability.md)
