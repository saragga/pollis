# Factsheet

A point process describes when events happen, through an intensity that gives their instantaneous rate. The panel fits five models of event times on a window [0, T], from a constant rate to a network of events that trigger one another.

## What the Point Processes Panel Does

| Item | Detail |
|---|---|
| Purpose | Fit an intensity to event times, test the fit, forecast from it, and measure how far events trigger one another |
| Julia stack | PointProcesses.jl, HawkesProcesses.jl, NetworkHawkesProcesses.jl, KernelDensity.jl, Distributions.jl, QuadGK.jl, HypothesisTests.jl, Plots.jl |
| Tabs | **Poisson**, **Inhomogeneous**, **Cox**, **Hawkes**, **Network Hawkes** |
| Input shape | **Event Times**, a vector of times in [0, T], and for **Network Hawkes** also **Event Nodes**, a vector of node numbers |
| Data switch | The default name `events` simulates an example, and any other name reads your own vector |
| Key choice | Whether events arrive independently, follow a hidden rate, or trigger later events |

## How the Tabs of the Point Processes Panel Differ

| Tab | Intensity | Estimation | Package |
|---|---|---|---|
| **Poisson** | Constant rate | Maximum likelihood, N / T | PointProcesses.jl |
| **Inhomogeneous** | Smooth function of time | Edge-corrected kernel estimate | KernelDensity.jl |
| **Cox** | Log-Gaussian random path, plus a self-excitation weight W | Gibbs sampling with elliptical slice steps | NetworkHawkesProcesses.jl |
| **Hawkes** | Constant baseline plus exponential excitation | Gibbs sampling with latent parents | HawkesProcesses.jl |
| **Network Hawkes** | Constant baseline per node plus excitation along links | Gibbs sampling with latent parents and links | NetworkHawkesProcesses.jl |

## What the Inputs of the Point Processes Panel Control

| Input | Default | Tabs | Role |
|---|---|---|---|
| **Time Horizon (T)** | 100 | All | End of the observation window |
| **Bandwidth (h)** | 5 | **Inhomogeneous** | Standard deviation of the Gaussian kernel |
| **GP Variance (sigma2)**, **Length Scale (l)** | 1.0, 10.0 | **Cox** | Fixed hyperparameters of the prior path |
| **Kernel** | **Squared Exp.** | **Cox** | Roughness of the prior path, the other option being **Ornstein-Uhlenbeck** |
| **Gibbs Iterations** | 2000 | **Cox**, **Hawkes**, **Network Hawkes** | Sampler sweeps, with the first quarter discarded |
| **Nodes (N)** | 3 | **Network Hawkes** | Number of nodes |

**Rate (lambda)**, **Log Baseline (mu0)**, **Baseline (mu)**, **Excitation (alpha)** and **Decay (beta)** set only the simulated example, and do not enter a fit to your own events.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
