# Overview

Many models are easy to write as a likelihood and tiresome to differentiate by hand. The panel shows how to obtain exact gradients from the code of the likelihood itself, and how to use them to fit a model.

## Why Differentiate a Log-Likelihood Automatically

A maximum likelihood fit needs a gradient, or the optimiser falls back on slow and noisy approximations. Hand-derived gradients are exact and error-prone, and need rewriting whenever the model changes. Automatic differentiation reads the program and applies the chain rule to each operation, so that a change in the model updates the gradient too. [Baydin, Pearlmutter, Radul and Siskind (2018)](#ref-BPRS2018a) survey the technique. The panel's point is the recipe: write the negative log-likelihood, choose a backend, and pass both to an optimiser.

## How the Three Tabs of the AD Log-Likelihood Panel Differ

**Distribution** fits the parameters of one of five families to a vector. **Linear Regression** fits coefficients and a noise level under normal errors. **Logistic Regression** fits log-odds coefficients to a binary response. All three define `nll` and `negloglik`, choose the gradient `grad!`, and call `optimize` with `LBFGS()`. Linear and logistic models have standard routines, so the regression tabs serve mainly as checks that the recipe reproduces a known answer. The value of the recipe lies with a likelihood for which no routine exists.

## How the Two Backends in the Panel Compare

**AD Backend** chooses between `Enzyme.jl`, which works in reverse mode, and `ForwardDiff.jl`, which works in forward mode. Each gives the same gradient up to rounding, and **Enzyme Against ForwardDiff** checks that and times both. Forward mode costs about one pass per parameter, and reverse mode costs a small multiple of one pass whatever the number of parameters. For the few parameters in the panel, either is quick. The difference grows with the number of parameters, which is when the choice begins to matter.

## Where the Same Gradient Goes Beyond Optimisation

A differentiable log-density also drives gradient-based sampling. Hamiltonian Monte Carlo uses the gradient to propose distant moves, and [Hoffman and Gelman (2014)](#ref-HG2014a) describe its No-U-Turn form. The language of [Ge, Xu and Ghahramani (2018)](#ref-GXG2018a) relies on such gradients, and `DistributionsAD.jl` belongs to the same family of tools. The panel stops at the maximum likelihood point. For a full posterior, the same log-density needs a prior added, and sampling replaces the optimiser.

## A Common Workflow for an AD Likelihood Fit

1. Run a tab on simulated data, where the true values are known.
2. Use **AD Against Finite Differences** to check the gradient.
3. Use **Convergence** to confirm that L-BFGS finished.
4. Use **Against a Reference Fit** where a standard routine exists.
5. Use **Likelihood Slices** and **Estimates With Standard Errors** to judge identification.
6. Use **Fit Against Data** and **Replicated Data** to judge the model.
7. Replace `nll` with the likelihood of interest.

## References

<a id="ref-BPRS2018a"></a>Baydin, A. G., Pearlmutter, B. A., Radul, A. A. and Siskind, J. M. (2018). Automatic differentiation in machine learning: a survey. *Journal of Machine Learning Research* 18(153), 1–43. [jmlr.org/papers/v18/17-468](https://jmlr.org/papers/v18/17-468.html)

<a id="ref-GXG2018a"></a>Ge, H., Xu, K. and Ghahramani, Z. (2018). Turing: a language for flexible probabilistic inference. *AISTATS*. [proceedings.mlr.press/v84/ge18b](http://proceedings.mlr.press/v84/ge18b.html)

<a id="ref-HG2014a"></a>Hoffman, M. D. and Gelman, A. (2014). The No-U-Turn Sampler: adaptively setting path lengths in Hamiltonian Monte Carlo. *Journal of Machine Learning Research* 15. [jmlr.org/papers/v15/hoffman14a](https://jmlr.org/papers/v15/hoffman14a.html)

## See Also

- [Factsheet](factsheet.md) · [Automatic Differentiation](autodiff.md) · [Enzyme Backend](enzyme.md) · [ForwardDiff Backend](forwarddiff.md) · [Distribution Estimation](distribution-estimation.md)
