# Neural ODEs for System Identification: Decision Guide

Which model fits the data and what is known about the system, which action answers a question, how to set the inputs, and when another panel of Pollis is the better place to start.

## Choosing a model

| Situation | Model | Why |
|---|---|---|
| Dynamics unknown, trajectories that do not cross | **Neural ODE** | A black-box vector field du/dt = nn(u) |
| Observed trajectories that cross, or a plain model that underfits | **Augmented** | Extra states, starting at zero, let the flow avoid crossings |
| Part of the physics known | **UDE** | Known terms with estimated rates, and a network for the rest |

[Dupont, Doucet and Teh (2019)](#ref-DDT2019a) report that their augmented models were, in their experiments, more stable to train, generalised better and reached lower losses with fewer parameters than plain Neural ODEs. [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) motivate universal differential equations by the small datasets of many sciences, in which prior structural knowledge constrains the model.

## Choosing an action

| Question | Action |
|---|---|
| Does the model follow the data? | **Predicted vs Observed**, **Phase Portrait** |
| Has training converged? | **Loss Curve** |
| What has the model missed? | **Residual Analysis** |
| Does it forecast beyond the fitted data? | **Held-Out Horizon**, **Extrapolation** |
| How does it respond to other starting points? | **Initial-Condition Sensitivity**, **Forward Simulation** |
| Is a neural model needed at all? | **vs Linear ODE** |
| What dynamics has it learned? | **Learned Vector Field**, **Lyapunov Estimate** |

## Choosing the inputs

**State dimension (n)** must match the number of rows of **Observed trajectory**; its tooltip suggests 2 for a spiral and 3 for a Lorenz-type system. **Hidden units** trades capacity against training time. **Augmented dimensions** sets the number of extra states, and its tooltip suggests 1 to n.

**Learning rate** is Adam's step size, for which [Kingma and Ba (2015)](#ref-KB2015a) suggest 0.001 on the problems they tested; the tooltip gives 1e-3 to 1e-2 as the typical range. **Iterations** sets the number of steps, 300 to start with. **Time span end (T)** must equal the last observation time, and the extrapolation actions integrate beyond it.

## Choosing the training method

The panel trains with Adam alone. The DiffEqFlux.jl tutorial on neural ODEs follows Adam with BFGS from Optim.jl, starting where Adam stopped. SciMLSensitivity.jl offers several adjoint methods besides `InterpolatingAdjoint`; [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) describe `QuadratureAdjoint`, which can be fastest with few states and many parameters, and `BacksolveAdjoint`, which uses the least memory.

[Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) show that solver tolerances trade speed for precision, and [Rackauckas, Innes, Ma, Bettencourt, White and Dixit (2019)](#ref-RIMBW...2019a) that the full suite of DifferentialEquations.jl solvers can be used inside neural networks. For time series observed at irregular times through a latent state, [Rubanova, Chen and Duvenaud (2019)](#ref-RCD2019a) propose Latent ODEs and ODE-RNNs.

## When to use another panel

| Goal | Panel |
|---|---|
| Parameters of an ODE whose form is known, with identifiability and uncertainty | **ODE Inference Methods** |
| Linear input–output models such as ARX, ARMAX and N4SID | **System Identification Methods** |
| Lyapunov exponents, fractal dimensions and recurrence of observed data | **Chaos Characterisation** |
| Sequence models such as LSTM and GRU | **Recurrent Neural Networks** |
| Curve fitting by nonlinear least squares | **Nonlinear Least Squares** |

## References

<a id="ref-CRBD2018a"></a>Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). Neural Ordinary Differential Equations. [doi:10.48550/arXiv.1806.07366](https://doi.org/10.48550/arXiv.1806.07366)

<a id="ref-DDT2019a"></a>Dupont, E., Doucet, A., & Teh, Y. W. (2019). Augmented Neural ODEs. [doi:10.48550/arXiv.1904.01681](https://doi.org/10.48550/arXiv.1904.01681)

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-RIMBW...2019a"></a>Rackauckas, C., Innes, M., Ma, Y., Bettencourt, J., White, L., & Dixit, V. (2019). DiffEqFlux.jl: A Julia Library for Neural Differential Equations. [doi:10.48550/arXiv.1902.02376](https://doi.org/10.48550/arXiv.1902.02376)

<a id="ref-RMMWZ...2020a"></a>Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A., & Edelman, A. (2020). Universal Differential Equations for Scientific Machine Learning. [doi:10.48550/arXiv.2001.04385](https://doi.org/10.48550/arXiv.2001.04385)

<a id="ref-RCD2019a"></a>Rubanova, Y., Chen, R. T. Q., & Duvenaud, D. (2019). Latent ODEs for Irregularly-Sampled Time Series. [doi:10.48550/arXiv.1907.03907](https://doi.org/10.48550/arXiv.1907.03907)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Architecture](architecture.md) · [Training](training.md)
