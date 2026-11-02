# Interpretation

The result of a Bayesian fit is a whole distribution over the parameters, held as draws in `chain`. Any quantity of interest can be computed from those draws, and the summaries in the panel are only the most common ones.

## How to Read Summary Statistics

**Summary Statistics** runs `summarystats(chain)` and `quantile(chain)`. The mean and standard deviation in the first table summarise the posterior of each parameter. The quantile table gives the 2.5%, 25%, 50%, 75% and 97.5% points. The standard deviation measures uncertainty about the parameter given the model and data, whereas the Monte Carlo standard error, `mcse`, measures the noise from having finite draws. More draws reduce the second but not the first, so a small `mcse` is not a sign of a precise answer.

## What a Credible Interval Says

An interval from the 2.5% to the 97.5% quantile holds the parameter with probability 0.95, given the model, the priors and the data. That direct reading is what sets it apart from a confidence interval, whose 95% refers to repeated samples. The statement is conditional on the model: a poor likelihood or an unhelpful prior can make a tight interval quite wrong. An equal-tailed interval may include low-density values when the posterior is skewed, as for a variance, so look at **Density Plot** before reporting one.

## How to Read Density Plots

**Density Plot** shows the marginal posterior of each parameter across all chains. A single smooth hump supports a summary by mean and interval. Skew makes the median more suitable than the mean. Two or more humps mean that one number cannot describe the parameter. A pile-up at a boundary, such as `sigma` close to 0, can point to weak identification or a prior that matters. Comparing a density with the matching prior shows how much the data have added, and the two looking alike suggests the data say little about that parameter.

## How to Read Parameter Correlations

**Parameter Correlations** runs `corner(chain)`, which plots each pair of parameters along with its marginal histograms. Marginal summaries hide relations between parameters. A long ridge means the data pin down a combination and not each parameter separately, so individual intervals look wider than the real uncertainty about the combination. Funnels and curved bands also show why a sampler may struggle. For any quantity built from several parameters, compute it for each draw and summarise the result, which takes the correlations into account automatically.

## How to Compute Derived Quantities and Probabilities

Questions usually go beyond a single parameter. Using `chain[:mu]` gives the draws of `mu`, and `mean(chain[:mu] .> 0)` estimates the probability that `mu` is positive. A ratio or a predicted effect can be computed from the draws in the same way, and its uncertainty comes along automatically. Avoid plugging posterior means into a formula, because the mean of a nonlinear function differs from the function of the mean. Probabilities close to 0 or 1 rest on few draws, so check them against **Effective Sample Size**.

## How to Read Posterior Predictive Draws

**Posterior Predictive** returns draws of new observations that combine parameter uncertainty with the noise in the likelihood. Intervals from it are therefore wider than intervals for the mean, and they answer a different question: where a new observation may fall and not where the average lies. Its output has one column per observation of `y`, so each column gives a distribution for one position. Predictions are only as sound as the model, and they assume that new data come from the same process.

## How to Report a Bayesian Fit

Give the full model with its priors, the sampler and its settings, the number of chains and draws kept, and values of **R-hat** and **Effective Sample Size**. Report intervals together with point summaries, and state the results of the predictive and prior checks that were run. Priors affecting the conclusion should be said to do so, with the range of results they give.

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
