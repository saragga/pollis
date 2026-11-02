# Overview

A normalising flow turns a complicated distribution into a simple one through a sequence of invertible maps, and keeps track of how each map stretches space. Because the maps are invertible and their Jacobians cheap, the flow gives an exact log-density for each observation, and training is plain maximum likelihood.

## How a Normalising Flow Gets a Density from the Change of Variables

Let f be an invertible map from the data x to a latent z, and let the latent z follow N(0, I). The density of x then follows from the change of variables:

log p(x) = log N(f(x); 0, I) + log |det J_f(x)|

The first term rewards landing near the origin of the latent space. The second term accounts for the stretching of volume by f, and stops the map from collapsing all points to the origin. Composing several steps adds their log-determinants. Steps must be flexible and still have a determinant that is cheap to compute, which is why all three tabs use triangular Jacobians.

## Where Normalising Flows Come From

[Tabak and Vanden-Eijnden (2010)](#ref-TV2010a) estimated densities by flowing samples towards a normal distribution, and [Tabak and Turner (2013)](#ref-TT2013a) built such maps from compositions of simple ones. Additive coupling layers brought the idea to deep networks ([Dinh, Krueger and Bengio (2014)](#ref-DKB2014a)). [Rezende and Mohamed (2015)](#ref-RM2015a) applied flows to approximate posteriors in variational inference, which spread the name. The families of flows are reviewed by [Papamakarios, Nalisnick, Rezende, Mohamed and Lakshminarayanan (2021)](#ref-PNRML2021a).

## How the Three Normalising Flow Tabs Build Their Steps

**RealNVP** leaves half of the variables unchanged and shifts and scales the other half, as functions of the first half ([Dinh, Sohl-Dickstein and Bengio (2017)](#ref-DSB2017a)). **MAF** shifts and scales each variable as a function of those before it in a fixed order, using masked networks ([Papamakarios, Pavlakou and Murray (2017)](#ref-PPM2017a)). **Neural Spline** keeps the coupling structure and replaces the affine map with a monotone rational-quadratic spline on [-5, 5] ([Durkan, Bekasov, Murray and Papamakarios (2019)](#ref-DBMP2019a)). **num_flows** sets the number of steps, and **hidden_size** and **num_layers** set the size of their networks.

## How the Copula Target Changes What a Flow Fits

**Target** applies to all three tabs. **Joint density p(x)** passes **Input data** to the flow as given. **Copula c(u)** first replaces every variable by its empirical ranks, mapped into (0, 1), and then by normal scores through the probit function. Margins are thereby removed, and what remains for the flow is the dependence between variables. The flow's log-density is then a density on the normal-score scale. Reaching the copula density takes one further term, which the panel's code does not add.

## A Common Workflow in the Normalising Flows Panel

1. Arrange the data as D × n, set **input_dim** to D, and standardise the variables when using **Joint density p(x)**.
2. Start with **RealNVP** at the default inputs.
3. Read **Training Curve**, remembering that it trains for 100 more epochs.
4. Run **Latent Normality** and **Data vs Latent Space**.
5. Compare **Held-Out Log-Likelihood** and **vs Multivariate Gaussian**.
6. Try another tab if the gain is worth the cost, keeping the same data.
7. Use **Density of New Points** or **Lowest-Density Samples**, and read **Density Slice**.

## References

<a id="ref-DKB2014a"></a>Dinh, L., Krueger, D. and Bengio, Y. (2014). NICE: non-linear independent components estimation. arXiv:1410.8516. [doi:10.48550/arXiv.1410.8516](https://doi.org/10.48550/arXiv.1410.8516)

<a id="ref-DSB2017a"></a>Dinh, L., Sohl-Dickstein, J. and Bengio, S. (2017). Density estimation using real-valued non-volume preserving (Real NVP) transformations. arXiv:1605.08803. [doi:10.48550/arXiv.1605.08803](https://doi.org/10.48550/arXiv.1605.08803)

<a id="ref-DBMP2019a"></a>Durkan, C., Bekasov, A., Murray, I. and Papamakarios, G. (2019). Neural spline flows. arXiv:1906.04032. [doi:10.48550/arXiv.1906.04032](https://doi.org/10.48550/arXiv.1906.04032)

<a id="ref-PNRML2021a"></a>Papamakarios, G., Nalisnick, E., Rezende, D. J., Mohamed, S. and Lakshminarayanan, B. (2021). Normalizing flows for probabilistic modeling and inference. *Journal of Machine Learning Research* 22(57), 1–64. arXiv:1912.02762. [doi:10.48550/arXiv.1912.02762](https://doi.org/10.48550/arXiv.1912.02762)

<a id="ref-PPM2017a"></a>Papamakarios, G., Pavlakou, T. and Murray, I. (2017). Masked autoregressive flow for density estimation. arXiv:1705.07057. [doi:10.48550/arXiv.1705.07057](https://doi.org/10.48550/arXiv.1705.07057)

<a id="ref-RM2015a"></a>Rezende, D. J. and Mohamed, S. (2015). Variational inference with normalizing flows. arXiv:1505.05770. [doi:10.48550/arXiv.1505.05770](https://doi.org/10.48550/arXiv.1505.05770)

<a id="ref-TT2013a"></a>Tabak, E. G. and Turner, C. V. (2013). A family of nonparametric density estimation algorithms. *Communications on Pure and Applied Mathematics* 66(2), 145–164. [doi:10.1002/cpa.21423](https://doi.org/10.1002/cpa.21423)

<a id="ref-TV2010a"></a>Tabak, E. G. and Vanden-Eijnden, E. (2010). Density estimation by dual ascent of the log-likelihood. *Communications in Mathematical Sciences* 8(1), 217–233. [doi:10.4310/CMS.2010.v8.n1.a11](https://doi.org/10.4310/CMS.2010.v8.n1.a11)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Copula Estimation](copula.md)
