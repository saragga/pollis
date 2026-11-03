# Fast Variational Bayesian Inference: Streaming

The **Streaming** model processes observations one at a time: after each one, the posteriors of μ and τ become the priors for the next, as RxInfer's reactive engine updates them.

## The model

```
mu  ~ Normal(mean = mu_mean, var = mu_var)
tau ~ Gamma(shape = tau_shape, rate = tau_rate)
y   ~ Normal(mean = mu, precision = tau)
```

The model holds a single observation y. Its priors take their parameters, `mu_mean`, `mu_var`, `tau_shape` and `tau_rate`, from the previous posteriors. The constraint `q(mu, tau) = q(mu)q(tau)` gives the same mean-field split as in **Gaussian**, with the same starting marginals, Normal(0, variance 1) and Gamma(1, 1).

The RxInfer documentation uses a model of the same form, with the same four parameters carried forward, to show how the free energy buffers differ when variational iterations are run on a stream.

## Autoupdates

The `@autoupdates` block sets the parameters of the next priors from the current posteriors: the mean and variance of q(μ), and the shape and rate of q(τ). The RxInfer documentation explains that the macro updates the parameters automatically as soon as a new posterior is available, and that `@initialization` is needed so that the parameters are defined before the first observation arrives.

[Bishop (2006)](#ref-Bis2006a) describes the sequential view of Bayesian inference: the posterior after the observations seen so far acts as the prior for the next. In the panel, the carried posterior is the mean-field approximation, so each step passes on q(μ) and q(τ) as independent priors.

## Static data as a stream

`infer` receives the observations with `data = (y = stream,)`. The RxInfer documentation explains that the streaming version also supports static data sets: internally, it converts them to a data stream that emits all observations in sequential order without any delay. A real-time application would pass a `datastream` instead, built for example with Rocket.jl, as the documentation shows.

The simulated stream is **N (observations)** draws from a normal with mean 2 and standard deviation 1; a comment marks where a real stream replaces them.

## Iterations per observation

**Iterations** sets the variational iterations for every observation: the alternation between q(μ) and q(τ) runs that many times before the posteriors are passed on. [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) describe the inference engine as reacting to new data and automatically updating the relevant posteriors, and [Bagaev and de Vries (2023)](#ref-BV2023a) the reactive message passing behind it as schedule-free, with nodes reacting to changes in connected nodes.

`historyvars` with `KeepLast()` keeps only the posterior of the final iteration for each observation, and `keephistory`, set to **N (observations)**, is the length of the circular buffer that holds them; the documentation notes that only the last entries, up to that length, are saved.

## The history

`result.history` holds the posteriors of μ and τ after each observation, and the code prints the mean and standard deviation of the last ones. **Parameter Posteriors** and **Posterior Marginals** use the final posterior.

The documentation describes two free energy histories: `free_energy_history`, averaged across variational iterations for all observations, and `free_energy_final_only_history`, the value at the final iteration for each data event. **Free Energy** plots the second, one point per observation; **Convergence Check** reads the first, one value per iteration; **Model Comparison** sums the second over the stream.

## Against the batch posterior

**VMP vs MCMC** compares the final streaming posterior with NUTS on the whole stream, so it sets the sequence of mean-field updates beside the batch posterior that NUTS samples. **Streaming Forecast** draws from the final posterior the next 20 observations, with a 95% predictive interval.

[Bagaev and de Vries (2022)](#ref-BV2022a) list, among the processing modes of ReactiveMP, offline learning and the filtering of infinite data streams, and mention the processing of data samples that arrive at irregular time intervals. [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) add that RxInfer is not limited to real-time processing and also scales to batch processing of large data sets. The panel's notebooks include an RxInfer example on an infinite data stream.

## References

<a id="ref-BV2022a"></a>Bagaev, D., & de Vries, B. (2022). ReactiveMP.jl: A Julia Package for Reactive Message Passing-based Bayesian Inference. *JuliaCon Proceedings* 1(1), 91. [doi:10.21105/jcon.00091](https://doi.org/10.21105/jcon.00091)

<a id="ref-BPV2023a"></a>Bagaev, D., Podusenko, A., & de Vries, B. (2023). RxInfer: A Julia Package for Reactive Real-Time Bayesian Inference. *Journal of Open Source Software* 8(84), 5161. [doi:10.21105/joss.05161](https://doi.org/10.21105/joss.05161)

<a id="ref-BV2023a"></a>Bagaev, D., & de Vries, B. (2023). Reactive Message Passing for Scalable Bayesian Inference. *Scientific Programming* 2023, 1-26. [doi:10.1155/2023/6601690](https://doi.org/10.1155/2023/6601690)

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gaussian](gaussian.md) · [Linear Regression](linear-regression.md)
