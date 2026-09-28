# Overview

The three methods share one architecture, an **encoder** that compresses each observation into a small latent vector and (for training) a **decoder** that maps it back. They differ in what the network is trained to do and how the score is computed.

## AutoEncoder
Trained to **reconstruct** its input through a narrow bottleneck. It learns the patterns shared by most of the data, so typical points are reconstructed well and anomalies badly. Score: reconstruction error. Needs no labels. See [AutoEncoder](autoencoder.md).

## DeepSAD
Deep Semi-Supervised Anomaly Detection first pretrains the autoencoder, then trains the encoder so that normal points land **close to a centre** in latent space while the labelled anomalies are pushed **away** from it. Score: distance to the centre. See [DeepSAD](deepsad.md).

## ESAD
End-to-End Semi-Supervised Anomaly Detection trains encoder, decoder and a second encoder **in a single stage**, combining reconstruction error, distance to the origin and consistency between the two encoders. Score: reconstruction error plus latent distance. See [ESAD](esad.md).

## Common Workflow

1. Scale every feature to [0, 1] (the decoder ends in a sigmoid).
2. Build an encoder and decoder with `MLPAutoEncoder`.
3. Fit the detector; for DeepSAD and ESAD pass labels ("normal" or "outlier").
4. Flag the top fraction of scores and check stability across seeds.

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
