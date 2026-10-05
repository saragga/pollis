# Pollis vs Oracle Crystal Ball
## Monte Carlo Simulation / Distribution Coverage

Oracle Crystal Ball automatically calculates and records the results of thousands of "what-if" scenarios, providing a range of possible outcomes.

Pollis uses [Distributions.jl](https://github.com/JuliaStats/Distributions.jl) as its probabilistic
engine. Crystal Ball is Oracle's Monte Carlo simulation add-in for Microsoft Excel, offering 21
predefined distributions plus a custom distribution builder.

The table below marks **✓** where sampling is available and **—** where it is not.
Crystal Ball's *Custom Distribution* and Pollis's *Mixture*, *Product*, and *Convolution* capabilities
are composite/user-defined mechanisms rather than named distributions and are summarised separately.

---

## Continuous Distributions

| Distribution | Pollis | Crystal Ball |
|---|:---:|:---:|
| Beta | ✓ | ✓ |
| BetaPERT ¹ | — | ✓ |
| Cauchy | ✓ | — |
| Chi-squared | ✓ | — |
| Epanechnikov | ✓ | — |
| Exponential | ✓ | ✓ |
| Gamma | ✓ | ✓ |
| Generalized Extreme Value | ✓ | — |
| Generalized Pareto | ✓ | — |
| Gumbel (Maximum Extreme) | ✓ | ✓ |
| Inverse Gaussian | ✓ | — |
| Laplace | ✓ | — |
| Lévy | ✓ | — |
| Logistic | ✓ | ✓ |
| Log-Normal | ✓ | ✓ |
| Minimum Extreme ² | — | ✓ |
| Normal | ✓ | ✓ |
| Pareto | ✓ | ✓ |
| Skew-Normal | ✓ | — |
| Student's *t* | ✓ | ✓ |
| Triangular | ✓ | ✓ |
| Uniform | ✓ | ✓ |
| Weibull | ✓ | ✓ |

¹ BetaPERT is a PERT-parameterised Beta (min, most-likely, max) specific to Crystal Ball; it is not
available in Distributions.jl.

² The Minimum Extreme Value distribution is not named separately in Distributions.jl; it can be
obtained by negating a Gumbel variate. The Generalized Extreme Value distribution (ξ → 0) subsumes
both extremes.

---

## Discrete Distributions

| Distribution | Pollis | Crystal Ball |
|---|:---:|:---:|
| Bernoulli (Yes-No) | ✓ | ✓ |
| Binomial | ✓ | ✓ |
| Categorical | ✓ | — |
| Discrete Uniform | ✓ | ✓ |
| Geometric | ✓ | ✓ |
| Hypergeometric | ✓ | ✓ |
| Negative Binomial | ✓ | ✓ |
| Poisson | ✓ | ✓ |

---

## Categories Exclusive to Pollis

| Category | Distributions included |
|---|---|
| **Truncated** | Normal, Gamma, Exponential, Log-Normal, Weibull, Pareto |
| **Multivariate** | MvNormal, Dirichlet, Multinomial |
| **Matrix-Variate** | Wishart, InverseWishart, MatrixNormal |
| **Mixture Models** | Any combination of the above via `MixtureModel` |
| **Product Distributions** | Independent marginals via `product_distribution` |
| **Convolutions** | Sums of random variables via `convolve` |

---

## Summary

| | Pollis | Crystal Ball |
|---|:---:|:---:|
| Continuous distributions | 22 | 14 |
| Discrete distributions | 8 | 7 |
| Truncated distributions | 6 | — |
| Multivariate distributions | 3 | — |
| Matrix-variate distributions | 3 | — |
| Composite mechanisms | 3 | 1 (Custom) |
| **Total named distributions** | **42** | **21** |

Pollis covers all Crystal Ball distributions except BetaPERT and the Minimum Extreme Value
(which Crystal Ball treats as a distinct entry but is simply a reflected Gumbel).
In return, Pollis offers twice the named distributions plus entire distribution families —
truncated, multivariate, and matrix-variate — that Crystal Ball does not support.

## Forecasting (CB Predictor)

Oracle Crystal Ball analyses historical data using time-series forecasting and regression to predict future trends. Methods include,

* Moving Averages: Single and double moving averages are used for smoothing data.
* Exponential Smoothing: Techniques including Single, Double, Triple (Holt-Winters), and Linear exponential smoothing.
* Regression Analysis: Multiple Linear Regression.
* Seasonal Methods: Specifically designed for time-series data with complete cycles.
* Automatic Fitting (Best Fit): CB Predictor can automatically test multiple time-series methods and choose the best one based on data fit.


## Optimisation (OptQuest)

Oracle Crystal Ball finds optimal solutions for business models by identifying the best combination of input variables that meet specific goals.

OptQuest is an optimization tool often used with Crystal Ball to find the best decision variables to meet a specific goal.

## Risk Analysis Tools

Oracle Crystal Ball includes Tornado charts for sensitivity analysis, overlay/trend charts, distribution fitting, and scatter charts.

## Core Functions

Modeling Uncertainty: Defines ranges of values for uncertain inputs (assumptions) and predicts the probability of specific outcomes.

Sensitivity Analysis: Determines which variables have the greatest impact on the model, showing where to focus attention to reduce risk.

Reporting: Generates detailed reports, charts, and graphs to communicate risk and forecast results.
