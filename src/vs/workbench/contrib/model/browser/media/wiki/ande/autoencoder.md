# AutoEncoder

An **autoencoder** is a neural network trained to reproduce its input through a narrow **bottleneck**. Because it can only keep a few numbers per observation, it learns the patterns most of the data shares. Anomalies do not follow those patterns and are reconstructed badly.

## Construction
```julia
using OutlierDetection, OutlierDetectionNetworks, Flux
using OutlierDetectionNetworks.Templates: MLPAutoEncoder

encoder, decoder = MLPAutoEncoder(size(Xs, 1), 2, [32, 16]; bias = true)
detector = AEDetector(encoder = encoder, decoder = decoder, epochs = 50, opt = Adam(1e-3))
model, scores = OutlierDetection.fit(detector, Xs; verbosity = 0)
```
`Xs` holds the scaled data with observations in columns. `MLPAutoEncoder(inputs, latent, hidden)` builds a dense encoder with the given hidden widths and a mirrored decoder.

## Score
The anomaly score is the **reconstruction error**, the squared difference between each input and its reconstruction.

## Tuning
- **Latent size**: smaller forces more compression and sharper contrast, but too small loses normal structure too.
- **Hidden layers**: wider layers fit more complex data but need more observations.
- **Epochs**: enough for the loss to level off; many more lets the network start reconstructing anomalies.

## Strengths and Limits
- Unsupervised and flexible; the per-feature error explains **which features** are unusual.
- Results depend on the random seed and on training length; check stability.

## See Also
- [DeepSAD](deepsad.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
