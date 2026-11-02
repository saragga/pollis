# Assumptions

A normalising flow makes no parametric claim about the shape of the data, yet its fitted density still rests on several conditions.

## Why a Normalising Flow Needs a Continuous Distribution

The change of variables requires a density. Rounded or discrete values sit on points of zero volume, and a flow can pile mass onto them, so the likelihood keeps rising without describing anything real. Signs are a training curve that never settles, a held-out score that falls while the training score climbs, and spikes in the **Latent Normality** histogram. Adding small noise before training avoids the problem, and so does another method for discrete variables.

## What Continuity Implies for Separate Modes and Heavy Tails

Each step is continuous and invertible, so the image of the connected normal base stays connected. Separate clusters therefore get joined by thin bridges of low but positive density, visible in **Density Slice**, and those bridges are a property of the method. Tails are limited too: upper bounds on the tails that a generative network can express are derived by [Wiese, Knobloch and Korn (2019)](#ref-WKK2019a). Extreme quantiles of a heavy-tailed variable deserve doubt.

## Why the Observations Must Be Independent Draws

The loss treats samples as independent draws from one distribution, and the `DataLoader` shuffles the columns of **Input data**. A flow fitted to a time series ignores its order and describes only the unconditional distribution. Its likelihood overstates the evidence, and a random hold-out puts neighbours on both sides of the split. Regime shifts also break the condition, as later data then come from another density.

## What Scale the Normalising Flow Tabs Expect

With **Joint density p(x)**, custom **Input data** reach the flow unscaled, and the fixed learning rate of 0.001 suits values near unit scale. Large values slow training or drive it to a non-finite loss, which stops `Flux.train!` with a `DomainError`. **Neural Spline** is more exposed, since its splines act only on [-5, 5]. Standardise with the training mean and standard deviation, and treat held-out data the same way.

## Why Sample Size Limits a Normalising Flow

The default inputs give hundreds of thousands of parameters for ten variables, so a small sample can be memorised. The training code has no weight penalty, early stopping or validation split to guard against that. A growing distance between train and test in **Held-Out Log-Likelihood** is the sign. Reduce **hidden_size** or **num_flows** when it appears, or fall back on a Gaussian density.

## How Variable Order and Random Starts Affect a Normalising Flow

Autoregressive models are sensitive to the order of the variables, as [Papamakarios, Pavlakou and Murray (2017)](#ref-PPM2017a) note. The coupling splits of this panel also follow row position in **Input data** with no shuffling, so reordering the rows can change the result. The likelihood is non-convex, no seed is set, and training ends after 100 epochs whether or not it has converged. Repeating a fit shows how far a conclusion depends on these choices.

## References

<a id="ref-PPM2017a"></a>Papamakarios, G., Pavlakou, T. and Murray, I. (2017). Masked autoregressive flow for density estimation. arXiv:1705.07057. [doi:10.48550/arXiv.1705.07057](https://doi.org/10.48550/arXiv.1705.07057)

<a id="ref-WKK2019a"></a>Wiese, M., Knobloch, R. and Korn, R. (2019). Copula & marginal flows: disentangling the marginal from its joint. arXiv:1907.03361. [doi:10.48550/arXiv.1907.03361](https://doi.org/10.48550/arXiv.1907.03361)

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
