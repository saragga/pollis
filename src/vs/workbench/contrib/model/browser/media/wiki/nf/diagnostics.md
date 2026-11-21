# Diagnostics

A flow reports a likelihood for any data, whether its fit is good or not.

## How to Read the Training Curve of a Normalising Flow

**Training Curve** runs 100 further epochs on the current model and plots the negative log-likelihood after each, so earlier results go out of date. A falling curve calls for another run, and a flat one suggests that training has settled. Negative values are normal, since a density can exceed 1. A `DomainError` from `Flux.train!` means a non-finite loss, so check the scale of **Input data**.

## How to Read Data vs Latent Space

**Data vs Latent Space** plots the first two variables before and after the flow. A good latent plot is a round cloud around the origin, with no clusters, curves or hard edges. Structure left in the cloud calls for more steps, a wider network or **Neural Spline**. The plot shows two of the D coordinates on training data, and a histogram of each `z[j, :]` covers the others.

## How to Read Latent Normality

**Latent Normality** prints `mean_error`, the largest absolute latent mean, and `cov_error`, the largest absolute entry of the sample covariance minus the identity. A histogram sets all latent values against N(0, 1). Small errors remain from sampling noise, and shrink as n grows. Spikes or heavy tails point to discrete data or too few steps. A pass does not establish joint normality, as pooling can hide one bad coordinate.

## How to Detect Overfitting with Held-Out Log-Likelihood

**Held-Out Log-Likelihood** returns the mean log-likelihood on `data` and on `X_test`, and higher is better. A train value far above the test value means that the flow has memorised the sample, so reduce **hidden_size** or **num_flows**, or gather more data. `X_test` is prepared as `data` was: the same standardisation and, under **Copula c(u)**, the training margins and the probit step set out in [Copula Estimation](copula.md).

## How to Judge a Flow with vs Multivariate Gaussian

**vs Multivariate Gaussian** compares the mean log-likelihood of the flow with that of a maximum-likelihood Gaussian. Both are in-sample and the flow has far more parameters, so a win proves little, while a loss signals failed training. For a fair test, evaluate `mean(logpdf(g, Float64.(X_test)))` and set it against the test value of **Held-Out Log-Likelihood**. A Gaussian that does as well on held-out data is the better choice.

## How Dropout Acts in a Normalising Flow

**dropout** is the probability of the dropout layer before the output of each network of **RealNVP** and **Neural Spline**; the masked network of **MAF** has none. At its default of 0 the layer does nothing. Above 0, the layer drops units at random while `Flux.train!` runs, and `Flux.testmode!(model)` after training switches it off, so the Next Steps evaluate the whole network and **Density of New Points** gives one value for a point. **Training Curve** switches it off again after each epoch, before recording the loss.

## How to Check a Normalising Flow Beyond Its Likelihood

A good likelihood and good samples can part ways, so one criterion does not settle the quality of a generative model ([Theis, van den Oord and Bethge (2015)](#ref-TOB2015a)). Samples come from running each step in the opposite direction, from normal draws to the scale of the data, and set against the data they show what the likelihood can hide. A histogram of `z[j, :]` for each j checks every latent coordinate in turn. Repeated runs show the spread from random starting weights: a gap between runs as large as the gap between tabs means that the tabs are not separated.

## References

<a id="ref-TOB2015a"></a>Theis, L., van den Oord, A. and Bethge, M. (2015). A note on the evaluation of generative models. arXiv:1511.01844. [doi:10.48550/arXiv.1511.01844](https://doi.org/10.48550/arXiv.1511.01844)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
