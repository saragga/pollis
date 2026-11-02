# Feedforward Neural Networks — Decision Guide

Most choices in the panel come down to whether a target exists and how much data supports the network. A linear model or PCA is the sensible start, and a network earns its place by beating them on held-out data.

## Which Feedforward Network Tab Fits the Task

| Situation | Tab | Why |
|---|---|---|
| Tabular inputs with a numeric target and one likely outcome | **MLP** with **Standard** | Estimates the conditional mean under squared error |
| A scalar target with several likely outcomes or changing spread | **MLP** with **MDN** | Fits a mixture distribution at each input |
| Labels coded as numbers, for quick exploration only | **MLP** with **Standard** | Fits them by regression, as no softmax or cross-entropy is offered |
| No target, and a short code or a reconstruction score is wanted | **Autoencoder** | Learns a deterministic code by reconstruction |
| No target, and new samples or a smooth latent space are wanted | **VAE** | Pairs a probabilistic code with a prior to draw from |
| Time order or local patterns matter | Another panel | The network here does not use order |

## How to Choose the Width and Depth of a Feedforward Network

**hidden_size** and **num_layers** set capacity. With **num_layers** at 3 and **hidden_size** at 128, the network holds tens of thousands of weights, so on small samples start smaller. One or two hidden layers often suffice for smooth tabular relations. Raise capacity only when **Train vs Validation Loss** shows both errors high and close together, which marks underfitting. A wide validation gap asks for less capacity or more data. Depth beyond a few layers usually needs **Residual connections** or **Batch normalisation** to train in 100 epochs.

## How to Choose the Activation of a Feedforward Network

**relu** is the default and a sound first choice, though units can stop responding when always negative before the activation. **leakyrelu** keeps a small slope there. **tanh** is smooth and bounded, so it suits smooth targets but saturates on unscaled inputs. **gelu**, from [Hendrycks and Gimpel (2016)](#ref-HG2016a), is a smooth alternative to **relu**. **selu**, from [Klambauer, Unterthiner, Mayr and Hochreiter (2017)](#ref-KUMH2017a), aims at keeping activations normalised, but that analysis relies on a specific weight initialisation and on standardised inputs, while the panel keeps Flux's Glorot default. The choice seldom matters as much as scaling and capacity.

## When to Use Dropout, Residual Connections or Batch Normalisation

Each option treats a different problem.

| Problem | Option | Limit |
|---|---|---|
| Validation loss far from training loss | **dropout** of about 0.1 to 0.5 | Slows training, and 100 epochs may become too few |
| Training stalls in a deep stack | **Residual connections** | No effect at **num_layers** of 1, where there is no second block |
| Training is unstable or inputs are hard to scale | **Batch normalisation** | Needs batches of more than one sample, and changes results between modes |

Start with none, and add one at a time while watching **Train vs Validation Loss**. Options that raise the number of settings without a measured gain are best dropped.

## How to Choose the Latent Size of an Autoencoder or VAE

**latent_dim** should be smaller than **input_size**, and the default of 3 is only a starting point. Fit several sizes and plot held-out reconstruction error against size. The size where the curve flattens is a fair choice. **Classical Baseline** at each size shows how much of that error PCA already reaches. A plot needs at least 2 coordinates, but a useful code may need many more. In **VAE**, a larger code does not always help, since unused coordinates simply follow the prior.

## References

<a id="ref-HG2016a"></a>Hendrycks, D. and Gimpel, K. (2016). Gaussian error linear units (GELUs). arXiv:1606.08415. [doi:10.48550/arXiv.1606.08415](https://doi.org/10.48550/arXiv.1606.08415)

<a id="ref-KUMH2017a"></a>Klambauer, G., Unterthiner, T., Mayr, A. and Hochreiter, S. (2017). Self-normalizing neural networks. *Advances in Neural Information Processing Systems 30*. arXiv:1706.02515. [doi:10.48550/arXiv.1706.02515](https://doi.org/10.48550/arXiv.1706.02515)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Residual & BatchNorm](residual-batchnorm.md)
