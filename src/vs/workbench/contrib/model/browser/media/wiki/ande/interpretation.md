# Interpretation

## What the Score Means
- **AutoEncoder**: the squared reconstruction error. Large means the point does not follow the patterns the network learned.
- **DeepSAD**: the distance from the latent centre. Large means the encoder places the point away from the normal data.
- **ESAD**: reconstruction error plus distance from the latent origin.

Scores are relative to one trained network. Compare them within a fit, not across fits or methods; convert to percentile ranks (**Normalise Scores**) before combining.

## Which Features Drive a Score?
For the autoencoder, the reconstruction error splits naturally by feature: compare each feature's input with its reconstruction (**Feature Attribution**). The features with the largest errors are the ones the network could not explain. For DeepSAD and ESAD, the attribution action shows each feature's scaled distance from the median, a simple first look.

## Semi-Supervised Scores
DeepSAD and ESAD are trained to push the **labelled** anomalies away, so those points will score high by construction. The useful output is the ranking of the **unlabelled** points: which of them look like the known anomalies.

## Caveat
A high score says "unlike the training data", not "wrong". Inspect the top points before acting on them.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
