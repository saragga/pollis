# Diagnostics

A flow reports a likelihood for any data, whether its fit is good or not.

## How to Read the Training Curve of a Normalising Flow

**Training Curve** runs 100 further epochs on the current model and plots the negative log-likelihood after each, so earlier results go out of date. A falling curve calls for another run, and a flat one suggests that training has settled. Negative values are normal, since a density can exceed 1. A `DomainError` from `Flux.train!` means a non-finite loss, so check the scale of **Input data**.

## How to Read Data vs Latent Space

**Data vs Latent Space** plots the first two variables before and after the flow. A good latent plot is a round cloud around the origin, with no clusters, curves or hard edges. Structure left in the cloud calls for more steps, a wider network or **Neural Spline**. Only two of the D coordinates appear, and on training data, so a round picture says nothing about the others or about new points.

## How to Read Latent Normality

**Latent Normality** prints `mean_error`, the largest absolute latent mean, and `cov_error`, the largest absolute entry of the sample covariance minus the identity. A histogram sets all latent values against N(0, 1). Sampling noise alone gives errors of about 2 to 3 divided by the square root of n. Spikes or heavy tails point to discrete data or too few steps. A pass does not establish joint normality, as pooling can hide one bad coordinate.

## How to Detect Overfitting with Held-Out Log-Likelihood

**Held-Out Log-Likelihood** returns the mean log-likelihood on `data` and on `X_test`, and higher is better. A train value far above the test value means that the flow has memorised the sample, so reduce **hidden_size** or **num_flows**, or gather more data. With custom data, `X_test` must exist and be prepared as `data` was. With **Copula c(u)**, the code leaves `X_test` without the rank and probit steps, so the two numbers sit on different scales unless the user transforms it.

## How to Judge a Flow with vs Multivariate Gaussian

**vs Multivariate Gaussian** compares the mean log-likelihood of the flow with that of a maximum-likelihood Gaussian. Both are in-sample and the flow has far more parameters, so a win proves little, while a loss signals failed training. For a fair test, evaluate `mean(logpdf(g, Float64.(X_test)))` and set it against the test value of **Held-Out Log-Likelihood**. A Gaussian that does as well on held-out data is the better choice.

## How Dropout Disturbs the Next Steps of a Normalising Flow

**dropout** acts in **RealNVP** and **Neural Spline**, and has no effect at its default of 0. Above 0, `Flux.train!` in the Flux.jl 0.16 series leaves the layers in training mode, and the panel's code never resets them. All Next Steps then drop units at random, so repeated calls of **Density of New Points** give different values for one point. Flux.jl 0.14 does not make that call. `Flux.testmode!(model)` settles the matter in either version.

## What the Normalising Flows Panel Does Not Check

The panel cannot draw from the fitted flow, so it compares no samples with data; writing the inverse of the steps would allow that, and good likelihood and good samples can part ways ([Theis, van den Oord and Bethge (2015)](#ref-TOB2015a)). A histogram of `z[j, :]` for each j adds the missing per-coordinate check. Run-to-run variation goes unreported too. A gap between repeated runs as large as the gap between tabs means that the tabs are not separated.

## References

<a id="ref-TOB2015a"></a>Theis, L., van den Oord, A. and Bethge, M. (2015). A note on the evaluation of generative models. arXiv:1511.01844. [doi:10.48550/arXiv.1511.01844](https://doi.org/10.48550/arXiv.1511.01844)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
