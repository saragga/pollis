# Feedforward Neural Networks — Interpretation

The weights of a feedforward network have no direct meaning, so its outputs are read through losses, codes and gradients. Each of these answers a narrower question than it first appears to.

## How to Compare Loss Values Across Feedforward Network Tabs

The number called the loss differs by tab. **Standard** and **Autoencoder** report a mean squared error averaged over all outputs or features, in squared units of the scaled data. **MDN** reports a negative log-likelihood, which can be negative and has no fixed lower limit. **VAE** reports reconstruction error plus a KL term, so its loss starts from a different level. Losses are comparable between runs of one tab on the same data and scaling. They are not comparable between tabs, and a lower **VAE** loss than a **Classical Baseline** figure, or the reverse, proves nothing without separating out the reconstruction part.

## How to Read the Learned Representation Scatter

**Learned Representation** plots the first two coordinates of every sample. In **MLP**, those are the first two of **hidden_size** units in the last hidden layer, an arbitrary pair out of many. In **Autoencoder**, they come from the encoder, and in **VAE**, from the posterior means. Groups and gradients hint at structure, but axes have no fixed meaning and differ between runs, and two coordinates may hide what other coordinates hold. The plot needs **latent_dim** of at least 2. In **Autoencoder**, the plot keeps using the original `encoder`, even after **Train vs Validation Loss** has replaced `model`.

## How to Read Input Sensitivity of a Feedforward Network

**Input Sensitivity** returns one number per input feature: the absolute gradient of a summed output, averaged over samples. A large value says that the output moves locally when that feature moves, at the current scale. It says nothing about cause, and a feature can show little sensitivity because a correlated feature carries the signal. Summing signed outputs first can cancel opposite effects across outputs or latent coordinates. Feature scales matter, so compare only standardised features. With **MDN**, the step sums the component means without their weights. Unless test mode has been set, dropout is active and the numbers change between calls.

## How to Read Per-Sample Error for Anomaly Detection

**Per-Sample Error** in **Autoencoder** or **VAE** gives a reconstruction error for each sample, and a large error is the usual anomaly signal. The logic assumes that anomalies are rare and unlike the training data. If they were included in training, a flexible network may learn them and rebuild them well, which hides them. A sample with large error may simply lie in a sparse region. A threshold read from the same histogram has no error rate attached, so it needs held-out or labelled data to be judged.

## How to Read the Outputs of Predict New Data

**Predict New Data** switches to test mode and applies the network to `X_new`, which needs the training shape and scaling.

| Tab | Result | Reading |
|---|---|---|
| **MLP**, **Standard** | `y_hat` | Estimated conditional mean, with no uncertainty |
| **MLP**, **MDN** | Weights, means and standard deviations | A mixture for each new sample, one column each |
| **Autoencoder** | `X_rec` | Reconstruction of each new sample |
| **VAE** | `X_rec` | Reconstruction decoded from the posterior mean |
| **VAE** | `X_gen` | 100 decoded draws from a standard normal, without decoder noise |

Far from the training inputs, a network extrapolates freely and gives no warning.

## See Also

- [Diagnostics](diagnostics.md) · [Variational Autoencoder](vae.md) · [Mixture Density Network](mdn.md)
