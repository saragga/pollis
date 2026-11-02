# Variational Autoencoder

A variational autoencoder gives each input a distribution over codes and asks that distribution to stay close to a fixed prior. The **VAE** tab of the Feedforward Neural Networks panel trains one on data with no target.

## What a Variational Autoencoder Computes

For an input x, the encoder returns a mean mu(x) and a log-variance logvar(x) for each latent coordinate. A code is drawn as z = mu + exp(logvar / 2) * e, with e from a standard normal, and the decoder rebuilds x from z. [Kingma and Welling (2013)](#ref-KW2013a) and [Rezende, Mohamed and Wierstra (2014)](#ref-RMW2014a) introduced this approach, in which the draw is written so that gradients reach the encoder. The KL divergence between the Gaussian code and a standard normal prior has a closed form for each sample:

KL = -0.5 * sum over coordinates of (1 + logvar - mu^2 - exp(logvar))

## What the VAE Tab Minimises

The code minimises `Flux.mse(m.decoder(z), x) + kl`, where the first term averages squared error over features and samples and the second sums over latent coordinates and averages over samples. A comment calls this the negative ELBO. Up to a constant, it is the negative ELBO of a Gaussian decoder whose variance per feature equals **input_size** / 2. On standardised data with many features, that assumed noise is large, so the KL term weighs heavily against reconstruction. A beta weight or a sum over features would change this balance, and the panel offers neither. One random draw of z is used per pass.

## How the VAE Tab Builds Its Network

**input_size**, **hidden_size** and **num_layers** set a trunk shared by two `Dense` heads, one for the means and one for the log-variances, each of size **latent_dim**. The decoder has its own **num_layers** hidden blocks and a linear `Dense` output. **activation**, **dropout**, **Residual connections** and **Batch normalisation** apply to the trunk and the decoder. **Predict New Data** returns `X_rec`, decoded from the posterior mean, and `X_gen`, 100 decoded draws from a standard normal. Neither adds decoder noise, so `X_gen` shows the mean of the decoder at each draw.

## What a Variational Autoencoder Offers Over a Plain Autoencoder

The prior gives a region of the code space from which draws can be decoded, so the model can produce new samples. Nearby codes tend to decode to similar outputs, as noise in the code rewards smoothness during training. Each input also receives an uncertainty, through its log-variance. The price is a less exact reconstruction than a plain **Autoencoder** of the same size. The objective is a lower bound on the likelihood, reached by approximation, and the wider properties of such variational methods are reviewed by [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a).

## Where a Variational Autoencoder Misleads

The main failure is posterior collapse, where the KL term goes to zero, the decoder ignores z and every reconstruction falls close to the data mean. [Bowman, Vilnis, Vinyals, Dai, Jozefowicz and Bengio (2016)](#ref-BVVDJ...2016a) described it in sequence models. In this tab, the weighting of the KL term makes it a live risk. A posterior with diagonal covariance cannot capture correlated uncertainty. Samples from squared-error decoders tend to be smoother than real data. Coordinates of a fitted code are not guaranteed to correspond to independent factors. Data with several regimes can also leave holes in the code space, where draws decode to implausible values.

## What to Compare a Variational Autoencoder With

**Classical Baseline** fits PCA with **latent_dim** components and reports a reconstruction error. To compare, take only the reconstruction part of the **VAE** loss, as **Train vs Validation Loss** returns reconstruction plus KL. The **Autoencoder** tab shows how much reconstruction the KL term gives up. If reconstruction is close to that of the data mean, compute the KL term on the data to test for collapse. If sampling is the aim, compare the means and correlations of `X_gen` with those of the data, since the panel has no sample-quality measure.

## References

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A. and McAuliffe, J. D. (2017). Variational inference: a review for statisticians. *Journal of the American Statistical Association* 112(518), 859–877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

<a id="ref-BVVDJ...2016a"></a>Bowman, S. R., Vilnis, L., Vinyals, O., Dai, A., Jozefowicz, R. and Bengio, S. (2016). Generating sentences from a continuous space. *Proceedings of the 20th SIGNLL Conference on Computational Natural Language Learning*, 10–21. [doi:10.18653/v1/K16-1002](https://doi.org/10.18653/v1/K16-1002)

<a id="ref-KW2013a"></a>Kingma, D. P. and Welling, M. (2013). Auto-encoding variational Bayes. arXiv:1312.6114. [doi:10.48550/arXiv.1312.6114](https://doi.org/10.48550/arXiv.1312.6114)

<a id="ref-RMW2014a"></a>Rezende, D. J., Mohamed, S. and Wierstra, D. (2014). Stochastic backpropagation and approximate inference in deep generative models. arXiv:1401.4082. [doi:10.48550/arXiv.1401.4082](https://doi.org/10.48550/arXiv.1401.4082)

## See Also

- [Autoencoder](autoencoder.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
