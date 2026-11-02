# Factsheet

The Autoencoders panel trains a small neural network, in Flux.jl, to rebuild a numeric table through a narrow bottleneck. The **Autoencoder** tab holds one fixed code for each observation, and the **VAE** tab holds a Gaussian distribution over codes.

## What the Autoencoders Panel Does

| Item | Description |
|---|---|
| **Purpose** | Nonlinear dimension reduction of a table, anomaly flags from reconstruction error, decoded synthetic observations |
| **Julia stack** | Flux.jl for the layers and training; Plots.jl for the Next Steps |
| **Models** | **Autoencoder** and **VAE** tabs |
| **Input shape** | **Feature Matrix** is n_samples × n_features; the code standardises its columns and transposes it to features × samples |
| **Architecture** | One relu hidden layer of **Hidden Units** in the encoder and one in the decoder; defaults of 64 units and 2 **Latent Dimensions** |
| **Training** | Adam, by default with **Learning Rate** 0.001, **Batch Size** 32 and **Epochs** 100; the random seed is set to 1 at the start of each training run |
| **Key choice** | How many **Latent Dimensions** the bottleneck keeps |

## How the Autoencoder and VAE Tabs Differ

| Feature | **Autoencoder** | **VAE** |
|---|---|---|
| Encoder output | One code of **Latent Dimensions** values | A mean and a log-variance, so twice as many values |
| Loss | Mean squared error over all matrix entries | Squared error summed over features, plus **beta (KL weight)** times the KL divergence to N(0, I), averaged over observations |
| What `Z` holds | The codes | The posterior means |
| **beta (KL weight)** | Not used | Used, default 1.0 |
| **Latent Space Statistics** | Mean, standard deviation, minimum and maximum of each dimension | The same, plus the mean KL divergence of each dimension |
| **Generate Samples** draws codes from | A Gaussian fitted to `Z` | The N(0, I) prior |

## Which Results the Autoencoders Panel Keeps for the Next Steps

A run leaves `model`, the latent codes `Z` (n × k), the reconstruction `X_hat` (n × p) and the loss history `losses`. `X_hat` stays on the standardised scale, whereas `mu_x` and `sd_x` hold the column means and standard deviations used for the scaling. The function `prep` applies that same scaling to new rows, and **Encode New Data** relies on it. Only **Encode New Data** looks beyond the training rows; every other check in the Next Steps reads the rows the network trained on.

## See Also

- [Overview](overview.md) · [Autoencoder](ae.md) · [Variational Autoencoder](vae.md)
