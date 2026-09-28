# Learning-Based Anomaly Detection — Factsheet

**Learning-based anomaly detection** trains a neural network on the data and scores each observation by how poorly it fits what the network learned. It captures nonlinear structure that distance-based detectors miss.

| | |
|---|---|
| **Purpose** | Find anomalies in data with complex, nonlinear structure |
| **Input** | A numeric matrix, observations in rows, scaled to [0, 1] |
| **Core packages** | [OutlierDetectionNetworks.jl](https://github.com/OutlierDetectionJL/OutlierDetectionNetworks.jl), [OutlierDetection.jl](https://github.com/OutlierDetectionJL/OutlierDetection.jl), [Flux.jl](https://github.com/FluxML/Flux.jl) |
| **Methods** | AutoEncoder (unsupervised), DeepSAD and ESAD (semi-supervised) |
| **Output** | One anomaly score per observation; higher means more unusual |
| **Key choices** | Network size, latent size, number of epochs |

## When to Use

- The data has **many features** or curved, nonlinear structure.
- There are **enough observations** to train a network (hundreds at the very least, ideally thousands).
- A few **known anomalies** are available (DeepSAD, ESAD) and you want to use them.

## What It Is Not

Neural detectors are harder to tune and explain than proximity methods, and their scores change with the random seed. On small tabular data, the KNN and LOF detectors in Proximity-Based Outlier Detection are often as good and much simpler.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [AutoEncoder](autoencoder.md)
