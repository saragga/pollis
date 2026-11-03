# Neural ODEs for System Identification: Factsheet

The panel's models, inputs, software and results at a glance.

## Models

| Model | Vector field | Network | Trained parameters |
|---|---|---|---|
| **Neural ODE** | du/dt = nn(u) | n → hidden → hidden → n, `tanh` | Network weights |
| **Augmented** | dz/dt = nn(z), z = (u, a), a(0) = 0 | n + p → hidden → hidden → n + p, `tanh` | Network weights |
| **UDE** | du/dt = θ ⊙ u + nn(u) | n → hidden → n, `tanh` | Rates θ and network weights |

## Inputs

| Input | Default | Role |
|---|---|---|
| **Observed trajectory** | `obs_data` | n × m matrix of observed states; first column = initial condition |
| **Time points** | `tsteps` | One observation time per column, within [0, T] |
| **State dimension (n)** | 2 | Number of state variables |
| **Hidden units** | 32 | Width of each hidden layer |
| **Augmented dimensions** | 2 | Extra zero-initialised states (**Augmented** only) |
| **Time span end (T)** | 10.0 | End of the training interval |
| **Learning rate** | 0.01 | Adam step size |
| **Iterations** | 300 | Number of gradient steps |

## Training

| Component | Choice |
|---|---|
| Loss | Sum of squared errors over states and observation times |
| Optimiser | `OptimizationOptimisers.Adam(lr)` through Optimization.jl |
| Gradient of the loss | `Optimization.AutoEnzyme()` |
| Adjoint | `InterpolatingAdjoint(autojacvec=EnzymeVJP())` |
| ODE solver | `Tsit5()`, relative and absolute tolerance 10⁻³ |
| Result | `p_opt`, the fitted parameters, and `losses`, the loss at every iteration |

## Software

| Package | Role |
|---|---|
| DiffEqFlux.jl | `NeuralODE` layer, described by [Rackauckas, Innes, Ma, Bettencourt, White and Dixit (2019)](#ref-RIMBW...2019a) |
| OrdinaryDiffEq.jl | ODE solvers |
| SciMLSensitivity.jl | Adjoint sensitivity methods |
| Lux.jl, ComponentArrays.jl | Networks and their parameter vectors |
| Optimization.jl, OptimizationOptimisers.jl | Optimisation interface and Adam |
| Enzyme.jl | Reverse-mode automatic differentiation |
| Plots.jl | Figures |

## Key results

| Result | Source |
|---|---|
| A neural network can define the derivative of a hidden state, solved by a black-box ODE solver | [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) |
| Gradients by solving an adjoint ODE backwards in time | [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) |
| ODE trajectories cannot cross; augmenting the space with zeros lifts the restriction | [Dupont, Doucet and Teh (2019)](#ref-DDT2019a) |
| Differential equations defined in part by a universal approximator | [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) |
| Adam: adaptive first and second moment estimates | [Kingma and Ba (2015)](#ref-KB2015a) |
| ODE models for irregularly sampled time series | [Rubanova, Chen and Duvenaud (2019)](#ref-RCD2019a) |

## Further reading

| Topic | Work |
|---|---|
| Deep feedforward networks, regularisation and optimisation | [Goodfellow, Bengio and Courville (2016)](#ref-GBC2016a) |
| Nonlinear dynamics and chaos | [Strogatz (2015)](#ref-Str2015a) |

The notebooks of the panel, **Basic Neural ODE**, **Multivariate System** and **Universal Differential Equations**, work through the three models step by step on a spiral, a higher-dimensional noisy system and a model with known structure.

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

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Architecture](architecture.md) · [Training](training.md)
