# Factsheet

The Normalising Flows panel fits a multivariate density to a table by maximum likelihood, in Flux.jl. Each tab pushes the data through a stack of invertible steps towards a standard normal distribution, and reads the log-density from the change of variables.

## What the Normalising Flows Panel Does

| Item | Description |
|---|---|
| **Purpose** | Multivariate density estimation, and estimation of dependence on the normal-score scale |
| **Julia stack** | Flux.jl for networks and training; Bijectors.jl for the splines of **Neural Spline**; Distributions.jl for the probit step and the Gaussian baseline; Plots.jl for the Next Steps |
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
| **dropout** | Used | Ignored: the code has no dropout layer | Used |
| **num_bins** | Not used | Not used | Segments K, default 8 |
| Parameters at the defaults with ten variables | 286,800 | 164,000, masked weights included | 256,920 |

Other defaults are **num_flows** 8, **hidden_size** 128, **num_layers** 2 and **dropout** 0.0.

## What the Normalising Flows Panel Leaves Out

Every tab codes only the direction from data to latent values, so the panel has no inverse and no Next Step that draws samples, although the methods allow sampling. With **Joint density p(x)**, the code does not scale custom **Input data**. No check confirms that **input_dim** equals the number of rows of **Input data**. Results differ between runs, as no random seed is set.

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Copula Estimation](copula.md)
