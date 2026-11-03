# Uncertainty Propagation: Decision Guide

Choices in the **Uncertainty Propagation** panel: Monte Carlo or linear propagation, the number of particles, the level of the interval, and the action that answers a given question.

## Monte Carlo or linear

The MonteCarloMeasurements.jl documentation gives a primitive guide to the choice of strategy:

| Situation | Action in the documentation |
| --- | --- |
| Linear functions | linear uncertainty propagation, Measurements.jl |
| Highly nonlinear or discontinuous functions | MonteCarloMeasurements |
| Correlated quantities | MonteCarloMeasurements |
| Large uncertainties in the input | MonteCarloMeasurements |
| Small uncertainties relative to the curvature of the function | Measurements |
| Limited computational budget | Measurements, or StaticParticles with sigma points |
| Non-Gaussian input distribution | MonteCarloMeasurements |

[Bagge Carlson (2020)](#ref-Car2020a) add that the Monte Carlo method can approximate arbitrary input and output distributions and handle highly nonlinear functions, while linearisation may be more efficient computationally.

## What the supplement advises

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) distinguish three situations. If the conditions for the linear framework of [Joint Committee for Guides in Metrology (2008a)](#ref-JCGM2008a) can be shown to hold, that framework can be used. If there are indications that it is likely to be invalid, another approach should be used. When it is hard to tell, the Monte Carlo method can give the results directly or assess the quality of the linear ones. In all three cases, the Monte Carlo method is a practical alternative.

For a small but important subset of problems the linear framework is exact. The Monte Carlo method is never exact, but the Supplement calls it more valid than the linear framework for a large class of problems.

## Number of particles

**Particles (n)** runs from 100 to 10000. Its tooltip puts the trade-off simply: more particles give smoother estimates at a higher cost.

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) note that a number of trials chosen in advance gives no direct control over the quality of the results, since the number needed depends on the shape of the output distribution and on the coverage probability, and they recommend a number large compared with 1/(1 − p). They also describe an adaptive procedure that adds trials until the results of interest have stabilised. **Convergence in Particles** and **Fewer Particles** show, for the current expression, how far the statistics still move with n.

## CI Level

**CI Level** offers 90%, 95% and 99%. A higher level puts the ends of the interval further into the tails, where fewer particles lie; [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) note that the larger the coverage probability, the more trials the ends of the interval need.

Before reporting an interval at 99%, **Fewer Particles** at that level shows whether its ends have settled at the chosen n. **Shape of the Output** compares the quantile interval with the normal interval at the same level.

## Which action to use

| Question | Action |
| --- | --- |
| What does the output distribution look like? | **Output Distribution** |
| Is n large enough? | **Convergence in Particles**, **Fewer Particles** |
| Does mean ± sd describe the output? | **Shape of the Output** |
| Which values does the output reach? | **Percentiles** |
| How likely is a large deviation? | **Tail Probabilities** |
| Would linearisation do? | **Against Linear Propagation** |
| Which input drives the output? | **Which Input Matters**, **Output Against Each Input** |
| How to state the result? | **In Plain Terms** |

## Sigma points

Between linear propagation and Monte Carlo sampling, [Bagge Carlson (2020)](#ref-Car2020a) place the unscented transform: a small set of sigma points with a pre-specified mean and variance is propagated through the function. MonteCarloMeasurements.jl creates sigma points with `sigmapoints(μ, Σ)`, 2n + 1 points for n dimensions, as a compromise between fidelity and computational cost.

In the panel, the particles of each variable are drawn from its distribution with `Particles(n, d)`; for a limited computational budget, the documentation suggests `StaticParticles` with sigma points.

## References

<a id="ref-Car2020a"></a>Bagge Carlson, F. (2020). MonteCarloMeasurements.jl: Nonlinear Propagation of Arbitrary Multivariate Distributions by means of Method Overloading. *arXiv* 2001.07625. [doi:10.48550/arXiv.2001.07625](https://doi.org/10.48550/arXiv.2001.07625)

<a id="ref-JCGM2008a"></a>Joint Committee for Guides in Metrology. (2008a). *Evaluation of Measurement Data — Guide to the Expression of Uncertainty in Measurement* (JCGM 100:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf)

<a id="ref-JCGM2008b"></a>Joint Committee for Guides in Metrology. (2008b). *Evaluation of Measurement Data — Supplement 1 to the “Guide to the Expression of Uncertainty in Measurement” — Propagation of Distributions Using a Monte Carlo Method* (JCGM 101:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
