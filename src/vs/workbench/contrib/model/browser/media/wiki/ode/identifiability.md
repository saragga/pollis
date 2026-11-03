# ODE Inference Methods: Identifiability

Whether the parameters of a model can be recovered at all: structurally, from perfect data on the chosen outputs, and practically, from the noisy and limited data at hand.

## Two questions

[Borisov and Metelkin (2020)](#ref-BM2020a) distinguish two approaches. Structural identifiability analysis examines the model's structure independently of any experimental data. Practical identifiability analysis is data-based: it asks how precisely the parameters can be estimated from the available data, taking measurement noise and incomplete data into account, and describes the answer with confidence intervals and regions.

The two are ordered: structural non-identifiability implies practical non-identifiability, but a structurally identifiable model can still be practically non-identifiable. The panel's first bullet, **Identifiability First**, puts the structural check before any fitting.

## Structural identifiability

[Dong, Goodbrake, Harrington and Pogudin (2023)](#ref-DGHP2023a) call a parameter identifiable if its value can be determined uniquely from input–output data, assuming the absence of noise and sufficiently exciting inputs, and describe identifiability as a natural prerequisite for meaningful parameter estimation. Their algorithm computes the differential-algebraic relations between inputs and outputs by elimination, and builds on them a randomised algorithm for assessing structural identifiability, implemented in StructuralIdentifiability.jl.

`assess_identifiability` labels each parameter and state `:globally` identifiable, `:locally` but not globally identifiable, or `:nonidentifiable`, even locally. Its documentation notes that the result is correct with a probability of at least `prob_threshold`, 0.99 by default, and that the bound is conservative.

## In the panel

**Structural Identifiability** writes the Michaelis–Menten model with `@ODEmodel`, with c3 = 3 substituted, as in the estimation models. **Observed Outputs** chooses what is measured: both S + E and P, P only, or S + E only. E, SE and P are passed as `known_ic`, since their initial values are known, which the documentation describes as an experimental feature: initial conditions of the listed functions are assumed known, while the others stay generic.

The code prints the label of every parameter and state and the identifiable combinations found by `find_identifiable_functions`. Changing **Observed Outputs** and running again shows how the choice of measurements decides what can be recovered.

## Identifiable combinations

When single parameters are not identifiable, functions of them may be. The StructuralIdentifiability.jl tutorial shows a model in which a state and a parameter can be scaled together, x₂ → λx₂ and b → b/λ, without changing the output, so that neither is identifiable but their product is; in another, two parameters can be exchanged, and only their sum and product are identifiable.

`find_identifiable_functions` computes such combinations directly. [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a), in their abstract, describe structural non-identifiabilities as manifest in functionally related parameters, which the profile likelihood detects as well.

## Practical identifiability

With data, the panel offers three views in **Identifiability**:

| Model | Measure |
|---|---|
| **Single-Start**, **Multi-Start** | Eigenvalues of the Fisher information at the best fit, its condition number, and the least informed direction |
| **Profile Likelihood** | Whether the profile of each parameter crosses the threshold on both sides |
| **Bayesian Inference** | Correlations between the parameters in the posterior draws |

[Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a) define practical non-identifiability by a likelihood-based confidence region that extends infinitely in one direction although the likelihood has a unique minimum, and suggest the profile likelihood to detect it, as well as structural non-identifiabilities, and to derive confidence intervals.

## Remedies

A non-identifiable parameter calls for more informative data or a simpler model. [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a) note that the results of profile likelihood analysis can be used for experimental planning and for model reduction, and [Borisov and Metelkin (2020)](#ref-BM2020a) that practical identifiability addresses how accurately parameters can be recovered from the available experimental data. **Observed Outputs** illustrates the first remedy at the structural level: measuring both observables rather than one can change which parameters are identifiable.

The PEtab.jl documentation notes that poor identifiability means that several parameter values fit the data nearly equally well, which makes predictions outside the measured conditions unreliable.

## References

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-DGHP2023a"></a>Dong, R., Goodbrake, C., Harrington, H. A., & Pogudin, G. (2023). Differential Elimination for Dynamical Models via Projections with Applications to Structural Identifiability. *SIAM Journal on Applied Algebra and Geometry* 7(1), 194-235. [doi:10.1137/22M1469067](https://doi.org/10.1137/22M1469067)

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923-1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PEtab Format](petab-format.md) · [Profile Likelihood](profile-likelihood.md)
