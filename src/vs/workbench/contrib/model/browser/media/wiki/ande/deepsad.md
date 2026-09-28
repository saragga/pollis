# DeepSAD

**Deep Semi-Supervised Anomaly Detection** (Ruff et al., 2020) extends Deep SVDD (Ruff et al., 2018). It learns a latent space in which normal data gathers around a **centre**, and uses a small set of labelled anomalies to push anomalies away from it.

## Construction
```julia
using OutlierDetection, OutlierDetectionNetworks, Flux
using OutlierDetectionNetworks.Templates: MLPAutoEncoder

y = fill("normal", size(X, 1)); y[anom_idx] .= "outlier"
encoder, decoder = MLPAutoEncoder(size(Xs, 1), 2, [32, 16]; bias = true)
detector = DSADDetector(encoder = encoder, decoder = decoder, epochs = (10, 50), eta = 1)
model, scores = OutlierDetection.fit(detector, Xs, to_categorical(y); verbosity = 0)
```

## How It Works
1. **Pretraining** (first number in `epochs`): the encoder and decoder are trained as an autoencoder. The centre is then fixed at the mean latent vector.
2. **Training** (second number): the decoder is dropped. The encoder is trained to pull normal and unlabelled points **towards** the centre and to push labelled anomalies **away** (their loss is the inverse distance).
3. **Score**: the distance of a point's latent vector from the centre.

## Parameters
- **`eta`**: weight of the labelled points in the loss. Above 1 trusts the labels more than the unlabelled data.
- **`epochs = (pretrain, train)`**: the two training stages.

## Labels in Practice
Label only the rows you know to be anomalies as "outlier" and everything else as "normal". The current package version fails when labels contain `missing`, so the unlabelled rows are marked "normal", which is also how the method treats them.

## See Also
- [ESAD](esad.md) · [AutoEncoder](autoencoder.md) · [Decision Guide](decision-guide.md)
