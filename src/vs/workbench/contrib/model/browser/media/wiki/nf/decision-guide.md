# Decision Guide

The first decision is whether the sample justifies a neural density model at all.

## Which Normalising Flow Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| A first fit, or later use that will need sampling | **RealNVP** | Each step inverts in closed form in one pass, although the panel has no sampling action |
| Density evaluation with no plan to sample | **MAF** | Each variable depends on all earlier ones, and a density takes one pass per step |
| Multimodal, skewed or sharply bounded densities | **Neural Spline** | A monotone spline can bend where an affine map only scales and shifts |
| Dependence matters more than the margins | Any tab with **Copula c(u)** | Ranks remove the margins before the flow starts |

## How to Choose Between Coupling and Autoregressive Flows

A coupling step changes half of the variables as a function of the other half, so it is cheap and invertible in one pass but limited. An autoregressive step changes every variable given the earlier ones, so it does more, while inversion takes D passes. A coupling layer is a special case of an autoregressive one ([Papamakarios, Pavlakou and Murray (2017)](#ref-PPM2017a)). This panel codes only the data-to-latent pass, so sampling speed matters only if the user writes the inverse.

## When Rational-Quadratic Splines Are Worth Their Cost

**Neural Spline** needs 3K − 1 outputs per transformed variable, K being **num_bins**, and its code builds the splines in a loop over samples. Such coupling flows can reach the density-estimation performance of autoregressive flows ([Durkan, Bekasov, Murray and Papamakarios (2019)](#ref-DBMP2019a)). Prefer the tab when **RealNVP** leaves visible structure in **Data vs Latent Space**, and keep it only if **Held-Out Log-Likelihood** improves by more than the variation between runs.

## When to Use the Copula Target in Place of the Joint Density

Choose **Joint density p(x)** when the density itself is the output, such as for scoring new points on their original scale. Choose **Copula c(u)** when margins are irregular or modelled elsewhere and only dependence is at stake, since ranks are unaffected by increasing changes of a variable. New points then need the training margins before scoring, and the panel keeps none.

## How to Size a Normalising Flow

With n in the hundreds, begin under the defaults, with **num_flows** of 4 and **hidden_size** of 32 to 64, and grow only while **Held-Out Log-Likelihood** improves. More **num_flows** let the map bend further, a larger **hidden_size** makes each step richer, and **num_bins** of 4 to 16 refines each spline. For **MAF**, keep **hidden_size** at D − 1 or more so that all degrees of its masks occur.

## When a Simpler Density Model Beats a Normalising Flow

A multivariate Gaussian costs D + D(D + 1) / 2 parameters and often holds its own on small samples. A mixture of Gaussians handles clusters with far fewer parameters than a flow, and a kernel estimate can serve in two or three dimensions. A flow pays off with many observations and clearly non-Gaussian structure. Use the Autoencoders panel when the aim is a low-dimensional code, since a flow keeps all D dimensions.

## References

<a id="ref-DBMP2019a"></a>Durkan, C., Bekasov, A., Murray, I. and Papamakarios, G. (2019). Neural spline flows. arXiv:1906.04032. [doi:10.48550/arXiv.1906.04032](https://doi.org/10.48550/arXiv.1906.04032)

<a id="ref-PPM2017a"></a>Papamakarios, G., Pavlakou, T. and Murray, I. (2017). Masked autoregressive flow for density estimation. arXiv:1705.07057. [doi:10.48550/arXiv.1705.07057](https://doi.org/10.48550/arXiv.1705.07057)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Copula Estimation](copula.md)
