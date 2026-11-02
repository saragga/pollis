# Overview

A probabilistic programme states a model in code, and an inference engine works out what the data imply about its unknowns. The panel defines models with `@model` from `RxInfer.jl`, and it infers by passing messages across a factor graph.

## What Message Passing Does

A joint distribution that splits into many small factors can be drawn as a graph, with one node per factor and edges for shared variables. Inference then becomes local: each node sends summaries to its neighbours, and a marginal is the product of the messages reaching a variable. [Kschischang, Frey and Loeliger (2001)](#ref-KFL2001a) gave the general form. Because each step touches few variables, the cost grows with the size of the graph rather than exponentially, and the work can be reused in real-time settings, which is the aim of [Dmitry Bagaev, Albert Podusenko and Bert de Vries (2023)](#ref-BV2023c).

## How the Three Tabs Differ

| Tab | Model | Message rule | Result |
|---|---|---|---|
| **Belief Propagation** | Gaussian mean, known variance | Sum-product | Exact |
| **Variational Message Passing** | Gaussian mean and precision | Mean-field | Approximate, too narrow |
| **Expectation Propagation** | Random-walk trend, binary outcomes | Moment matching | Approximate, Gaussian |

All three use one call, `infer`, which needs the model, the data, and any constraints or starting marginals. What changes is the structure of the model, and that decides the algorithm.

## How Models Are Written

A model is a function with `~` statements:

- `mu ~ Normal(mean = 0.0, variance = 10.0)`
- `y .~ Normal(mean = mu, variance = s2)`

Distributions take keyword arguments, and so a precision or a variance is explicit. `.~` broadcasts over the data. **Model Name** and **Data Variable** only set names. Each tab first fills its data variable with synthetic draws, and that line can be replaced by your own observations.

## What the Free Energy Measures

The panel reports a free energy F, which measures how well an approximate posterior q fits the model:

- F = KL(q ‖ posterior) − log p(y)

Since the KL term is never negative, F is an upper limit on −log p(y). Lower is better, and on a tree, F reaches −log p(y) exactly. It serves both as an objective for an approximate method, and as a score for comparing models on the same data.

## A Common Workflow for a New Model

1. Write the model, and start from a tab with the same structure.
2. Read **Prior Predictive**, to see if the priors are sensible.
3. Run the inference, and look at **Free Energy** and **Convergence Check**.
4. Read **Posterior Summary** and **Credible Interval**.
5. Test accuracy with **Approximate vs Exact**.
6. Use **Posterior Predictive** to compare with the data.

Replace the synthetic line only once the model runs on it.

## References

<a id="ref-BV2023c"></a>Bagaev, D., Podusenko, A. and de Vries, B. (2023). RxInfer: A Julia package for reactive real-time Bayesian inference. *Journal of Open Source Software* 8(84), 5161. [doi:10.21105/joss.05161](https://doi.org/10.21105/joss.05161)

<a id="ref-KFL2001a"></a>Kschischang, F. R., Frey, B. J. and Loeliger, H.-A. (2001). Factor graphs and the sum-product algorithm. *IEEE Transactions on Information Theory* 47(2), 498–519. [doi:10.1109/18.910572](https://doi.org/10.1109/18.910572)

## See Also

- [Factsheet](factsheet.md) · [Belief Propagation](bp.md) · [Variational Message Passing](vmp.md) · [Expectation Propagation](ep.md)
