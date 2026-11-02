# State Space Models — Factsheet

A state space model describes a series through a hidden state with its own dynamics and an observation that reads the state with noise. This panel simulates such models from parameters you set, and in **Nonlinear SSM** it also runs a filter over the simulated observations.

## What the State Space Models Panel Does

| Item | Description |
|---|---|
| **Purpose** | Simulate linear and nonlinear state space models from known parameters, and study how the noise settings shape the series |
| **Julia stack** | StateSpaceModels.jl for the linear tabs, LowLevelParticleFilters.jl for the nonlinear tab, with Plots.jl, StatsBase.jl and Distributions.jl |
| **Models** | Local level, local linear trend, nonlinear f and h with additive Gaussian noise, and a time-invariant linear model with one observed series |
| **Input shape** | Settings and matrices, not data: every series is generated inside the code |
| **Not included** | Estimation of parameters from data, and any Kalman filter or smoother in the two linear tabs |
| **Key choice** | Whether the structure is a standard trend, a nonlinear system or a matrix form of your own |

## What Differs Between the Tabs of the State Space Models Panel

| Tab | Model set through | How the path is drawn | Filter run |
|---|---|---|---|
| **Linear Gaussian** | **Model** and up to three noise standard deviations | `simulate` from StateSpaceModels.jl, with a zero starting mean | None |
| **Nonlinear SSM** | **Dynamics f(x,u,p,t)**, **Measurement h(x,u,p,t)** and two noise standard deviations | The panel's own loop, with a standard Normal starting state | **Unscented Kalman Filter** or **Particle Filter**, through `forward_trajectory` |
| **Custom SSM** | **T Matrix (m x m)**, **Z Matrix (p x m)**, **Q Matrix (m x m)** and **H Matrix (p x p)** | `simulate`, with a zero starting mean | None |

## What Each Next Step of the State Space Models Panel Produces

| Group | Next Step | Output |
|---|---|---|
| Visualise | **Plot Simulated Series** | The observations over time |
| Visualise | **Plot State Path** | The observations with the noise-free signal on top |
| Diagnose | **Autocorrelation** | Autocorrelation of the observations, up to lag 40 |
| Diagnose | **Distribution** | Histogram of the observations, with 30 bins |
| Predict | **Extend Forward** | One random continuation of 50 steps |
| Predict | **Multiple Scenarios** | 10 independent paths from the start |
| Compare | **Signal-to-Noise Ratio** | Ratio of sample variances, and the ratio q in **Linear Gaussian** |
| Compare | **Noise Sensitivity** | Paths at observation noise 0.05, 0.1, 0.2 and 0.5 |
| Interpret | **Decompose Components** | The hidden states, and the observation noise |
| Interpret | **Marginal Variance** | Sample variances of y, the signal and y minus the signal |

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
