# Fast Variational Bayesian Inference: Gaussian

The **Gaussian** model infers the mean μ and the precision τ of a batch of independent normal observations, with a mean-field approximation q(μ) q(τ) found by variational message passing.

## The model

```
mu  ~ Normal(mean = 0.0, var = mu_var)
tau ~ Gamma(shape = 1.0, rate = 1.0)
y  .~ Normal(mean = mu, precision = tau)
```

The prior variance of μ, `mu_var`, is 1 in the main code and 0.1 or 100 in **Prior Sensitivity**. The broadcast `.~` gives one likelihood factor per observation, all sharing μ and τ. The simulated data are **N (observations)** draws from a normal with mean 2 and standard deviation 0.5, so the true precision is 4; a comment marks where real data replace them.

[Bishop (2006)](#ref-Bis2006a) treats the same problem, the mean and precision of a univariate Gaussian, as the first worked example of a factorised variational approximation, following MacKay.

## The factorisation

The constraint `q(mu, tau) = q(mu)q(tau)` splits the joint posterior into two independent factors, as its comment says, because μ and τ share the likelihood factor. [Bishop (2006)](#ref-Bis2006a) notes that the true posterior does not factorise in this way.

In his example the prior on μ is conditional on τ, so that the exact posterior is again Gaussian-gamma and can be found in closed form; the factorised version is kept for tutorial purposes. In the panel, the priors on μ and τ are independent. [Bagaev and de Vries (2023)](#ref-BV2023a) call such a split a factorisation constraint, and RxInfer applies it with the `@constraints` macro.

## The updates

[Bishop (2006)](#ref-Bis2006a) derives the optimal factors without assuming their form: q(μ) comes out normal and q(τ) gamma, from the structure of the likelihood and the conjugate priors. Each factor depends on moments of the other: q(μ) on E[τ], and q(τ) on E[μ] and E[μ²].

He describes the solution as cyclic: start from a guess for E[τ], recompute q(μ), take its moments to recompute q(τ), and so on. Variational message passing runs the same alternation on the factor graph, one pass per iteration, for **Iterations** passes. The `@initialization` block gives the starting marginals, Normal(0, variance 1) for μ and Gamma(1, 1) for τ.

## The output

`returnvars` with `KeepEach()` keeps the posteriors of every iteration, and the code prints the mean and standard deviation of the last q(μ) and q(τ). The simulated data have mean 2 and precision 4, the values that the posterior means of μ and τ estimate.

[Bishop (2006)](#ref-Bis2006a) notes that, as N grows, the mean of q(μ) tends to the sample mean and its precision becomes infinite, the maximum likelihood result. For a finite sample, **Prior Sensitivity** shows how much a prior variance of 0.1 or 100 moves the posterior of μ.

## Checking the fit

**Free Energy** plots one value per iteration, from the first to the last of **Iterations**. The RxInfer documentation runs a model of the same form, with a prior precision of 0.1 on μ, and checks its convergence with the same curve.

**VMP vs MCMC** compares the posterior standard deviations of μ and τ with those of NUTS. In the correlated Gaussian of [Bishop (2006)](#ref-Bis2006a), the factorised approximation is too compact; with independent priors and a mean-field posterior, the ratio of standard deviations shows how compact q is for these data.

**Model Comparison** fits the same model with μ fixed at 0 and compares the final free energies. The difference of the two is printed as an approximate log Bayes factor, and the model with the lower value is preferred.

## References

<a id="ref-BV2023a"></a>Bagaev, D., & de Vries, B. (2023). Reactive Message Passing for Scalable Bayesian Inference. *Scientific Programming* 2023, 1-26. [doi:10.1155/2023/6601690](https://doi.org/10.1155/2023/6601690)

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Linear Regression](linear-regression.md) · [Streaming](streaming.md)
