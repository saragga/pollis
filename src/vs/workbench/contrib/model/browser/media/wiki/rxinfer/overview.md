# Fast Variational Bayesian Inference: Overview

Variational inference replaces the exact posterior of a Bayesian model with the closest member of a simpler family, found by optimisation. The panel runs it with RxInfer, by message passing on a factor graph, for a Gaussian, a linear regression and a stream of observations.

## Inference as optimisation

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) describe variational inference as a method from machine learning that approximates probability densities through optimisation: one posits a family of densities and finds the member of that family closest to the target, the posterior, with closeness measured by the Kullback-Leibler divergence.

Since the divergence cannot be computed, one maximises the evidence lower bound

ELBO(q) = E[log p(z, x)] − E[log q(z)],

which equals log p(x) minus the divergence from q to the posterior, and so is a lower bound on the log evidence. [Bagaev and de Vries (2023)](#ref-BV2023a) write the variational free energy as F[q] = KL[q(s) ‖ p(s ∣ y)] − log p(y), the negative of the ELBO, so maximising the one and minimising the other are the same task. RxInfer reports the Bethe free energy, as its documentation calls it, at every iteration.

## Approximate rather than exact

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) compare the two families of methods: Markov chain Monte Carlo samples a Markov chain and provides guarantees of producing asymptotically exact samples from the target, while variational inference can only find a density close to the target but tends to be faster. The panel's bullets make the same contrast: an approximate posterior distribution rather than asymptotically exact samples.

They suggest variational inference for large data sets and for scenarios in which many models are explored quickly, and MCMC for smaller data sets where a heavier computational cost is paid for more precise samples. **VMP vs MCMC** sets the two side by side on the panel's models.

## Factor graphs and message passing

[Bishop (2006)](#ref-Bis2006a) introduces factor graphs as graphs with nodes for the variables and additional nodes for the factors of the joint distribution, making its factorisation explicit. For models built from conjugate-exponential distributions, he shows that the variational update of each factor is a local calculation on the graph, which can be cast as variational message passing.

[Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) present RxInfer as a Julia package for real-time variational Bayesian inference based on reactive message passing in a factor graph representation of the model. Its model specification language translates a textual description of a probabilistic model into the corresponding factor graph. **Factor Graph** counts the nodes of the graph that RxInfer builds for the current model.

## Reactive message passing

[Bagaev and de Vries (2023)](#ref-BV2023a) introduce reactive message passing as a framework for executing schedule-free, scalable message passing-based inference in a factor graph, based on the reactive programming style, which only describes how nodes react to changes in connected nodes. Its implementation is ReactiveMP, by [Bagaev and de Vries (2022)](#ref-BV2022a), which minimises a constrained Bethe free energy and supports exact and variational inference with factorisation and form constraints on the variational family.

[Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) add that the reactive implementation supports by design the processing of infinite asynchronous data streams: the inference engine reacts to new data and automatically updates the relevant posteriors. The **Streaming** model uses this, carrying each posterior forward as the prior of the next observation.

## Three models

| Model | What is inferred |
|---|---|
| **Gaussian** | The mean μ and the precision τ of independent normal observations |
| **Linear Regression** | The intercept β₀, the slope β₁ and the noise precision τ |
| **Streaming** | μ and τ again, updated after every observation |

[Bishop (2006)](#ref-Bis2006a) works through the variational treatment of the mean and precision of a univariate Gaussian, and of Bayesian linear regression, in chapter 10; the panel's models follow the same structure with their own priors.

## The panel in Julia

Each model is written with RxInfer's `@model` macro, its factorisation with `@constraints` or `MeanField()`, and its starting marginals with `@initialization`. A call to `infer` runs the iterations and returns the posteriors and, with `free_energy = true`, the free energy. For **Streaming**, the same call takes an `@autoupdates` block as well, which carries the posteriors forward from one observation to the next.

[Koller and Friedman (2009)](#ref-KF2009a) give the general theory of probabilistic graphical models on which factor graphs and message passing rest.

## References

<a id="ref-BV2023a"></a>Bagaev, D., & de Vries, B. (2023). Reactive Message Passing for Scalable Bayesian Inference. *Scientific Programming* 2023, 1-26. [doi:10.1155/2023/6601690](https://doi.org/10.1155/2023/6601690)

<a id="ref-BPV2023a"></a>Bagaev, D., Podusenko, A., & de Vries, B. (2023). RxInfer: A Julia Package for Reactive Real-Time Bayesian Inference. *Journal of Open Source Software* 8(84), 5161. [doi:10.21105/joss.05161](https://doi.org/10.21105/joss.05161)

<a id="ref-BV2022a"></a>Bagaev, D., & de Vries, B. (2022). ReactiveMP.jl: A Julia Package for Reactive Message Passing-based Bayesian Inference. *JuliaCon Proceedings* 1(1), 91. [doi:10.21105/jcon.00091](https://doi.org/10.21105/jcon.00091)

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A., & McAuliffe, J. D. (2017). Variational Inference: A Review for Statisticians. *Journal of the American Statistical Association* 112(518), 859-877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

<a id="ref-KF2009a"></a>Koller, D., & Friedman, N. (2009). *Probabilistic Graphical Models: Principles and Techniques*. MIT Press. [mitpress.mit.edu](https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Gaussian](gaussian.md) · [Linear Regression](linear-regression.md) · [Streaming](streaming.md)
