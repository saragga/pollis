# Uncertainty Propagation: Assumptions

What the **Uncertainty Propagation** panel takes for granted about the model and the inputs, and the conditions under which [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) expect the Monte Carlo method, and [Joint Committee for Guides in Metrology (2008a)](#ref-JCGM2008a) the linear law of propagation, to give valid results.

## One output from a model

The Monte Carlo supplement, [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b), applies to arbitrary models with a single output quantity, where the inputs are characterised by any specified probability distributions. Given the model and the input distributions, the distribution of the output is unique, though it generally cannot be determined analytically.

In the panel, the model is **Expression** and the output is `result`, one uncertain value carried as particles. The expression can be any Julia code that accepts real numbers: [Bagge Carlson (2020)](#ref-Car2020a) note that a program written in Julia that operates on any form of real number also operates on `Particles`, since the methods of the basic functions and operators are implemented for that type.

## Independent inputs

The tooltip of **Uncertain Variables** asks for one independent input per line. Formulation in [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) assigns a distribution to each input and a joint distribution to those inputs that are not independent.

The MonteCarloMeasurements.jl documentation shows such a joint assignment: a multivariate distribution passed to `Particles`, for example an `MvNormal`, returns a vector of correlated particles. Inputs built on separate lines are independent of each other, and the default permutation of systematic samples keeps them from correlating strongly. Derived quantities belong in **Expression**, as the tooltip asks.

## Conditions for the Monte Carlo method

[Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) list the conditions for a valid application of the method:

- the model is continuous in the inputs near their best estimates;
- the distribution function of the output is continuous and strictly increasing;
- for the shortest interval only, the density of the output is continuous, unimodal and monotone on each side of the mode;
- the expectation and the variance of the output exist;
- a sufficiently large number of trials is used.

No condition on the derivatives of the model is needed, and the Supplement calls these conditions less restrictive than those for the linear framework. For an input with a t distribution of fewer than three degrees of freedom, the expectation and standard deviation of the output might not exist, yet a coverage interval can still be formed.

## Uncertain branches

[Bagge Carlson (2020)](#ref-Car2020a) name one construct that method overloading handles with difficulty: control flow where the branch is decided by an uncertain value. In the example `x > 0 ? x^2 : -x^2`, half of the particles should come out negative, but `x > 0` is not defined for uncertain values.

The documentation gives the remedy of registering such a function as a primitive with `register_primitive`, after which particles pass through it one by one; common functions such as `max` and `min` are registered already. Comparisons follow a comparison mode, `:safe` by default, which checks that all particles fulfil the condition and throws an error when the uncertain values share support.

## Variables passed as arguments

The panel finds the inputs of the comparison and sensitivity actions by reading the names in **Expression**: `ins` collects every name that refers to a variable of type `Particles`, and `fexpr` rebuilds the expression as a function of those inputs. The tooltip of **Expression** puts it in its own words: functions of your own are fine if the variables are passed as arguments, `f(x, y)`, and variables that a function reads as globals are missed.

## Assumptions of linear propagation

The law of propagation of uncertainty in [Joint Committee for Guides in Metrology (2008a)](#ref-JCGM2008a) combines the standard uncertainties of the inputs through the first-order sensitivity coefficients, a first-order Taylor series approximation of the model. When the nonlinearity of the model is significant, higher-order terms must be included, and the sum of squared contributions is valid only if the inputs are independent or uncorrelated.

For models linear in the inputs, [Joint Committee for Guides in Metrology (2008b)](#ref-JCGM2008b) require no condition for the law itself; a coverage interval further needs, among other conditions, an output that a normal or a scaled and shifted t distribution approximates adequately. The panel's description of **Against Linear Propagation** says that the first-order method misses nonlinearity and the correlation between inputs.

## References

<a id="ref-Car2020a"></a>Bagge Carlson, F. (2020). MonteCarloMeasurements.jl: Nonlinear Propagation of Arbitrary Multivariate Distributions by means of Method Overloading. *arXiv* 2001.07625. [doi:10.48550/arXiv.2001.07625](https://doi.org/10.48550/arXiv.2001.07625)

<a id="ref-JCGM2008a"></a>Joint Committee for Guides in Metrology. (2008a). *Evaluation of Measurement Data — Guide to the Expression of Uncertainty in Measurement* (JCGM 100:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf)

<a id="ref-JCGM2008b"></a>Joint Committee for Guides in Metrology. (2008b). *Evaluation of Measurement Data — Supplement 1 to the “Guide to the Expression of Uncertainty in Measurement” — Propagation of Distributions Using a Monte Carlo Method* (JCGM 101:2008). BIPM. [bipm.org](https://www.bipm.org/documents/20126/2071204/JCGM_101_2008_E.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
