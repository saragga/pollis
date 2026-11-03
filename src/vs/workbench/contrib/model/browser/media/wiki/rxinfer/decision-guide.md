# Fast Variational Bayesian Inference: Decision Guide

When to use variational message passing, which of the panel's models to start from, and how to set the iterations and check the fit.

## Variational inference or MCMC

| Situation | Approach | Source |
|---|---|---|
| Large data sets, many models to explore quickly | Variational inference | [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) |
| Smaller data sets, more precise samples worth a heavier computational cost | MCMC | [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) |
| Inference to be repeated as new observations arrive | Reactive message passing on a stream | [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) |
| Models built from conjugate pairs of distributions | Variational message passing with closed-form messages | [Bishop (2006)](#ref-Bis2006a), [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) |

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) add that data set size is not the only consideration: the geometry of the posterior matters too. The panel's bullets list real-time inference, streaming data, large-scale systems, probabilistic signal processing and reactive models as the settings it is suited to.

## Choosing a model

| Data | Model |
|---|---|
| A batch of observations of one quantity, with unknown mean and spread | **Gaussian** |
| A response and one covariate | **Linear Regression** |
| Observations arriving one at a time, with the posterior updated after each | **Streaming** |

Each model is a template: the comments in the code mark where real data replace the simulated ones, and the priors can be changed in the `@model` block.

## Conjugacy and closed-form messages

[Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) explain that RxInfer derives its speed from statistical independencies and conjugate pairings of variables in the factor graph, and that closed-form message computation rules are very often available for specific nodes and node combinations. [Bishop (2006)](#ref-Bis2006a) shows that for conjugate-exponential models, the variational update of each factor depends only on its Markov blanket, a local calculation on the graph.

The panel's models are of this kind: normal likelihoods with normal priors on the location and gamma priors on the precision. RxInfer also supports, among others, belief propagation, expectation propagation, expectation maximisation and conjugate-computation variational inference, as [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) list.

## Iterations

**Iterations**, 50 by default, should be enough for the free energy to flatten; **Free Energy** and **Convergence Check** show whether it has. The RxInfer documentation finds that, for the Gaussian model, a handful of iterations reach a stable point.

For **Streaming**, **Iterations** is the number of passes per observation, and each update starts from the previous posterior. **Free Energy** then shows one value per observation, taken at the last of those passes, rather than one per iteration.

## Checking the fit

| Question | Action |
|---|---|
| Has the free energy settled? | **Free Energy**, **Convergence Check** |
| Does the prior drive the result? | **Prior Sensitivity** |
| Does the model reproduce the data? | **Posterior Predictive** |
| How much does mean field understate the spread? | **VMP vs MCMC** |
| Does a simpler model explain the data as well? | **Model Comparison** |

## Factorisation and accuracy

[Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) describe a customised trade-off between accuracy and speed: for each node and edge of the graph, the constraints on the variational family can be specified, so that different inference methods run in different parts of the model. [Bagaev and de Vries (2023)](#ref-BV2023a) distinguish form constraints, which fix the parametric form of the posterior or its marginals, from factorisation constraints, which add conditional independence assumptions.

The panel uses the mean-field factorisation throughout. [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) describe richer families that model dependencies between the latent variables, structured variational inference among them; RxInfer supports structured variational message passing, as [Bagaev, Podusenko and de Vries (2023)](#ref-BPV2023a) list.

## Further reading

[Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) review variational inference for statisticians, with coordinate ascent, exponential families, stochastic variational inference and open questions. [Bishop (2006)](#ref-Bis2006a), chapter 10, covers variational inference, the univariate Gaussian, the variational mixture of Gaussians, variational linear regression and variational message passing.

The examples of RxInfer, listed among the panel's notebooks, extend the same tools to hidden Markov models, Kalman filtering, mixtures, autoregressive models and active inference. [Koller and Friedman (2009)](#ref-KF2009a) give the wider theory of graphical models.

## References

<a id="ref-BV2023a"></a>Bagaev, D., & de Vries, B. (2023). Reactive Message Passing for Scalable Bayesian Inference. *Scientific Programming* 2023, 1-26. [doi:10.1155/2023/6601690](https://doi.org/10.1155/2023/6601690)

<a id="ref-BPV2023a"></a>Bagaev, D., Podusenko, A., & de Vries, B. (2023). RxInfer: A Julia Package for Reactive Real-Time Bayesian Inference. *Journal of Open Source Software* 8(84), 5161. [doi:10.21105/joss.05161](https://doi.org/10.21105/joss.05161)

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A., & McAuliffe, J. D. (2017). Variational Inference: A Review for Statisticians. *Journal of the American Statistical Association* 112(518), 859-877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

<a id="ref-KF2009a"></a>Koller, D., & Friedman, N. (2009). *Probabilistic Graphical Models: Principles and Techniques*. MIT Press. [mitpress.mit.edu](https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Gaussian](gaussian.md) · [Linear Regression](linear-regression.md) · [Streaming](streaming.md)
