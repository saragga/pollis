# Feedforward Neural Networks — Factsheet

The Feedforward Neural Networks panel trains networks that map a fixed-length vector to an output, with no memory of earlier samples. One tab fits a target, and two tabs learn a short code of the inputs by reconstructing them.

## What the Feedforward Neural Networks Panel Does

| Item | Description |
|---|---|
| **Purpose** | Regression with a multilayer perceptron, compression by reconstruction, and sampling from a latent space |
| **Julia stack** | Flux.jl for the networks, MultivariateStats.jl for the PCA baseline, Plots.jl for the charts |
| **Models** | **MLP**, **Autoencoder**, **VAE** |
| **Input shape** | **Input data** as features by samples, one sample per column, and **Target variable** as outputs by samples in **MLP** |
| **Training** | Adam at learning rate 0.001, batches of 64, 100 epochs, through `Flux.train!` with shuffling |
| **Key choice** | Whether a target exists, then whether a point prediction, a code or a sampler is wanted |

The learning rate, batch size and epoch count are written in the code and have no inputs of their own.

## Which Inputs Each Feedforward Network Tab Uses

| Input | **MLP** | **Autoencoder** | **VAE** |
|---|---|---|---|
| **Input data** | Yes | Yes | Yes |
| **Target variable** | Yes | No | No |
| **input_size**, **hidden_size**, **num_layers** | Yes | Yes | Yes |
| **activation**, **dropout** | Yes | Yes | Yes |
| **Residual connections**, **Batch normalisation** | Yes | Yes | Yes |
| **latent_dim** | No | Yes | Yes |
| **Output head** | Yes | No | No |
| **output_size** | With **Standard** | No | No |
| **num_components** | With **MDN** | No | No |

**input_size** must equal the number of rows of **Input data**. In **Autoencoder** and **VAE**, **num_layers** counts the hidden blocks of each half.

## What Each Feedforward Network Tab Trains and Minimises

| Tab | Network | Loss in the code | Result |
|---|---|---|---|
| **MLP** with **Standard** | Hidden blocks, then a linear `Dense` output | Mean squared error, `Flux.mse` | Point prediction |
| **MLP** with **MDN** | Hidden blocks, then three `Dense` heads for weights, means and standard deviations | Negative log-likelihood of a Gaussian mixture | Conditional distribution of a scalar target |
| **Autoencoder** | Encoder and decoder, each with **num_layers** hidden blocks | Mean squared reconstruction error | Deterministic code |
| **VAE** | Encoder with mean and log-variance heads, then a decoder | Mean squared reconstruction error plus a KL term | Gaussian code and new samples |

No tab has a softmax output or a cross-entropy loss, so a classification target in **MLP** is fitted as regression on its coded values.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
