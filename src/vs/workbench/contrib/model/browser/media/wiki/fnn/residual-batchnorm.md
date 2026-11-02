# Residual & BatchNorm

**Residual connections** and **Batch normalisation** are two independent options of the Feedforward Neural Networks panel. Each changes the hidden block in all three tabs, and both aim to make a deep network easier to train.

## What Residual Connections Compute in a Feedforward Network

A residual block adds its input to its output: H(l+1) = f(H(l)) + H(l), where f is the hidden block, a `Dense` layer with **activation** followed by `Dropout`. The network then learns a change to its state instead of a whole new transformation, and a block can stay close to the identity by keeping f small. [He, Zhang, Ren and Sun (2016)](#ref-HZRS2016a) introduced the idea and reported that very deep image networks became easier to optimise. Their blocks hold two or three weight layers and end with a weight layer before the sum, so the panel's single-layer block is a simpler form.

## How Residual Connections Work in the Feedforward Panel

The option is the input **Residual connections**, with values **No** and **Yes**. The first hidden block of a stack changes the width from its input to **hidden_size**, so it has no skip, and each later block has one. At **num_layers** of 1, the option has no effect. In **Autoencoder** and **VAE**, the same holds for the encoder trunk and for the decoder trunk. With **relu**, f cannot be negative, so each residual block can only raise a unit's value and activations grow with depth. **gelu**, **leakyrelu**, **tanh** and **selu** can subtract. Dropout masks only the f branch, so the skip path always passes through whole.

## What Batch Normalisation Computes in a Feedforward Network

For each feature in a batch, batch normalisation computes x_norm = gamma * (x - mean) / sqrt(variance + eps) + beta, where gamma and beta are learned. [Ioffe and Szegedy (2015)](#ref-IS2015a) proposed it to reduce the shift in each layer's input distribution during training, and reported faster training and less sensitivity to initialisation. In training mode, the mean and variance come from the current batch, and running averages with momentum 0.1 are updated. In test mode, the running averages are used. So a network computes a different function in each mode.

## How Batch Normalisation Works in the Feedforward Panel

With **Batch normalisation** set to **Yes**, each hidden block becomes `BatchNorm`, then `Dense`, then `Dropout`, so normalisation comes before the weights and the activation. The first block therefore normalises the raw inputs, and in the **Autoencoder** and **VAE** decoders, the first block normalises the latent code. A final batch of one sample raises an error in current Flux versions, when the sample count leaves a remainder of 1 after division by 64. The reset inside **Train vs Validation Loss** sets all vector parameters to zero, including the scale gamma and the running variance, which `BatchNorm` otherwise starts at one.

## Where Residual Connections and Batch Normalisation Mislead

Neither option makes a poor model good, and in a shallow network either may do nothing useful. A better training loss does not imply a better validation loss. Batch normalisation ties each sample's output to its batch during training, so small batches give noisy statistics. A result from training mode differs from one in test mode: **Training Loss Curve**, **Learned Representation** and **Input Sensitivity** do not set test mode themselves, and the last two can also move the running averages. Running averages learned on one population fit another poorly, as happens under a shift in new data.

## What to Compare Residual and Normalised Networks With

Compare each option with the plain network of the same **hidden_size** and **num_layers**, using **Train vs Validation Loss**, and change one option at a time. Repeat the comparison, since the unseeded split and weights can move the result by more than the option does. A comparison at a depth of 2 or 3 may show no gain, and at greater depth a clear one. Comparing with a shallower plain network also tells whether depth was needed at all. **Residual connections** adds no weights, while **Batch normalisation** adds two learned numbers per feature in each block.

## References

<a id="ref-HZRS2016a"></a>He, K., Zhang, X., Ren, S. and Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition*, 770–778. [doi:10.1109/CVPR.2016.90](https://doi.org/10.1109/CVPR.2016.90)

<a id="ref-IS2015a"></a>Ioffe, S. and Szegedy, C. (2015). Batch normalization: accelerating deep network training by reducing internal covariate shift. arXiv:1502.03167. [doi:10.48550/arXiv.1502.03167](https://doi.org/10.48550/arXiv.1502.03167)

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
