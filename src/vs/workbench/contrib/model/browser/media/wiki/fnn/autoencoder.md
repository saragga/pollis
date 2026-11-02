# Autoencoder

An autoencoder learns a short code of its inputs by trying to rebuild them from that code. The **Autoencoder** tab of the Feedforward Neural Networks panel trains a fully connected one with no target.

## What a Feedforward Autoencoder Computes

The encoder E maps an input x to a code z = E(x) with **latent_dim** numbers, and the decoder D maps the code to a reconstruction x_hat = D(z). Training minimises the mean squared error over all features of all samples in a batch:

L = (1 / (n p)) sum over samples and features of (x_hat - x)^2

with n samples and p features. The code layer has no activation, so z may take any real value. The output layer also has none, so reconstructions are not limited to any range. [Hinton and Salakhutdinov (2006)](#ref-HS2006a) showed that deep codes of this kind can outdo PCA on some data, though their result used pretraining that the panel does not perform.

## How the Autoencoder Tab Builds Its Network

**input_size** sets the data width, and **latent_dim** the code width. The encoder has **num_layers** hidden blocks of width **hidden_size**, then a `Dense` layer to the code. The decoder has the same number of hidden blocks, starting from the code, then a `Dense` layer back to **input_size**. Its weights are separate from those of the encoder, not tied. **activation**, **dropout**, **Residual connections** and **Batch normalisation** apply to both halves. With **Batch normalisation** on, the first block of the decoder also normalises the code. Training uses Adam at 0.001, batches of 64 and 100 epochs.

## What Autoencoders Are Good For

An autoencoder can capture curved structure that a linear method misses, and it gives a code for new samples through a single forward pass. The decoder also gives a way back to the original features, which methods such as t-SNE lack. Reconstruction error yields a score for each sample that can flag unusual ones. Training needs no labels, and the width and depth adjust to the data. These gains depend on having enough samples for all those weights, as the network has far more parameters than a principal components fit of the same **latent_dim**.

## Where an Autoencoder Misleads

Low reconstruction error shows that the code keeps information, and not that the code is meaningful. Coordinates are not ordered by importance, can be correlated, and change from run to run. Points close in code space need not be similar, and space between clusters of codes may decode to nonsense, so random codes are not a way to make new data. A large **latent_dim** or a large network can learn close to a copy of the input. Reconstruction error treats all features alike, so scaling decides what the code keeps. An anomaly score fails when anomalies were part of training.

## What to Compare a Feedforward Autoencoder With

**Classical Baseline** fits PCA with **latent_dim** components and reports its in-sample reconstruction error. [Baldi and Hornik (1989)](#ref-BH1989a) showed that a linear autoencoder under squared error reaches the same subspace as the leading principal components, so PCA is the natural floor for comparison. An autoencoder that cannot beat PCA on held-out data adds complexity for no gain. Compare on the same scaling, and on samples kept out of training, using **Train vs Validation Loss**. If smooth sampling is the aim, compare with the **VAE** tab, whose code has a prior to draw from.

## References

<a id="ref-BH1989a"></a>Baldi, P. and Hornik, K. (1989). Neural networks and principal component analysis: learning from examples without local minima. *Neural Networks* 2(1), 53–58. [doi:10.1016/0893-6080(89)90014-2](https://doi.org/10.1016/0893-6080(89)90014-2)

<a id="ref-HS2006a"></a>Hinton, G. E. and Salakhutdinov, R. R. (2006). Reducing the dimensionality of data with neural networks. *Science* 313(5786), 504–507. [doi:10.1126/science.1127647](https://doi.org/10.1126/science.1127647)

## See Also

- [Variational Autoencoder](vae.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
