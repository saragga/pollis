# Uncertainty Propagation: Overview

The **Uncertainty Propagation** panel pushes uncertain inputs through a Julia expression with MonteCarloMeasurements.jl. Each input is a cloud of particles, samples drawn from a distribution of Distributions.jl, and the expression is evaluated on every particle, so the output is a cloud of particles as well, summarised by its mean, its standard deviation and an interval.

## Particles that behave like numbers

[Bagge Carlson (2020)](#ref-Car2020a) present MonteCarloMeasurements.jl as a package for working with probability distributions by means of Monte Carlo methods, in a way that propagates multivariate distributions through arbitrary functions. Its type `Particles` represents a distribution by an internal vector of unweighted samples; it is a subtype of `Real` and, through method overloading, behaves like a regular real number in calculations.

Every function applied to a variable of type `Particles` is dispatched to a method that applies the function to every sample in the vector. After the calculation, the output particles capture an approximation to the complete distribution of the output. The name comes from the particle filtering literature, where a particle is synonymous with a sample.

## Formulation, propagation and summary

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b), the Monte Carlo supplement to the *Guide to the Expression of Uncertainty in Measurement*, divides uncertainty evaluation into three stages. Formulation defines the output quantity and the inputs it depends on, relates them by a model and assigns probability distributions to the inputs. Propagation carries those distributions through the model to the distribution of the output. Summarising takes from that distribution an estimate, its standard uncertainty and a coverage interval for a stipulated probability.

The Supplement implements the propagation with a Monte Carlo method, whose heart is repeated sampling from the distributions of the inputs and evaluation of the model in each case. In the panel, **Uncertain Variables** assigns the distributions, **Expression** is the model, and the printed mean, standard deviation and interval are the summary.

## Linear propagation

[Bagge Carlson (2020)](#ref-Car2020a) describe two common approximation techniques. The first linearises the function and approximates the input distribution with a normal one, after which linear propagation of normal distributions applies; the second is the Monte Carlo method. The law of propagation of uncertainty of [Joint Committee for Guides in Metrology (2008a)](#ref-JCGM2008a) is the first kind: a first-order Taylor series approximation of the model.

Measurements.jl, introduced by [Giordano (2016)](#ref-Gio2016a), defines numbers with uncertainties and returns the uncertainty of a result according to linear error propagation theory, with functional correlation between quantities handled. The panel uses it in **Against Linear Propagation**, next to the Monte Carlo result.

## Actions

The actions come in five groups:

- **Visualise**: **Output Distribution** and **Output Against Each Input**.
- **Diagnose**: **Convergence in Particles** and **Shape of the Output**.
- **Predict**: **Percentiles** and **Tail Probabilities**.
- **Compare**: **Against Linear Propagation** and **Fewer Particles**.
- **Interpret**: **In Plain Terms** and **Which Input Matters**.

The actions work on `result`, the output particles, and several also on `ins`, the uncertain inputs that the expression names.

## Wikis and notebooks

The Factsheet lists the inputs, defaults and printed statistics. Assumptions covers what the Monte Carlo method and the linear comparison require of the model and the inputs, Diagnostics the checks on the number of particles and on the shape of the output, and Interpretation how to read the estimate, the interval and the input shares. The Decision Guide sets Monte Carlo and linear propagation side by side.

The panel's notebooks are Uncertainty Propagation Basics, Nonlinear Propagation, Coverage Intervals, Sensitivity Analysis and Correlated Inputs.

## References

<a id="ref-Car2020a"></a>Bagge Carlson, F. (2020). MonteCarloMeasurements.jl: Nonlinear Propagation of Arbitrary Multivariate Distributions by means of Method Overloading. *arXiv* 2001.07625. [doi:10.48550/arXiv.2001.07625](https://doi.org/10.48550/arXiv.2001.07625)

<a id="ref-Gio2016a"></a>Giordano, M. (2016). Uncertainty Propagation with Functionally Correlated Quantities. *arXiv* 1610.08716. [doi:10.48550/arXiv.1610.08716](https://doi.org/10.48550/arXiv.1610.08716)

<a id="ref-JCGM2008a"></a>Joint Committee for Guides in Metrology. (2008a). *Evaluation of Measurement Data — Guide to the Expression of Uncertainty in Measurement* (JCGM 100:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf)

<a id="ref-JCGM2008b"></a>Joint Committee for Guides in Metrology. (2008b). *Evaluation of Measurement Data — Supplement 1 to the “Guide to the Expression of Uncertainty in Measurement” — Propagation of Distributions Using a Monte Carlo Method* (JCGM 101:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
