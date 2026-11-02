# Overview

An autoencoder is a neural network trained to reproduce its input through a layer narrower than the input, which forces it to find a compact code. A variational autoencoder keeps the same hourglass shape and treats the code as a distribution, so that the latent space can be drawn from.

## What an Autoencoder Learns from a Data Table

The encoder maps each row to a short code and the decoder maps the code back to a row. Training shrinks the gap between a row and its reconstruction, with no target other than the row itself. Variation the code cannot hold is lost, so the network is pushed to keep what recurs across rows. The result is a nonlinear dimension reduction: `Z` gives the coordinates, and the decoder shows what those coordinates imply for the original columns. Labels play no part in this training, and nothing ties the axes of the code to named quantities.

## Where Autoencoders and Variational Autoencoders Come From

With linear units and squared error, the optimum of such a network spans the same subspace as the leading principal components, as [Baldi and Hornik (1989)](#ref-BH1989a) showed. [Kramer (1991)](#ref-Kra1991a) added nonlinear layers and presented autoassociative networks as nonlinear principal component analysis. [Hinton and Salakhutdinov (2006)](#ref-HS2006a) then found that deep autoencoders, started from layer-by-layer pretraining, gave better low-dimensional codes than principal components on images and documents. The variational form came from [Kingma and Welling (2013)](#ref-KW2013a) and, separately, from [Rezende, Mohamed and Wierstra (2014)](#ref-RMW2014a), who joined a latent-variable model to an encoder trained by gradients taken through random draws.

## How the Autoencoder Tab Builds Its Network

The **Autoencoder** tab standardises **Feature Matrix** with its own column means and standard deviations, then builds two small chains. The encoder has one relu layer of **Hidden Units** followed by a linear layer of **Latent Dimensions**, and the decoder mirrors it. Adam minimises the mean squared error on shuffled batches for the chosen number of **Epochs**. There is no pretraining, weight penalty, early stopping or validation split, and the depth is fixed at one hidden layer on each side.

## How the VAE Tab Differs from a Plain Autoencoder

The **VAE** tab has the same layers, but its encoder returns a mean and a log-variance for every latent dimension. Training draws a code from that Gaussian through the reparametrisation trick, so gradients can pass through the draw. The loss adds the KL divergence to a standard normal prior, weighted by **beta (KL weight)**, to the squared reconstruction error. That extra term keeps the codes close to N(0, I), and this is why **Generate Samples** can decode draws from the prior. After training, `Z` and `X_hat` use the posterior mean and no random draw.

## A Common Workflow in the Autoencoders Panel

1. Give a numeric **Feature Matrix** with one row per observation and no missing values.
2. Choose a tab, and two **Latent Dimensions** if the aim is a picture.
3. Train, and read **Training Loss** to see whether the loss has flattened.
4. Run **vs PCA** to learn whether the nonlinear network beats the linear method.
5. Use **Choosing Latent Size** when the size of the code is an open question.
6. Check for dead dimensions with **Latent Space Statistics**, and read **Reconstruction Error**.
7. Read the code with **Latent Traversal** and **Feature-Latent Correlation**.
8. Apply the model with **Encode New Data** or **Generate Samples**.

## References

<a id="ref-BH1989a"></a>Baldi, P. and Hornik, K. (1989). Neural networks and principal component analysis: learning from examples without local minima. *Neural Networks* 2(1), 53–58. [doi:10.1016/0893-6080(89)90014-2](https://doi.org/10.1016/0893-6080(89)90014-2)

<a id="ref-HS2006a"></a>Hinton, G. E. and Salakhutdinov, R. R. (2006). Reducing the dimensionality of data with neural networks. *Science* 313(5786), 504–507. [doi:10.1126/science.1127647](https://doi.org/10.1126/science.1127647)

<a id="ref-KW2013a"></a>Kingma, D. P. and Welling, M. (2013). Auto-encoding variational Bayes. arXiv:1312.6114. [doi:10.48550/arXiv.1312.6114](https://doi.org/10.48550/arXiv.1312.6114)

<a id="ref-Kra1991a"></a>Kramer, M. A. (1991). Nonlinear principal component analysis using autoassociative neural networks. *AIChE Journal* 37(2), 233–243. [doi:10.1002/aic.690370209](https://doi.org/10.1002/aic.690370209)

<a id="ref-RMW2014a"></a>Rezende, D. J., Mohamed, S. and Wierstra, D. (2014). Stochastic backpropagation and approximate inference in deep generative models. arXiv:1401.4082. [doi:10.48550/arXiv.1401.4082](https://doi.org/10.48550/arXiv.1401.4082)

## See Also

- [Factsheet](factsheet.md) · [Autoencoder](ae.md) · [Variational Autoencoder](vae.md)
