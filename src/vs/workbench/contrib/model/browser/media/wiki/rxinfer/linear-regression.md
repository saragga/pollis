# Fast Variational Bayesian Inference: Linear Regression

The **Linear Regression** model infers the intercept β₀, the slope β₁ and the noise precision τ of a simple linear regression, with one factor per variable in the variational posterior.

## The model

```
beta0 ~ Normal(mean = 0.0, var = b_var)
beta1 ~ Normal(mean = 0.0, var = b_var)
tau   ~ Gamma(shape = 1.0, rate = 1.0)
y[i]  ~ Normal(mean = beta0 + beta1 * x[i], precision = tau)
```

The prior variance of the coefficients, `b_var`, is 100 in the main code and 0.1 or 100 in **Prior Sensitivity**. The covariate x is passed to the model as a fixed input, and only y as data. The simulated data are **N (observations)** standard normal values of x and y = 1.5 + 2.3 x plus normal noise with standard deviation 0.3; comments mark where real covariates and responses replace them.

## The factor graph

Each likelihood takes its mean from a product node, β₁ · xᵢ, and a sum node, β₀ + β₁ xᵢ. The loop over `eachindex(y)` repeats the pair of nodes and the likelihood for every observation, and **Factor Graph** counts the random, data and constant variables and the factor nodes that RxInfer builds.

The comment in the code explains a consequence: β₀ and β₁ meet at every sum node, so the graph has loops. The `@initialization` block therefore gives, besides the starting marginals of β₀, β₁ and τ, a starting message for β₁, written `μ(beta1)`. The RxInfer documentation on initialisation distinguishes the two, `q` for an initial marginal and `μ` for an initial message, and explains that in a loop a message or marginal depends not only on its prior but also on itself, so the loop needs a starting point.

## The factorisation

`MeanField()` gives one factor per variable, q(β₀) q(β₁) q(τ). The comment in the code adds that the mean-field constraint splits the likelihood factor into a factor for its mean and one for τ, while the deterministic sum and product nodes are never split.

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) note that the mean-field family cannot capture correlations between the variables. Here the factors are q(β₀) and q(β₁), so the posterior keeps no correlation between the intercept and the slope; **VMP vs MCMC** compares their spreads with those of NUTS.

## The variational treatment

[Bishop (2006)](#ref-Bis2006a) gives a variational treatment of Bayesian linear regression with the factorisation q(w) q(α), where α is the precision of the prior on the weights, and supposes the noise precision known and fixed at its true value; he adds that the framework is easily extended to include the distribution over the noise precision.

The panel takes the other route: the prior variance of the coefficients is fixed, and the noise precision τ has a gamma prior and its own factor. For each factor, he takes the log of the joint distribution and averages it with respect to the variables not in that factor, the general rule that also gives the panel's three factors.

## The output

The code prints the posterior mean of the intercept and of the slope, and the plug-in noise standard deviation √(1/E[τ]). With the simulated data, those estimate 1.5, 2.3 and 0.3.

**Parameter Posteriors** adds the standard deviations and 95% credible intervals of β₀, β₁ and τ. **Posterior Predictive** draws 20 replicated data sets at the observed x and overlays them on the observations, and **Streaming Forecast** draws the predictive band over 50 new x values.

**Model Comparison** refits with an intercept only and compares the final free energies; the model with the lower one is preferred, and the difference is printed as the approximate log Bayes factor.

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A., & McAuliffe, J. D. (2017). Variational Inference: A Review for Statisticians. *Journal of the American Statistical Association* 112(518), 859-877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gaussian](gaussian.md) · [Streaming](streaming.md)
