# Fast Variational Bayesian Inference: Interpretation

How to read the outputs: the posterior marginals and their intervals, the predictions, the comparison with MCMC, and the comparison of models by free energy.

## Posterior marginals

The result of `infer` holds one variational posterior for every latent variable: a normal distribution for μ, β₀ and β₁, and a gamma distribution for τ. With `KeepEach()`, the batch models keep the posterior of every iteration, and the code takes the last one; **Streaming** keeps the posterior after each observation, and the code takes the one after the last.

**Posterior Marginals** plots each density over its mean ± 4 standard deviations, cut at a small positive value for the precision τ. The marginals are the factors of the mean-field family, so the plot shows each variable on its own; the family itself, as [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) note, captures any marginal density but not the correlations between the variables.

## Means, spreads and intervals

**Parameter Posteriors** prints, for every latent variable, the posterior mean, the standard deviation and a 95% credible interval from the 2.5% and 97.5% quantiles of 10 000 draws from the variational posterior.

The intervals are those of the approximation q. [Bishop (2006)](#ref-Bis2006a) shows that a factorised approximation tends to be too compact, and [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) that variational inference generally underestimates the posterior variance, so the intervals can be narrower than those of the exact posterior; **VMP vs MCMC** shows by how much on the current data.

## The precision and the noise

τ is a precision, the inverse of a variance. **Linear Regression** prints the plug-in noise standard deviation 1/√E[τ], computed from the posterior mean of τ; the other models print the mean and standard deviation of τ itself.

In the univariate Gaussian example of [Bishop (2006)](#ref-Bis2006a), with broad, noninformative priors, the variational solution gives 1/E[τ] equal to the unbiased estimator of the variance, Σ(xₙ − x̄)²/(N − 1). The panel's priors are proper, Normal(0, 1) on μ and Gamma(1, 1) on τ, and independent of each other.

## Predictions

**Streaming Forecast** draws μ and τ from the final posterior, then an observation, 2 000 times for each of the next 20 steps, and plots the median and the 95% predictive interval beside the observed series. The model has no dynamics, so every future step has the same predictive distribution.

For **Linear Regression**, the same action draws β₀, β₁ and τ and an observation at 50 new x values across the range of the data, and plots the predictive median and the 95% band. The band combines the uncertainty of the coefficients with the noise.

## VMP against MCMC

**VMP vs MCMC** fits the same model with the same priors and data by NUTS in Turing, 2 000 draws, and prints the posterior means and standard deviations of both, with the ratio of the standard deviations, VMP over MCMC. For **Streaming**, the MCMC posterior is the batch posterior on the whole stream.

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) describe MCMC as providing guarantees of asymptotically exact samples, and variational inference as finding a density close to the target. A ratio less than 1 is the understatement of the posterior spread that the action's description mentions. In his correlated Gaussian example, [Bishop (2006)](#ref-Bis2006a) finds that the factorised approximation captures the mean correctly while its variance is too small.

## Comparing models by free energy

**Model Comparison** fits a simpler model to the same data, with the mean fixed at 0 for **Gaussian** and **Streaming**, or with an intercept only for **Linear Regression**, and compares the final free energies. The lower one wins, and the difference is printed as an approximate log Bayes factor. For **Streaming**, the free energies of the observations are summed over the stream.

[Bishop (2006)](#ref-Bis2006a) derives the variational posterior over models, q(m) ∝ p(m) exp{Lₘ}, from the lower bounds of the models, and notes that the normalised values of q(m) can be used for model selection or model averaging in the usual way.

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A., & McAuliffe, J. D. (2017). Variational Inference: A Review for Statisticians. *Journal of the American Statistical Association* 112(518), 859-877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Gaussian](gaussian.md) · [Linear Regression](linear-regression.md) · [Streaming](streaming.md)
