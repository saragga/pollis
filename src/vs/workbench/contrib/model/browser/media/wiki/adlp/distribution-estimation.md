# Distribution Estimation

Estimating a distribution by maximum likelihood means choosing the parameters that make the observed data most probable. With AD, the same few lines work for any family with a log-density.

## What the Distribution Tab Estimates

The tab builds a distribution from the unconstrained vector `p`, and minimises -sum(logpdf(d, y)). Families come from `Distributions.jl`, described by [Besançon, Papamarkou, Anthoff, Arslan, Byrne, Lin and Pearson (2021)](#ref-BPAAB...2021a), with their usual parameter meanings: Gamma has shape and scale, and Exponential has scale, so its mean equals theta. **Data (y)** set to `simulated` draws 500 values from a law with known parameters, which is how a fit can be checked. Otherwise, the input is a vector, and all values must lie inside the family's support.

## What Each Family Assumes About the Data

| Family | Support | Shape |
|---|---|---|
| Normal | Real line | Symmetric |
| LogNormal | Positive | Right-skewed, log is normal |
| Gamma | Positive | Right-skewed, with a shape parameter |
| Beta | Between 0 and 1 | Flexible on the unit interval |
| Exponential | Positive or zero | Constant hazard |

A value outside the support gives a log-density of minus infinity, so the fit fails or ends badly. Zeros in positive data are a common cause, and values of exactly 0 or 1 are a common cause for Beta.

## How to Choose Starting Values for a Distribution Fit

**Initial p[1]** and **Initial p[2]** act on the unconstrained scale, so a start of 0.0 means a scale of 1 on the log-scale parameters. A sample mean and log standard deviation make good starts for Normal and LogNormal, the latter on log y. Log-likelihoods for these families are generally well behaved, so the defaults usually serve. A second run from a different start is a cheap check. Identical answers suggest a single optimum, while different ones call for a closer look.

## How to Read a Distribution Fit

**Fit Against Data** draws the fitted density over a histogram. **Against a Reference Fit** shows the fit next to `fit` from `Distributions.jl`. **Predictions** gives five quantiles, and **Replicated Data** compares summaries of new draws with the data. **In Plain Terms** gives the mean, standard deviation and AIC, where AIC = 2k + 2 × negative log-likelihood and a lower value is better among models for the same data. Standard errors for log-scale parameters are on that scale, so a scale's own standard error is about scale × se(log scale), by the delta method.

## How the Regression Tabs Use the Same Recipe

**Linear Regression** minimises the negative log-likelihood of Normal(X beta, sigma). Its beta equals least squares, and **Against a Reference Fit** shows both. The maximum likelihood sigma divides by n, not n − p, so it runs a little low in small samples. **In Plain Terms** computes R² assuming an intercept is in X. **Logistic Regression** minimises the Bernoulli log-likelihood with a sigmoid mean, and the reference is `GLM.jl`. Coefficients are log-odds, and their exponentials are odds ratios. **Predictions** in the linear tab ignores parameter uncertainty, so its intervals are a little too narrow.

## When a Likelihood Fit Goes Wrong

A logistic fit fails to converge when a combination of covariates separates the two outcomes perfectly. [Albert and Anderson (1984)](#ref-AA1984a) show that the estimates then do not exist as finite values, and coefficients drift upwards until the optimiser stops. A wrong family is a quieter problem, since the fit still finds the closest member. [White (1982)](#ref-Whi1982a) shows what such an estimate converges to, and that usual standard errors can then be wrong. **Replicated Data** is the panel's check of the family's shape.

## References

<a id="ref-AA1984a"></a>Albert, A. and Anderson, J. A. (1984). On the existence of maximum likelihood estimates in logistic regression models. *Biometrika* 71(1), 1–10. [doi:10.1093/biomet/71.1.1](https://doi.org/10.1093/biomet/71.1.1)

<a id="ref-BPAAB...2021a"></a>Besançon, M., Papamarkou, T., Anthoff, D., Arslan, A., Byrne, S., Lin, D. and Pearson, J. (2021). Distributions.jl: definition and modeling of probability distributions in the JuliaStats ecosystem. *Journal of Statistical Software* 98(16). [doi:10.18637/jss.v098.i16](https://doi.org/10.18637/jss.v098.i16)

<a id="ref-Whi1982a"></a>White, H. (1982). Maximum likelihood estimation of misspecified models. *Econometrica* 50(1), 1–25. [doi:10.2307/1912526](https://doi.org/10.2307/1912526)

## See Also

- [Factsheet](factsheet.md) · [Unconstrained Optimisation](unconstrained.md) · [Automatic Differentiation](autodiff.md) · [Overview](overview.md)
