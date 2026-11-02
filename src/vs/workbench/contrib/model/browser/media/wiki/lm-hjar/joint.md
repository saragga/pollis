# Joint Method

The **Joint** tab estimates the autocorrelation and the variance equation together by maximum likelihood under normal errors. Beta then comes from GLS on data transformed with both estimates.

## What Likelihood the Joint Estimator Maximises

Write u_t = y_t - x_t' beta. Apart from a constant, the log-likelihood of the **Joint** tab is:

L = 0.5 log(1 - rho^2) - 0.5 sum(z_t' gamma) - 0.5 (1 - rho^2) u_1^2 / sigma_1^2 - 0.5 sum over t >= 2 of (u_t - rho u_(t-1))^2 / sigma_t^2

with sigma_t^2 = exp(z_t' gamma). The first term comes from the distribution of the first observation. It penalises rho near 1 or -1, a property of the exact likelihood studied by [Beach and MacKinnon (1978)](#ref-BM1978a). There is no separate overall variance, because the intercept of gamma takes that role.

## How Two-Step Works in the Joint Tab

`two_step_joint` removes beta from the problem: for any (rho, gamma), it solves GLS for beta on the doubly transformed data and evaluates the likelihood there. L-BFGS searches over (rho, gamma), from starting values based on OLS residuals, for up to 2000 iterations. A final GLS fit gives beta and its covariance matrix. The name describes the two stages of the computation. Because beta is solved for at every step of the search, the result is a maximum of the full likelihood if the optimiser has converged, and `result.converged` reports the optimiser's status.

## How Iterated Works in the Joint Tab

`iterated_joint` starts from the OLS beta and alternates two moves. With beta held fixed, L-BFGS maximises the likelihood over (rho, gamma), for up to 500 iterations. With those values held fixed, one GLS fit updates beta. Each move can only raise the likelihood if its optimisation succeeds. [Oberhofer and Kmenta (1974)](#ref-OK1974a) studied this kind of alternation. Stopping occurs when beta and rho change by less than 1e-8, or after 100 rounds with `converged` false. Gamma is not part of the stopping rule, and the status of each inner search is not reported.

## How the Joint Tab Reads the Panel Inputs

**Covariate matrix (X)** and **Response vector (y)** enter as in **Sequential**, with an intercept added. **Variance regressors (Z) — optional** gets its own intercept, and `nothing` uses X with the intercept. Rho is optimised as tanh of an unconstrained number, so it stays strictly between -1 and 1. Starting values take rho from the OLS residuals, limited to the range from -0.99 to 0.99, and gamma from the log regression. **Method** selects the function, and only **Iterated** accepts `tol` and `maxiter`. The panel prints neither `result.loglik` nor `result.converged`.

## What the Joint Method Does Well

Rho and gamma are estimated together with all the information the likelihood holds, so that each allows for the other. Under normal errors, maximum likelihood is asymptotically efficient, and gamma avoids the loss that comes with a regression on log squares. A log-likelihood is available too, which allows likelihood-ratio comparisons between nested Z matrices, when each is fitted on the same data. `result.gamma_vcov` comes from the Hessian of the negative log-likelihood at the optimum, computed by automatic differentiation, and gives standard errors for gamma.

## Where the Joint Method Misleads

Efficiency holds only for a correct model, and heavy tails or a wrong Z can move the estimates further than the simpler method moves them. The likelihood can have more than one local maximum, particularly in rho, and L-BFGS reports only the one it reached. A high value of rho pressed against the boundary suggests a problem with the model. Standard errors of beta are conditional on the estimated rho and gamma, and also carry an estimated dispersion, although the model implies a value of 1. They can therefore be too small in short samples.

## What to Compare the Joint Estimates With

**Sequential** gives a benchmark that needs no optimiser. **Iterated** in **Joint** should finish at about the same likelihood as **Two-Step**, so a clear difference in `result.loglik` shows that one of them stopped at a poorer point, and the higher value is preferable. The two functions can also be started on subsamples to see how stable rho and gamma are. **Compare with OLS** sets the coefficients beside the uncorrected ones. A likelihood-ratio statistic against a smaller Z tests whether the extra variance regressors are needed.

## References

<a id="ref-BM1978a"></a>Beach, C. M. and MacKinnon, J. G. (1978). A maximum likelihood procedure for regression with autocorrelated errors. *Econometrica* 46(1), 51. [doi:10.2307/1913644](https://doi.org/10.2307/1913644)

<a id="ref-OK1974a"></a>Oberhofer, W. and Kmenta, J. (1974). A general procedure for obtaining maximum likelihood estimates in generalized regression models. *Econometrica* 42(3), 579. [doi:10.2307/1911792](https://doi.org/10.2307/1911792)

## See Also

- [Sequential Method](sequential.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md)
