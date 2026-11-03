# Uncertainty Propagation: Factsheet

A summary of the **Uncertainty Propagation** panel: its method, its inputs with their defaults, the statistics it prints and the packages its code loads.

## At a glance

| Item | Value |
| --- | --- |
| Method | Monte Carlo propagation of distributions through an expression |
| Package | MonteCarloMeasurements.jl, `Particles` |
| Distributions | Distributions.jl |
| Linear comparison | Measurements.jl, first order |
| Inputs | **Uncertain Variables**, **Expression**, **Particles (n)**, **Seed**, **CI Level** |
| Printed | mean, standard deviation, central interval |
| Action groups | Visualise, Diagnose, Predict, Compare, Interpret |

[Bagge Carlson (2020)](#ref-Car2020a) describe the package and [Giordano (2016)](#ref-Gio2016a) the linear comparison; the Monte Carlo procedure follows [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b).

## Uncertain Variables and Expression

**Uncertain Variables** takes one independent input per line, in the form `name = Particles(n, Distribution(parameters))`. The tooltip names Normal, Uniform, LogNormal, Exponential, Beta, Gamma, Weibull and TDist among the distributions, and asks for derived quantities, such as `z = x * y`, to go into the expression. The default inputs are

```
x = Particles(n, Normal(0.0, 1.0))
y = Particles(n, Uniform(0.0, 1.0))
```

**Expression** is a Julia expression of the variables, `x + y` by default. Every particle is pushed through it. Following its tooltip, constants and functions of your own are fine when the variables are passed as arguments, `f(x, y)`.

## Particles, Seed and CI Level

| Input | Options | Default |
| --- | --- | --- |
| **Particles (n)** | 100, 500, 1000, 2000, 5000, 10000 | 1000 |
| **Seed** | an integer | 42 |
| **CI Level** | 90%, 95%, 99% | 95% |

**Particles (n)** is the number of Monte Carlo samples carried by each variable; the tooltip notes that more particles give smoother estimates at a higher cost. The code calls `Random.seed!(seed)` before the variables are built, so that the particles are reproducible. **CI Level** sets the central interval reported from the quantiles of the output particles.

## Printed statistics

The main code prints three lines:

```
Mean:  pmean(result)
Std:   pstd(result)
95% CI: [pquantile(result, tail), pquantile(result, 1 - tail)]
```

with `tail = (100 - CI) / 200`, the probability in each tail, 0.025 at the 95% level. In the MonteCarloMeasurements.jl documentation, `pmean` and `pstd` extract the mean and the standard deviation of particles, and functions with the prefix p, such as `pquantile`, give further statistics of the particle cloud.

## Sampling in the package

The documentation gives the constructor `Particles([rng,] N, d; permute=true, systematic=true)`, which samples N particles from the distribution d. Common univariate distributions are sampled systematically: a single random number is drawn and used to seed the sample, which reduces its variance. By default the systematic sample is permuted, so that different variables do not correlate strongly with each other.

[Bagge Carlson (2020)](#ref-Car2020a) explain that systematic sampling uses the quantile function, the inverse distribution function, to spread the samples, and that it has lower variance than standard random sampling.

## Packages and references

The main code loads MonteCarloMeasurements, Distributions and Random. The actions add Plots for **Output Distribution**, **Output Against Each Input** and **Convergence in Particles**, Statistics for the running statistics and correlations, and Measurements for **Against Linear Propagation**.

The panel lists the papers of [Bagge Carlson (2020)](#ref-Car2020a) and [Giordano (2016)](#ref-Gio2016a) under Software, and the GUM of [Joint Committee for Guides in Metrology (2008a)](#ref-JCGM2008a) and its Monte Carlo supplement, [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b), under Standards.

## References

<a id="ref-Car2020a"></a>Bagge Carlson, F. (2020). MonteCarloMeasurements.jl: Nonlinear Propagation of Arbitrary Multivariate Distributions by means of Method Overloading. *arXiv* 2001.07625. [doi:10.48550/arXiv.2001.07625](https://doi.org/10.48550/arXiv.2001.07625)

<a id="ref-Gio2016a"></a>Giordano, M. (2016). Uncertainty Propagation with Functionally Correlated Quantities. *arXiv* 1610.08716. [doi:10.48550/arXiv.1610.08716](https://doi.org/10.48550/arXiv.1610.08716)

<a id="ref-JCGM2008a"></a>Joint Committee for Guides in Metrology. (2008a). *Evaluation of Measurement Data — Guide to the Expression of Uncertainty in Measurement* (JCGM 100:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf)

<a id="ref-JCGM2008b"></a>Joint Committee for Guides in Metrology. (2008b). *Evaluation of Measurement Data — Supplement 1 to the “Guide to the Expression of Uncertainty in Measurement” — Propagation of Distributions Using a Monte Carlo Method* (JCGM 101:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
