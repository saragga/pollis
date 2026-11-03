# Neural ODEs for System Identification: Overview

**Neural ODEs for System Identification** learns the continuous-time dynamics of a system from an observed trajectory, with a neural network as the right-hand side of an ordinary differential equation, through DiffEqFlux.jl and the SciML ecosystem.

## System identification with ODEs

A dynamical system with state u(t) often obeys an ODE du/dt = f(u), and identifying the system means recovering f from observations of u at a set of times. When the form of f is unknown, a neural network can stand in for it. [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) introduced this family of models, which parameterise the derivative of a hidden state with a neural network and compute the output with a black-box ODE solver.

Continuously defined dynamics can take in data that arrive at arbitrary times, unlike recurrent networks that discretise the intervals, as the same authors note. [Rubanova, Chen and Duvenaud (2019)](#ref-RCD2019a) build on this for time series with non-uniform intervals between observations.

## Three models

| Model | Vector field | When |
|---|---|---|
| **Neural ODE** | du/dt = nn(u) | Dynamics unknown, trajectories that do not cross |
| **Augmented** | Dynamics in n + p states, the extra ones starting at zero | Observed trajectories that cross, or a plain model that underfits |
| **UDE** | du/dt = known(u, θ) + nn(u) | Part of the physics known |

The augmented model follows [Dupont, Doucet and Teh (2019)](#ref-DDT2019a), who show that Neural ODEs cannot represent some simple functions because their trajectories cannot cross, and solve the ODE in a larger space. The UDE follows [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a), who define universal differential equations as differential equations defined in full or in part by a universal approximator.

## The software

DiffEqFlux.jl, described by [Rackauckas, Innes, Ma, Bettencourt, White and Dixit (2019)](#ref-RIMBW...2019a) as a library for fusing neural networks and differential equations, provides `NeuralODE`. OrdinaryDiffEq.jl solves the ODEs with `Tsit5()`, Lux.jl defines the networks, ComponentArrays.jl holds their parameters, and SciMLSensitivity.jl computes the gradients by adjoint sensitivity, with Enzyme.jl for the vector–Jacobian products. Optimization.jl and OptimizationOptimisers.jl run Adam, the method of [Kingma and Ba (2015)](#ref-KB2015a).

## The demo data

When no `obs_data` is defined in the session, every model simulates a damped cubic spiral, du/dt = Aᵀu³ with A = [−0.1 2.0; −2.0 −0.1], from u(0) = (2, 0) at 40 equally spaced times up to **Time span end (T)**. The system is the one of the DiffEqFlux.jl tutorial on neural ODEs, and requires **State dimension (n)** = 2.

Data of one's own replace it through **Observed trajectory**, an n × m matrix whose first column is the initial condition, and **Time points**, one time per column.

## How the panel is organised

**State dimension (n)**, **Hidden units** and, for the augmented model, **Augmented dimensions** set the size of the model; **Time span end (T)**, **Learning rate** and **Iterations** the training.

The actions fall into five groups: Visualise plots the fit, the phase portrait and the loss curve; Diagnose examines the residuals, a held-out horizon and the sensitivity to the initial condition; Predict simulates from a new initial condition and beyond the training span; Compare sets the model against a linear ODE; and Interpret draws the learned vector field and estimates a Lyapunov exponent. [Goodfellow, Bengio and Courville (2016)](#ref-GBC2016a) and [Strogatz (2015)](#ref-Str2015a) give background on deep learning and on nonlinear dynamics.

## References

<a id="ref-CRBD2018a"></a>Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). Neural Ordinary Differential Equations. [doi:10.48550/arXiv.1806.07366](https://doi.org/10.48550/arXiv.1806.07366)

<a id="ref-DDT2019a"></a>Dupont, E., Doucet, A., & Teh, Y. W. (2019). Augmented Neural ODEs. [doi:10.48550/arXiv.1904.01681](https://doi.org/10.48550/arXiv.1904.01681)

<a id="ref-GBC2016a"></a>Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press. [deeplearningbook.org](https://www.deeplearningbook.org/)

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-RIMBW...2019a"></a>Rackauckas, C., Innes, M., Ma, Y., Bettencourt, J., White, L., & Dixit, V. (2019). DiffEqFlux.jl: A Julia Library for Neural Differential Equations. [doi:10.48550/arXiv.1902.02376](https://doi.org/10.48550/arXiv.1902.02376)

<a id="ref-RMMWZ...2020a"></a>Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A., & Edelman, A. (2020). Universal Differential Equations for Scientific Machine Learning. [doi:10.48550/arXiv.2001.04385](https://doi.org/10.48550/arXiv.2001.04385)

<a id="ref-RCD2019a"></a>Rubanova, Y., Chen, R. T. Q., & Duvenaud, D. (2019). Latent ODEs for Irregularly-Sampled Time Series. [doi:10.48550/arXiv.1907.03907](https://doi.org/10.48550/arXiv.1907.03907)

<a id="ref-Str2015a"></a>Strogatz, S. H. (2015). *Nonlinear Dynamics and Chaos* (2nd ed.). Westview Press.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Architecture](architecture.md) · [Training](training.md)
