# Factsheet

The Normalising Flows panel fits a multivariate density to a table by maximum likelihood, in Flux.jl. Each tab pushes the data through a stack of invertible steps towards a standard normal distribution, and reads the log-density from the change of variables.

## What the Normalising Flows Panel Does

| Item | Description |
|---|---|
| **Purpose** | Multivariate density estimation, and estimation of dependence on the normal-score scale |
| **Julia stack** | Flux.jl for networks and training; Bijectors.jl for the splines of **Neural Spline**; Distributions.jl for the probit step and the Gaussian baseline; Plots.jl for the Next Steps; PollisDatasets.jl for the default **Input data** |
| **Models** | **RealNVP**, **MAF** and **Neural Spline** tabs |
| **Input shape** | **Input data** is D × n, one sample per column; **input_dim** must equal D |
| **Target** | **Joint density p(x)** or **Copula c(u)**, in every tab |
| **Base distribution** | Standard normal N(0, I) |
| **Training** | Adam with learning rate 0.001, batches of 64, 100 epochs; all fixed in the code |
| **Key choice** | How flexible each step is, against how many observations support it |

## How the Three Normalising Flow Tabs Differ

| Feature | **RealNVP** | **MAF** | **Neural Spline** |
|---|---|---|---|
| Flow step | Affine coupling | Masked autoregressive | Rational-quadratic spline coupling |
| Networks per step | Two, s and t | One masked network | One |
| Hidden activation | tanh | tanh | relu |
| Between steps | The halves swap roles | The variable order reverses | The halves swap roles |
| **dropout** | Before each network's output | Not used by the masked network | Before the network's output |
| **num_bins** | Not used | Not used | Segments K, default 8 |
| Parameters at the defaults with ten variables | 286,800 | 164,000, masked weights included | 256,920 |

Other defaults are **num_flows** 8, **hidden_size** 128, **num_layers** 2 and **dropout** 0.0.

## How the Normalising Flows Panel Runs

Every tab codes the direction from data to latent values, which gives the log-density of each column of **Input data**. Drawing samples runs the steps in the opposite direction, which each of the three methods allows. With **Joint density p(x)**, **Input data** reach the flow as given, so variables on very different scales are best standardised first. **input_dim** is the number of rows of **Input data**. Training starts from random weights, so two runs give slightly different results.

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Copula Estimation](copula.md)
