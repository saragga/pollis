# Variational Autoencoder

The **VAE** tab fits a latent-variable model in which each row has a Gaussian distribution over codes and not one point. The method comes from [Kingma and Welling (2013)](#ref-KW2013a) and [Rezende, Mohamed and Wierstra (2014)](#ref-RMW2014a).

## What the VAE Tab Computes

The encoder returns a mean mu(x) and a log-variance logvar(x) for each latent dimension. Training draws one code for each row in the batch and scores it:

- z = mu(x) + exp(logvar(x) / 2) × e, with e drawn from N(0, I)
- reconstruction = sum over features of (x_j − dec(z)_j)^2
- KL = sum over latent dimensions of −0.5 × (1 + logvar − mu^2 − exp(logvar))
- loss = mean over rows of (reconstruction + beta × KL)

Writing z in this way is the reparametrisation trick: the randomness sits in e, so gradients reach mu and logvar through z.

## How the Loss of the VAE Tab Relates to the ELBO

The evidence lower bound, or ELBO, is the quantity a variational autoencoder maximises. With **beta (KL weight)** at 1, the loss of the **VAE** tab is the negative ELBO, up to a constant, for a Gaussian decoder whose variance is fixed at one half, since the squared error carries no factor of 0.5. The decoder variance is not learned. Because the squared error is summed over features, a table with more columns gives reconstruction more weight against the KL term. With **beta (KL weight)** away from 1, the loss is no longer a bound on the log-likelihood of that decoder.

## Which Inputs the VAE Tab Takes

**Feature Matrix**, **Latent Dimensions**, **Hidden Units**, **Epochs**, **Learning Rate** and **Batch Size** play the same roles as in the **Autoencoder** tab, with the same defaults. The extra input is **beta (KL weight)**, default 1.0. The code writes it directly before `f0`, so a plain decimal such as 0.5 or 4.0 works, whereas scientific notation such as 1e-3 does not form a valid number there. The encoder output has 2k values, half for the means and half for the log-variances, and the decoder takes k values.

## What beta Does in a Variational Autoencoder

Raising **beta (KL weight)** tightens the limit on how much information the code may carry about a row, so reconstruction worsens and more dimensions fall back to the prior. A setting over 1 is known as beta-VAE, and its effect can be read as a capacity limit ([Burgess, Higgins, Pal, Matthey, Watters, Desjardins and Lerchner (2018)](#ref-BHPMW...2018a)). The ELBO alone does not select one balance between rate and distortion, and models with the same value can use their codes very differently ([Alemi, Poole, Fischer, Dillon, Saurous and Murphy (2017)](#ref-APFDS...2017a)). A beta under 1 favours reconstruction at the price of codes that fit the prior less well, and so of poorer draws in **Generate Samples**.

## Why Disentanglement in a VAE Is Not Guaranteed

A larger beta is often said to separate the factors behind the data into separate latent dimensions. Such a result should not be assumed. Fully unsupervised disentanglement has been proved impossible without assumptions on models and data, and in a large study random seeds and hyperparameters mattered more than the choice of method ([Locatello, Bauer, Lucic, Rätsch, Gelly, Schölkopf and Bachem (2019)](#ref-LBLRG...2019a)). Read a dimension through **Latent Traversal** and **Feature-Latent Correlation**, then repeat with another seed by editing `Random.seed!(1)` in `train`, as the code resets the seed to 1 on every run.

## How to Detect Posterior Collapse with Latent Space Statistics

Posterior collapse means that the encoder returns the prior for a dimension whatever the row, so the decoder gets noise from it, a problem described in text models ([Bowman, Vilnis, Vinyals, Dai, Jozefowicz and Bengio (2016)](#ref-BVVDJ...2016a)). **Latent Space Statistics** adds a `kl` column in this tab, the mean KL divergence of each dimension, and a value near 0 marks a collapsed one. One or two such dimensions need not be a fault, as they may be spare capacity. When all of them are near 0, the decoder ignores the code, and the remedy is a lower **beta (KL weight)**. The `std` column describes posterior means, so it is smaller than the spread of the sampled codes.

## How to Read Loss, Samples and Comparisons from the VAE Tab

**Training Loss** evaluates each epoch with a new random draw, so the curve stays noisy even on the full matrix, and its scale differs from the **Autoencoder** tab, which averages over entries. **Generate Samples** decodes draws from N(0, I) and returns decoder means in the units of **Feature Matrix**, with no observation noise, so samples show less spread than real rows. **vs PCA** and **Choosing Latent Size** measure reconstruction from the posterior mean only, and the KL term plays no part in either score. A **VAE** that loses to PCA on reconstruction is not necessarily failing, because reconstruction was not its only objective.

## Where the VAE Tab Misleads and What to Compare It With

`Z` drops the posterior uncertainty, which `posterior(model, Xt)` still gives through its log-variance. The Gaussian prior and the diagonal posterior are choices of the method and not findings about the data, so a smooth latent plot is partly their product. **Encode New Data** scores new rows from the posterior mean, and not by their ELBO. Compare with the **Autoencoder** tab when reconstruction is the aim, and with PCA as the linear baseline. If an exact density is what matters, the Normalising Flows panel evaluates one directly, which this tab cannot do.

## References

<a id="ref-APFDS...2017a"></a>Alemi, A. A., Poole, B., Fischer, I., Dillon, J. V., Saurous, R. A. and Murphy, K. (2017). Fixing a broken ELBO. arXiv:1711.00464. [doi:10.48550/arXiv.1711.00464](https://doi.org/10.48550/arXiv.1711.00464)

<a id="ref-BVVDJ...2016a"></a>Bowman, S. R., Vilnis, L., Vinyals, O., Dai, A., Jozefowicz, R. and Bengio, S. (2016). Generating sentences from a continuous space. *Proceedings of the 20th SIGNLL Conference on Computational Natural Language Learning*, 10–21. [doi:10.18653/v1/K16-1002](https://doi.org/10.18653/v1/K16-1002)

<a id="ref-BHPMW...2018a"></a>Burgess, C. P., Higgins, I., Pal, A., Matthey, L., Watters, N., Desjardins, G. and Lerchner, A. (2018). Understanding disentangling in beta-VAE. arXiv:1804.03599. [doi:10.48550/arXiv.1804.03599](https://doi.org/10.48550/arXiv.1804.03599)

<a id="ref-KW2013a"></a>Kingma, D. P. and Welling, M. (2013). Auto-encoding variational Bayes. arXiv:1312.6114. [doi:10.48550/arXiv.1312.6114](https://doi.org/10.48550/arXiv.1312.6114)

<a id="ref-LBLRG...2019a"></a>Locatello, F., Bauer, S., Lucic, M., Rätsch, G., Gelly, S., Schölkopf, B. and Bachem, O. (2019). Challenging common assumptions in the unsupervised learning of disentangled representations. *Proceedings of the 36th International Conference on Machine Learning*. arXiv:1811.12359. [doi:10.48550/arXiv.1811.12359](https://doi.org/10.48550/arXiv.1811.12359)

<a id="ref-RMW2014a"></a>Rezende, D. J., Mohamed, S. and Wierstra, D. (2014). Stochastic backpropagation and approximate inference in deep generative models. arXiv:1401.4082. [doi:10.48550/arXiv.1401.4082](https://doi.org/10.48550/arXiv.1401.4082)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Autoencoder](ae.md)
