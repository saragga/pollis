# Fast Variational Bayesian Inference: Diagnostics

How to check a variational fit: the free energy, the changes between iterations, the sensitivity to the prior, and the fit to the data.

## The free energy

**Free Energy** plots the free energy against the iteration for **Gaussian** and **Linear Regression**, and against the observation for **Streaming**, where each point is the value at the final iteration of that update. As its description says, for the batch models the curve should fall and flatten.

[Bishop (2006)](#ref-Bis2006a) recommends monitoring the bound during re-estimation to test for convergence, and adds that it provides a check on both the update equations and their software implementation, because at each step of the iterative procedure the bound should not decrease. The free energy is the negative of the bound, so it should not increase. The RxInfer documentation uses the same plot to verify convergence, and notes that `infer` computes the free energy only when `free_energy = true`.

## Convergence Check

**Convergence Check** prints, for the batch models:

| Quantity | Meaning |
|---|---|
| Max change in mean over the last 5 iterations | For every latent variable, the largest change of its posterior mean between consecutive iterations |
| Free energy change over the last 5 iterations | The largest change of the free energy between consecutive iterations |
| Free energy never increased | Whether every step lowered the free energy or left it unchanged, within 10⁻⁸ |

As its description says, the iterations have converged when both changes are near zero. For **Streaming**, the free energy is the history averaged over observations, one value per iteration.

## Iterations

**Iterations** sets the number of passes, 50 by default. When the free energy is flat well before the last iteration, fewer iterations give the same posterior; when it is still falling, more are needed. The RxInfer documentation shows the same reasoning on the Gaussian model, where the free energy settles after a few iterations and 5 iterations suffice.

On the **Streaming** tab, **Iterations** applies to every observation, so the total work grows with **N (observations)** × **Iterations**.

## The prior

**Prior Sensitivity** refits the model with a narrow prior, variance 0.1, and a wide one, variance 100, on μ for **Gaussian**, on the coefficients for **Linear Regression**, or on the initial μ for **Streaming**, and prints the posterior mean and standard deviation of μ or β₁ under each.

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) decompose the ELBO into the expected log likelihood minus the divergence between q and the prior, and describe the objective as mirroring the usual balance between likelihood and prior. Posteriors that barely move between the two priors are dominated by the data; posteriors that move are shaped by the prior.

## The initialisation

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) warn that coordinate ascent can reach different local optima from different initialisations, and illustrate it with ten random initialisations of a mixture model. The panel's models start from the marginals of `@initialization`; changing them in the code and rerunning shows whether the fit depends on the start.

**Factor Graph** reports the numbers of random, data and constant variables and of factor nodes, which is a check that the model was built as intended.

## Fit to the data

**Posterior Predictive** draws replicated data from the posterior predictive distribution and overlays their histogram on that of the observations: 1 000 draws for **Gaussian** and **Streaming**, and 20 replicated data sets at the observed x for **Linear Regression**. Each draw takes μ, or β₀ and β₁, and τ from their posteriors and then an observation from the likelihood.

A predictive histogram much wider or narrower than the data, or shifted from them, points to a model, a prior or a factorisation that does not match the data.

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A., & McAuliffe, J. D. (2017). Variational Inference: A Review for Statisticians. *Journal of the American Statistical Association* 112(518), 859-877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gaussian](gaussian.md) · [Linear Regression](linear-regression.md) · [Streaming](streaming.md)
