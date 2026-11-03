# Fast Variational Bayesian Inference: Assumptions

What the panel's models assume about the data, what the variational family assumes about the posterior, and what the free energy assumes when it is used to compare models.

## Independent observations

In the **Gaussian** model, the observations are independent draws from one normal distribution with unknown mean μ and precision τ; in **Linear Regression**, each yᵢ is normal around β₀ + β₁ xᵢ with a common precision τ. [Bishop (2006)](#ref-Bis2006a) states the same assumption for the univariate Gaussian example: the observed values are drawn independently from the Gaussian.

The **Streaming** model assumes the same for a stream: every new observation comes from the same Normal(μ, precision τ), and the posterior after t observations becomes the prior for observation t + 1. [Bishop (2006)](#ref-Bis2006a) explains that this sequential view of Bayesian inference applies to any problem in which the observed data are independent and identically distributed.

## Priors

| Model | Prior on the location | Prior on the precision |
|---|---|---|
| **Gaussian** | μ ~ Normal(0, variance 1) | τ ~ Gamma(shape 1, rate 1) |
| **Linear Regression** | β₀, β₁ ~ Normal(0, variance 100) | τ ~ Gamma(shape 1, rate 1) |
| **Streaming** | μ ~ Normal(0, variance 1) at the start | τ ~ Gamma(shape 1, rate 1) at the start |

The priors on μ and τ are independent. In the example of [Bishop (2006)](#ref-Bis2006a), the prior on μ is conditional on τ, Normal(μ₀, (λ₀τ)⁻¹), which makes it conjugate to the likelihood. **Prior Sensitivity** refits with prior variances of 0.1 and 100 on the mean or the coefficients.

## The mean-field family

The panel's variational family factorises the posterior into independent factors, q(μ, τ) = q(μ) q(τ), or one factor per variable for the regression. [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) describe the mean-field family as one in which the latent variables are mutually independent and each governed by a distinct factor, and note that such a family cannot capture correlations between the variables.

[Bagaev and de Vries (2023)](#ref-BV2023a) call this a factorisation constraint: it introduces conditional independence assumptions that are not present in the generative model. For the Gaussian model, the RxInfer documentation explains why one is needed at all: μ and τ meet at the likelihood factor of every observation, so the model contains loops, and either the messages are initialised for loopy belief propagation or the loops are broken by variational constraints.

## Compact approximations

[Bishop (2006)](#ref-Bis2006a) shows on a correlated Gaussian that a factorised approximation captures the mean correctly but underestimates the variance in the direction orthogonal to the one of smallest variance, and states that it is a general result that a factorised variational approximation tends to give approximations to the posterior that are too compact.

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) write that variational inference generally underestimates the variance of the posterior density, as a consequence of its objective function, and that, depending on the task at hand, this may be acceptable. The description of **VMP vs MCMC** says the same, with a ratio of standard deviations less than 1 as the sign.

## Initialisation and local optima

The iterations start from the marginals given with `@initialization`. [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) note that the ELBO is generally not convex, and that coordinate ascent only guarantees convergence to a local optimum, which can be sensitive to the initialisation.

For **Linear Regression**, the code also gives a starting message for β₁, since β₀ and β₁ meet at every + node and the graph has loops, as its comment explains.

## Free energy as model evidence

**Model Comparison** prefers the model with the lower final free energy and reports the difference as an approximate log Bayes factor. [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) explain that the relation between the ELBO and log p(x) has led to the use of the bound as a model selection criterion, on the premise that the bound is a good approximation of the marginal likelihood.

[Bishop (2006)](#ref-Bis2006a) derives the variational treatment of model comparison: with a variational posterior over models, q(m) ∝ p(m) exp{Lₘ}, where Lₘ is the lower bound of model m. With equal prior probabilities, the ratio of q for two models is the exponential of the difference of their bounds.

## References

<a id="ref-BV2023a"></a>Bagaev, D., & de Vries, B. (2023). Reactive Message Passing for Scalable Bayesian Inference. *Scientific Programming* 2023, 1-26. [doi:10.1155/2023/6601690](https://doi.org/10.1155/2023/6601690)

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A., & McAuliffe, J. D. (2017). Variational Inference: A Review for Statisticians. *Journal of the American Statistical Association* 112(518), 859-877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gaussian](gaussian.md) · [Linear Regression](linear-regression.md) · [Streaming](streaming.md)
