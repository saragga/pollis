# ODE Inference Methods: Profile Likelihood

**Profile Likelihood** turns a fitted model into confidence intervals and a verdict on practical identifiability, by following how the best attainable fit worsens as one parameter is moved away from its estimate.

## The profile

Let l(θ) be the objective of the fit. [Borisov and Metelkin (2020)](#ref-BM2020a), following [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a), define the profile of parameter θᵢ as the best objective attainable with θᵢ held fixed, the other parameters re-optimised:

l_PL(θᵢ) = min over θⱼ, j ≠ i, of l(θ)

At the estimate, the profile equals the minimum of l. Moving θᵢ away, the profile rises at a rate that reflects how strongly the data constrain that parameter, the others being free to compensate.

## Confidence intervals

The confidence interval at level α collects the values of θᵢ whose profile stays within a threshold Δα of the minimum,

CI = { θᵢ : l_PL(θᵢ) − l(θ̂) ≤ Δα }

where, with l(θ) = −2 log Λ(θ) and the likelihood ratio test, Δα is the α quantile of the χ² distribution, as [Borisov and Metelkin (2020)](#ref-BM2020a) write. PEtab.jl's objective is the negative log-likelihood, half of −2 log Λ, so the panel sets the threshold at half the χ²(1) quantile of **Confidence Level**, as its tooltip states and its code computes with `chi2_quantile(conf, 1) / 2`.

The interval need not be symmetric around the estimate, and one or both of its ends may be missing when the profile never reaches the threshold.

## Practical identifiability

[Borisov and Metelkin (2020)](#ref-BM2020a) quote the definition of [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a): a parameter estimate is practically non-identifiable if the likelihood-based confidence region is infinitely extended in the increasing or decreasing direction of the parameter, although the likelihood has a unique minimum for it. An identifiable parameter is one with a finite profile-likelihood interval.

The profile also detects structural non-identifiability, which, in the abstract of [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a), manifests in functionally related parameters, whose changes can offset one another. Practical non-identifiabilities arise from the limited amount and quality of the data.

## Computing the profiles

Profiles can be built step by step, moving θᵢ in small steps and re-optimising the others at each, or by integration-based methods, as [Borisov and Metelkin (2020)](#ref-BM2020a) describe. They also propose CICO, an algorithm that finds the endpoints of the interval directly by constrained optimisation, without requiring intermediate points to lie on the profile, and implement it in LikelihoodProfiler.jl.

The panel first runs `calibrate_multistart` with **n Starts** to find the best fit, then converts it with `ProfileLikelihoodProblem(res, petab_prob; threshold = ...)` and solves it with an `OptimizationProfiler` that uses `LBFGSB` and a `FixedStep` of initial size 5·10⁻³, on the log10 scale of the estimation.

## Reading the output

For every parameter, the panel prints the interval on the linear scale, with "open" for a side whose profile never crossed the threshold, and the return code of each side. The PEtab.jl tutorial shows the return code `:Identifiable` for both ends of a well-constrained parameter, and notes that the intervals come back on the estimation scale, from which `exp10` maps them to the linear one.

[Borisov and Metelkin (2020)](#ref-BM2020a) note that showing non-identifiability strictly requires exploring every feasible value of the parameter, which is never done in practice; a bounded scan region is used instead, and a profile that reaches the scan bounds without crossing the threshold stops there.

## Plots and related actions

**Profile Likelihood** plots each profile against the threshold. **Identifiability** prints, for this model, whether each parameter is identifiable on both sides, and **Confidence Intervals** prints the intervals again.

[Borisov and Metelkin (2020)](#ref-BM2020a) recall that structural non-identifiability implies practical non-identifiability, while structurally identifiable models often turn out to be practically non-identifiable. **Structural Identifiability** checks the first property before any data are fitted, and the profiles the second.

## References

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923-1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PEtab Format](petab-format.md) · [Identifiability](identifiability.md)
