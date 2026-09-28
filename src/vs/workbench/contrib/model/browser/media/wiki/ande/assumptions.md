# Assumptions

## Scaled Inputs
The template decoder ends in a **sigmoid**, so it can only output values between 0 and 1. Scale every feature to [0, 1] first, and apply the **same** scaling (the training minimum and maximum) to new data.

```julia
lo, hi = minimum(X, dims=1), maximum(X, dims=1)
Xs = Float32.(permutedims((X .- lo) ./ (hi .- lo)))
```

## Mostly Normal Training Data
The networks learn what is common. If anomalies are frequent, the autoencoder learns to reconstruct them too and their scores shrink. The methods assume anomalies are a **small minority** of the training data.

## Enough Data
Each network has hundreds to thousands of weights. With too few observations it memorises the training set, and every point, anomaly or not, is reconstructed well.

## A Bottleneck That Forces Compression
The latent size must be **well below** the number of features. If it is not, the network can learn an identity mapping and reconstruct anomalies as easily as normal points.

## Labels Mean What They Say (DeepSAD, ESAD)
Labelled anomalies should be real anomalies of the kind you want to find. The semi-supervised methods treat every unlabelled row as normal during training, so mislabelled or unrepresentative anomalies distort the boundary.

## See Also
- [Diagnostics](diagnostics.md) · [Overview](overview.md)
