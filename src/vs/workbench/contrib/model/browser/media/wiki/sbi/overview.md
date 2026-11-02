# Overview

Many scientific models can generate data but have no likelihood that can be computed in reasonable time. Simulation-based inference fits such models by comparing or learning from simulated data, and the panel uses one form of it: a neural network trained to be the estimator.

## Where Simulation-Based Inference Came From

Approximate Bayesian computation came first. It keeps simulated parameter values whose summary statistics fall close to the observed ones, and [Beaumont, Zhang and Balding (2002)](#ref-BZB2002a) improved that scheme with a regression adjustment of the accepted values. Such methods need hand-chosen summaries, and every new data set needs new simulations. Neural networks changed both limits, as they can learn the summaries and can be reused after training. A survey of how the field moved in that direction is given by [Cranmer, Brehmer and Louppe (2020)](#ref-CBL2020a).

## How a Neural Estimator Replaces the Likelihood

A Bayes estimator minimises the expected loss over the prior and the model. That expectation can be approximated with simulation alone: draw theta from the prior, simulate Z given theta, and score the network's output against theta. Training a network on this average loss gives an approximate Bayes estimator without evaluating any likelihood, an approach set out by [Sainsbury-Dale, Zammit-Mangion and Huser (2024)](#ref-SZH2024a). The result is amortised, so the training cost is paid once and each later data set of the same form needs one forward pass.

## How the Three Simulation-Based Inference Tabs Differ

| Tab | What the network learns | Where uncertainty comes from |
|---|---|---|
| **Point** | The posterior median of each parameter, through the absolute-error loss | A parametric bootstrap with `B = 400`, simulating at the estimate and estimating again |
| **Interval** | Lower and upper bounds, in two networks, with the quantile loss at 0.025 and 0.975 | The bounds themselves |
| **Quantile** | Five posterior quantiles for each parameter | The spread of those quantiles, with 0.05 and 0.95 as 90% bounds |

Each result refers to one parameter at a time, so none of the tabs describes the joint posterior.

## How Architecture Shapes the Summary of the Data

**Architecture** decides how a data set becomes a fixed-length summary.

| Option | Data it suits | How it summarises |
|---|---|---|
| **DeepSet** | Independent replicates | Applies one network to each replicate, pools the results, and maps them to estimates |
| **GNN (Graph Neural Network)** | Irregular spatial locations | Passes messages over a neighbourhood graph, then pools over locations |
| **LSTM** | Ordered sequences | Keeps the final hidden state of a recurrent network |

Pooling makes the **DeepSet** summary ignore the order of replicates, following [Zaheer, Kottur, Ravanbakhsh, Poczos, Salakhutdinov and Smola (2017)](#ref-ZKRPS...2017a). The graph form for spatial data is developed by [Sainsbury-Dale, Zammit-Mangion and Huser (2025)](#ref-SZH2025a), and the recurrent unit comes from [Hochreiter and Schmidhuber (1997)](#ref-HS1997a).

## What a Typical Simulation-Based Inference Workflow Looks Like

1. Replace `sampler` and `simulator` with the prior and model at hand, and set **Parameters (p)** to the new length.
2. Set **Replicates (m)** to the size of the observed data.
3. Name a vector or matrix of observed values in **Data**, then run the code to train the estimator and apply it.
4. Check recovery with **Estimates vs Truth** and **Bias and RMSE**.
5. Check uncertainty with **Interval Coverage**.
6. Compare with a known answer through **vs Maximum Likelihood** if the model has one, editing its formula when the model changes.
7. Use **Estimate New Data** on further data sets of the same form.

Training is usually the slow step, so keep the trained `estimator` in the session and rerun only the steps after it.

## References

<a id="ref-BZB2002a"></a>Beaumont, M. A., Zhang, W. and Balding, D. J. (2002). Approximate Bayesian computation in population genetics. *Genetics* 162(4), 2025–2035. [doi:10.1093/genetics/162.4.2025](https://doi.org/10.1093/genetics/162.4.2025)

<a id="ref-CBL2020a"></a>Cranmer, K., Brehmer, J. and Louppe, G. (2020). The frontier of simulation-based inference. *Proceedings of the National Academy of Sciences* 117(48), 30055–30062. [doi:10.1073/pnas.1912789117](https://doi.org/10.1073/pnas.1912789117)

<a id="ref-HS1997a"></a>Hochreiter, S. and Schmidhuber, J. (1997). Long short-term memory. *Neural Computation* 9(8), 1735–1780. [doi:10.1162/neco.1997.9.8.1735](https://doi.org/10.1162/neco.1997.9.8.1735)

<a id="ref-SZH2024a"></a>Sainsbury-Dale, M., Zammit-Mangion, A. and Huser, R. (2024). Likelihood-free parameter estimation with neural Bayes estimators. *The American Statistician* 78(1), 1–14. [doi:10.1080/00031305.2023.2249522](https://doi.org/10.1080/00031305.2023.2249522)

<a id="ref-SZH2025a"></a>Sainsbury-Dale, M., Zammit-Mangion, A. and Huser, R. (2025). Neural Bayes estimators for irregular spatial data using graph neural networks. *Journal of Computational and Graphical Statistics* 34(3), 1153–1168. [doi:10.1080/10618600.2024.2433671](https://doi.org/10.1080/10618600.2024.2433671)

<a id="ref-ZKRPS...2017a"></a>Zaheer, M., Kottur, S., Ravanbakhsh, S., Poczos, B., Salakhutdinov, R. and Smola, A. (2017). Deep Sets. arXiv:1703.06114. [doi:10.48550/arXiv.1703.06114](https://doi.org/10.48550/arXiv.1703.06114)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
