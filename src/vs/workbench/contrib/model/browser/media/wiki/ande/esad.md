# ESAD

**End-to-End Semi-Supervised Anomaly Detection** (Huang et al., 2021) trains the whole model in **one stage**, instead of DeepSAD's pretraining followed by training.

## Construction
```julia
using OutlierDetection, OutlierDetectionNetworks, Flux
using OutlierDetectionNetworks.Templates: MLPAutoEncoder

y = fill("normal", size(X, 1)); y[anom_idx] .= "outlier"
encoder, decoder = MLPAutoEncoder(size(Xs, 1), 2, [32, 16]; bias = true)
detector = ESADDetector(encoder = encoder, decoder = decoder, epochs = 50)
model, scores = OutlierDetection.fit(detector, Xs, to_categorical(y); verbosity = 0)
```

## How It Works
The model has an encoder, a decoder and a **second encoder** applied to the reconstruction. The loss combines three terms:
- **Reconstruction**: normal points should be reconstructed well.
- **Latent norm**: normal points should map close to the origin, labelled anomalies far from it (inverse distance), with its own weight.
- **Consistency**: the two encoders should agree, with its own weight.

The **score** adds the reconstruction error to the distance of the latent vector from the origin.

## Parameters
- **Loss weights**: the latent-norm and consistency terms each have a weight keyword (both default to 1).
- **`noise`**: an optional function that perturbs the input of anomalies during training.

## Stability
The latent-norm term divides by the latent distance. If a point maps exactly to the origin, training fails with a NaN loss. Use `bias = true` and hidden layers of at least 16 units, as in the example, to make this unlikely.

## See Also
- [DeepSAD](deepsad.md) · [AutoEncoder](autoencoder.md) · [Diagnostics](diagnostics.md)
