# Interpretation

A fitted flow is a density function and little else. Its value at a point can be read directly, whereas its weights, latent axes and single steps say nothing direct about the data.

## What a Log-Density from a Normalising Flow Means

**Density of New Points** returns `logp`, the log-density at each column of `X_new`. It is a density and not a probability, so it can be positive. Its value depends on scale: multiplying all D variables by c lowers every log-density by D × log(c). Values are therefore comparable only on data prepared in the same way, which rules out comparing **Joint density p(x)** with **Copula c(u)**. The number describes the fitted map and says nothing about its distance from the true density.

## How to Read a Mean Log-Likelihood Difference Between Flows

A difference of d in mean log-likelihood means that one model's density is higher by a factor of exp(d) in the geometric mean over the sample. On training data, such a difference favours the model with more parameters. **Held-Out Log-Likelihood** and **vs Multivariate Gaussian** give no standard error. Repeating the fit gives a rough idea of the noise, and a bootstrap of the point-wise values from `logdensity` gives another for one fixed model.

## How to Read Lowest-Density Samples

**Lowest-Density Samples** lists the ten training columns with the smallest log-density. It returns ten whether or not any of them is odd, and it needs at least ten samples. The ranking changes with the scaling of the variables, since density depends on the coordinates. Log-density is an imperfect signal even on new data: for images, flow models and others can give higher likelihood to another data set ([Nalisnick, Matsukawa, Teh, Gorur and Lakshminarayanan (2018)](#ref-NMTGL2018a)).

## How to Read a Density Slice

**Density Slice** evaluates the fitted density along the first variable, across its observed range, with every other variable at its median. The curve is a cross-section of the joint density, proportional to one conditional density and not normalised. It is not the marginal density of the first variable, and bumps can appear or vanish at other values of the others. Modes far apart may be linked by low bridges that follow from the continuity of the map.

## How to Read the Per-Step Log-Determinant

**Per-Step Log-Determinant** is a bar chart of the mean log |det J| of each step, in the direction from data to latent values. A positive bar means that the step stretches volume on average, and a negative one that it squeezes it. Summed over the steps and added to the mean base log-density, the bars give the mean log-likelihood. A bar near zero does not show an idle step, as a step that preserves volume may still reshape the data.

## Why the Latent Coordinates of a Flow Have No Direct Meaning

The latent z in **Data vs Latent Space** has the dimension of the data and is not a set of factors. Any rotation of N(0, I) is again N(0, I), so many maps fit equally well, and coordinate j has no special link with variable j once steps are composed. A flow reduces no dimensions, unlike PCA or an autoencoder. Use latent values to check the fit, and put questions about variables through **Density Slice** or **Copula c(u)**.

## References

<a id="ref-NMTGL2018a"></a>Nalisnick, E., Matsukawa, A., Teh, Y. W., Gorur, D. and Lakshminarayanan, B. (2018). Do deep generative models know what they don't know? arXiv:1810.09136. [doi:10.48550/arXiv.1810.09136](https://doi.org/10.48550/arXiv.1810.09136)

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Copula Estimation](copula.md)
