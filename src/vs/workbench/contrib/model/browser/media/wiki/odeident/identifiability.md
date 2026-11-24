# Structural Identifiability of ODEs: Identifiability

Whether the parameters of a model can be recovered at all: structurally, from perfect data on the chosen outputs, and practically, from the noisy and limited data at hand.

## Two questions

[Borisov and Metelkin (2020)](#ref-BM2020a) distinguish two approaches. Structural identifiability analysis examines the model's structure independently of any experimental data. Practical identifiability analysis is data-based: it asks how precisely the parameters can be estimated from the available data, taking measurement noise and incomplete data into account, and describes the answer with confidence intervals and regions.

The two are ordered: structural non-identifiability implies practical non-identifiability, but a structurally identifiable model can still be practically non-identifiable. Structural Identifiability of ODEs answers the first question, before any fitting; Parameter Estimation for ODEs and Bayesian Inference for ODEs answer the second, from data.

## Structural identifiability

[Dong, Goodbrake, Harrington and Pogudin (2023)](#ref-DGHP2023a) call a parameter identifiable if its value can be determined uniquely from input–output data, assuming the absence of noise and sufficiently exciting inputs, and describe identifiability as a natural prerequisite for meaningful parameter estimation. Their algorithm computes the differential-algebraic relations between inputs and outputs by elimination, and builds on them a randomised algorithm for assessing structural identifiability, implemented in StructuralIdentifiability.jl.

`assess_identifiability` labels each parameter and state `:globally` identifiable, `:locally` but not globally identifiable, or `:nonidentifiable`, even locally. Its documentation notes that the result is correct with a probability of at least `prob_threshold`, 0.99 by default, and that the bound is conservative.

## The identifiability labels

StructuralIdentifiability.jl assigns each parameter and state one of three labels. Its documentation defines local identifiability as recovery up to finitely many options and global identifiability as unique recovery:

| Label | Meaning |
|---|---|
| `:globally` | Recoverable uniquely |
| `:locally` | Recoverable up to finitely many options, not uniquely |
| `:nonidentifiable` | Not recoverable, even locally |

A non-identifiable parameter may still enter a combination that is identifiable, which `find_identifiable_functions` finds.

## The Identifiability tab of Structural Identifiability of ODEs

The Identifiability tab writes the Michaelis–Menten model with `@ODEmodel`, with c3 = 3 substituted, as in Parameter Estimation for ODEs and Bayesian Inference for ODEs. **Observed Outputs** chooses what is measured: both S + E and P, P only, or S + E only. E, SE and P are passed as `known_ic`, since their initial values are known, which the documentation describes as an experimental feature: initial conditions of the listed functions are assumed known, while the others stay generic.

The code prints the label of every parameter and state and the identifiable combinations found by `find_identifiable_functions`. Changing **Observed Outputs** and running again shows how the choice of measurements decides what can be recovered.

## Local identifiability from one experiment or several

`assess_local_identifiability` checks local identifiability only, with a result that its documentation says is correct with a probability of at least `prob_threshold`. Its `type` is `:SE`, single-experiment identifiability, or `:ME`, multi-experiment identifiability, in which states may not be among the functions checked; for `:ME` the function also returns the number of experiments its result assumes. It takes no `known_ic`, so every initial value is unknown.

**Local Identifiability** prints the local result for every parameter and state, and **One and Several Experiments** sets the single-experiment and multi-experiment results of the parameters side by side.

## Identifiable combinations

When single parameters are not identifiable, functions of them may be. The StructuralIdentifiability.jl tutorial shows a model in which a state and a parameter can be scaled together, x₂ → λx₂ and b → b/λ, without changing the output, so that neither is identifiable but their product is; in another, two parameters can be exchanged, and only their sum and product are identifiable.

`find_identifiable_functions` computes such combinations directly. [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a), in their abstract, describe structural non-identifiabilities as manifest in functionally related parameters, which the profile likelihood detects as well.

## Reparametrisation

`reparametrize_global` rewrites a model in new variables built from its identifiable functions. It returns the new model, the meaning of each new variable in the old ones, and any relations among the new variables. The example of its documentation ends with a new model that is fully identifiable and has one parameter fewer than the original.

**Reparametrisation**, in Interpret, prints the new model and the meaning of each new variable. Like `assess_local_identifiability`, `reparametrize_global` takes no `known_ic`, so its model treats every initial value as unknown.

## Practical identifiability

With data, two other panels offer three views:

| Panel and tab | Measure |
|---|---|
| Parameter Estimation for ODEs, **Single-Start** and **Multi-Start** | Eigenvalues of the Fisher information at the best fit, its condition number, and the least informed direction |
| Parameter Estimation for ODEs, **Profile Likelihood** | Whether the profile of each parameter crosses the threshold on both sides |
| Bayesian Inference for ODEs | Correlations between the parameters in the posterior draws |

[Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a) define practical non-identifiability by a likelihood-based confidence region that extends infinitely in one direction although the likelihood has a unique minimum, and suggest the profile likelihood to detect it, as well as structural non-identifiabilities, and to derive confidence intervals.

## Remedies

A non-identifiable parameter calls for more informative data or a simpler model. [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a) note that the results of profile likelihood analysis can be used for experimental planning and for model reduction, and [Borisov and Metelkin (2020)](#ref-BM2020a) that practical identifiability addresses how accurately parameters can be recovered from the available experimental data. **Observed Outputs** illustrates the first remedy at the structural level: measuring both observables rather than one can change which parameters are identifiable.

The PEtab.jl documentation notes that poor identifiability means that several parameter values fit the data nearly equally well, which makes predictions outside the measured conditions unreliable.

## References

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-DGHP2023a"></a>Dong, R., Goodbrake, C., Harrington, H. A., & Pogudin, G. (2023). Differential Elimination for Dynamical Models via Projections with Applications to Structural Identifiability. *SIAM Journal on Applied Algebra and Geometry* 7(1), 194-235. [doi:10.1137/22M1469067](https://doi.org/10.1137/22M1469067)

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923-1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
- Parameter Estimation for ODEs: [Overview](../ode/overview.md) · [Profile Likelihood](../ode/profile-likelihood.md)
