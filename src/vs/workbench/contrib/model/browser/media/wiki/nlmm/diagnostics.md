# Diagnostics

Diagnostics of a nonlinear mixed model ask three questions: did the estimator finish, does the model reproduce the data, and are the fitted random effects informative? The Next Steps of the panel address each one.

## How to Check That a Nonlinear Mixed Model Fit Has Finished

`get_converged` reports the optimizer's stopping flag, not the quality of the fit. A `false` from **Laplace** or **FOCEI** can mean that the iteration limit was reached, which is common with network weights in **Neural Components** because they have flat directions. In that case, check whether the main parameters still move when the limit is raised. For **SAEM** and **MCEM**, **Estimator Trajectories** shows each parameter over the iterations, and a trace still drifting at the end has not settled. For **MCMC**, **Posterior Chain Summary** gives effective sample sizes and R-hat, and a low effective sample size calls for a longer run.

## What a Visual Predictive Check Shows

A **Visual Predictive Check** simulates new data sets from the fitted model and compares percentile bands of the simulations with the same percentiles of the observations. Agreement in the median points to a sound structural model, and agreement in the outer percentiles points to sound variability. The check reads best when subjects share a design. With differing doses or covariates, the raw bands mix different predictions, and the prediction correction of [Bergstrand, Hooker, Wallin and Karlsson (2011)](#ref-BHWK2011a) addresses that problem. Few simulations give jagged bands, so a final check deserves more of them than a first look.

## How to Read Residuals in a Nonlinear Mixed Model

**Residual Q-Q Plot** sets quantile residuals against the standard normal. Quantile residuals are built from the model's own distribution for each observation, so they apply beyond the Normal case. Curved tails point to a wrong error distribution, and a shift in the middle points to a mean curve that misses the data. Patterns over time or over the predicted value, which `plot_residuals` shows, point to a structural problem. Discrete outcomes such as those in **Markov Models** need other checks, so the plot is not offered there.

## What Shrinkage of the Random Effects Means

Estimated random effects are pulled towards zero when a subject's data say little about them. **Shrinkage of the Random Effects** reports one minus the spread of the estimated effects over their fitted spread. [Savic and Karlsson (2009)](#ref-SK2009a) showed that high shrinkage can distort diagnostics built on those estimates and hide or invent relationships with covariates. Values above about 0.3 are a warning: **Random-Effects Density** and **Random Effects per Subject** then reflect the assumed distribution more than the data.

## How to Check Hidden States in the Markov Models Tab

**Hidden State Probabilities** shows the filtered probability of each state over time. Probabilities that stay near one half mean that the signal separates the states poorly. Rates and emission probabilities trade off in that situation, so their estimates can sit far from each other across data sets while the likelihood hardly changes. A spread between subjects that collapses towards zero usually reflects too little information per subject and not a true absence of variation.

## References

<a id="ref-BHWK2011a"></a>Bergstrand, M., Hooker, A. C., Wallin, J. E. and Karlsson, M. O. (2011). Prediction-Corrected Visual Predictive Checks for Diagnosing Nonlinear Mixed-Effects Models. *The AAPS Journal* 13(2), 143–151. [doi:10.1208/s12248-011-9255-z](https://doi.org/10.1208/s12248-011-9255-z)

<a id="ref-SK2009a"></a>Savic, R. M. and Karlsson, M. O. (2009). Importance of Shrinkage in Empirical Bayes Estimates for Diagnostics: Problems and Solutions. *The AAPS Journal* 11(3), 558–569. [doi:10.1208/s12248-009-9133-0](https://doi.org/10.1208/s12248-009-9133-0)

## See Also

- [Assumptions](assumptions.md) · [Uncertainty Quantification](uncertainty-quantification.md) · [Estimation Methods](estimation-methods.md) · [Decision Guide](decision-guide.md)
