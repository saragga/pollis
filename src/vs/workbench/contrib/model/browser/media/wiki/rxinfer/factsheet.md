# Fast Variational Bayesian Inference: Factsheet

The panel's models, inference settings, inputs, outputs and sources at a glance.

## Models

| Model | Likelihood | Priors | Data in the code |
|---|---|---|---|
| **Gaussian** | yᵢ ~ Normal(μ, precision τ) | μ ~ Normal(0, variance 1); τ ~ Gamma(shape 1, rate 1) | N draws from Normal(2, 0.5) |
| **Linear Regression** | yᵢ ~ Normal(β₀ + β₁ xᵢ, precision τ) | β₀, β₁ ~ Normal(0, variance 100); τ ~ Gamma(shape 1, rate 1) | xᵢ standard normal, yᵢ = 1.5 + 2.3 xᵢ + 0.3 εᵢ |
| **Streaming** | yₜ ~ Normal(μ, precision τ), one observation per update | The previous posteriors of μ and τ | N draws from Normal(2, 1) |

The data are simulated; the comments in the code mark where real data go.

## Inference

| Item | Setting |
|---|---|
| Package | RxInfer, by [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a), with message passing from ReactiveMP, by [Bagaev and de Vries (2022)](#ref-BV2022a) |
| Method | Variational message passing on a factor graph |
| Factorisation | Mean field: q(μ, τ) = q(μ) q(τ) for **Gaussian** and **Streaming**; `MeanField()` for **Linear Regression** |
| Initial marginals | q(μ) = Normal(0, 1), q(τ) = Gamma(1, 1); for regression q(β₀) = q(β₁) = Normal(0, 100) and a starting message for β₁ |
| Iterations | **Iterations**, for the whole data set, or per observation for **Streaming** |
| Free energy | Recorded at every iteration, or after every observation for **Streaming** |

## Inputs

| Input | Default | Meaning |
|---|---|---|
| **N (observations)** | 100 | Number of data points, or length of the stream |
| **Iterations** | 50 | Number of variational message passing iterations |

For **Gaussian** and **Linear Regression**, **N (observations)** is the size of the simulated batch; for **Streaming**, it is the number of observations processed one after the other and the length of the history kept. **Iterations** applies to the whole batch, or to each observation of the stream.

## Outputs

| Model | Printed output |
|---|---|
| **Gaussian** | Posterior mean and standard deviation of μ and of τ, at the final iteration |
| **Linear Regression** | Posterior means of the intercept and the slope, and the plug-in noise standard deviation 1/√E[τ] |
| **Streaming** | Posterior mean and standard deviation of μ and τ after the last observation |

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Posterior Marginals**, **Free Energy** | Density of each posterior; free energy over iterations or observations |
| Diagnose | **Convergence Check**, **Prior Sensitivity** | Changes over the last five iterations; posteriors under prior variances 0.1 and 100 |
| Predict | **Posterior Predictive**, **Streaming Forecast** | Replicated data against observed; 95% predictive interval for the next 20 points, or a band over new x |
| Compare | **VMP vs MCMC**, **Model Comparison** | Means and standard deviations against NUTS in Turing; free energy against a simpler model |
| Interpret | **Parameter Posteriors**, **Factor Graph** | Mean, standard deviation and 95% interval; counts of variable and factor nodes |

## Further reading

| Topic | Source |
|---|---|
| RxInfer and reactive real-time inference | [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) |
| Reactive message passing and ReactiveMP | [Bagaev and de Vries (2023)](#ref-BV2023a), [Bagaev and de Vries (2022)](#ref-BV2022a) |
| Variational inference for statisticians | [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) |
| Variational inference, the univariate Gaussian example and variational message passing | [Bishop (2006)](#ref-Bis2006a), chapter 10 |
| Probabilistic graphical models | [Koller and Friedman (2009)](#ref-KF2009a) |

## References

<a id="ref-BV2023a"></a>Bagaev, D., & de Vries, B. (2023). Reactive Message Passing for Scalable Bayesian Inference. *Scientific Programming* 2023, 1-26. [doi:10.1155/2023/6601690](https://doi.org/10.1155/2023/6601690)

<a id="ref-BPV2023a"></a>Bagaev, D., Podusenko, A., & de Vries, B. (2023). RxInfer: A Julia Package for Reactive Real-Time Bayesian Inference. *Journal of Open Source Software* 8(84), 5161. [doi:10.21105/joss.05161](https://doi.org/10.21105/joss.05161)

<a id="ref-BV2022a"></a>Bagaev, D., & de Vries, B. (2022). ReactiveMP.jl: A Julia Package for Reactive Message Passing-based Bayesian Inference. *JuliaCon Proceedings* 1(1), 91. [doi:10.21105/jcon.00091](https://doi.org/10.21105/jcon.00091)

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A., & McAuliffe, J. D. (2017). Variational Inference: A Review for Statisticians. *Journal of the American Statistical Association* 112(518), 859-877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

<a id="ref-KF2009a"></a>Koller, D., & Friedman, N. (2009). *Probabilistic Graphical Models: Principles and Techniques*. MIT Press. [mitpress.mit.edu](https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gaussian](gaussian.md) · [Linear Regression](linear-regression.md) · [Streaming](streaming.md)
