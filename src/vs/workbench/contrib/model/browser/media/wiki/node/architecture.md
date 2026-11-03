# Neural ODEs for System Identification: Architecture

How the three models build their vector fields: a network that is the whole right-hand side of the ODE, the same network in a larger state space, and known terms with a network for what is missing.

## From residual networks to ODEs

[Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) start from networks that update a hidden state layer by layer, h(t+1) = h(t) + f(h(t), θ), and read each update as an Euler step of a continuous transformation. Taking more layers and smaller steps, they arrive at an ODE whose right-hand side is a neural network:

dh/dt = f(h(t), t, θ)

The output is the solution of this initial value problem at a later time, computed by a black-box ODE solver that evaluates f wherever it needs to. For system identification, the state is the observed system itself: the network is the unknown vector field, and the solution at the observation times is compared with the data.

## Neural ODE

**Neural ODE** sets du/dt = nn(u), with no explicit dependence on time. The network is a Lux.jl `Chain` of three `Dense` layers: from the n states to **Hidden units** with `tanh`, a second hidden layer of the same width with `tanh`, and a linear layer back to the n states. The DiffEqFlux.jl documentation defines a neural ODE in the same terms, as an ODE whose derivative function is a neural network, and builds it with `NeuralODE`.

[Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) note that, by Picard's existence theorem, the initial value problem has a unique solution if the network has finite weights and uses Lipschitz nonlinearities, such as `tanh`. Because the field does not depend on time, any state determines the entire trajectory through it.

## Augmented Neural ODE

The uniqueness of trajectories limits what an ODE flow can represent. [Dupont, Doucet and Teh (2019)](#ref-DDT2019a) show that trajectories of an ODE cannot cross each other, so the flow of a Neural ODE is a homeomorphism that preserves the topology of its input space, and there are simple functions it cannot represent. Their remedy is to solve the ODE in a larger space:

d/dt [h(t), a(t)] = f([h(t), a(t)], t),  [h(0), a(0)] = [x, 0]

Every data point is concatenated with a vector of zeros, and the extra dimensions let the flow lift points apart instead of forcing trajectories through one another.

**Augmented** follows this construction. The network maps n + **Augmented dimensions** states to themselves, the extra states start at zero, and only the first n states of the solution are compared with the data. In the observed states alone, two passes through the same point can then move in different directions, since the extra states can differ between them.

## Universal differential equation

[Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) define universal differential equations as differential equations defined in full or in part by a universal approximator, such as a neural network, and note that a neural ODE u′ = NN(u, t) is the special case defined in full by a network. Their Lotka–Volterra example keeps the known birth rate of the prey and an assumed linear decay of the predator, and leaves a network U to learn the unknown interactions:

ẋ = αx + U₁(θ, x, y),  ẏ = −θ₁y + U₂(θ, x, y)

**UDE** has the same structure: du/dt = θ ⊙ u + nn(u), with one estimated rate per state, starting at zero, and a network with a single hidden layer for the missing terms. The comment in the code marks `known(u, theta)` as the place for a model of one's own.

## Width, depth and activation

**Hidden units** sets the width of every hidden layer, and its tooltip notes that larger values add capacity but slow training. The plain and augmented models use two hidden layers, and the UDE network a single one beside its known terms.

The DiffEqFlux.jl tutorial observes that incorporating structure into the equations, such as the cubic nonlinearity of its spiral, can reduce the size of the network and the training time, provided a good guess is known. [Goodfellow, Bengio and Courville (2016)](#ref-GBC2016a) treat feedforward networks and their training at textbook length, and [Strogatz (2015)](#ref-Str2015a) the dynamics of nonlinear ODEs.

## References

<a id="ref-CRBD2018a"></a>Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). Neural Ordinary Differential Equations. [doi:10.48550/arXiv.1806.07366](https://doi.org/10.48550/arXiv.1806.07366)

<a id="ref-DDT2019a"></a>Dupont, E., Doucet, A., & Teh, Y. W. (2019). Augmented Neural ODEs. [doi:10.48550/arXiv.1904.01681](https://doi.org/10.48550/arXiv.1904.01681)

<a id="ref-GBC2016a"></a>Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press. [deeplearningbook.org](https://www.deeplearningbook.org/)

<a id="ref-RMMWZ...2020a"></a>Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A., & Edelman, A. (2020). Universal Differential Equations for Scientific Machine Learning. [doi:10.48550/arXiv.2001.04385](https://doi.org/10.48550/arXiv.2001.04385)

<a id="ref-Str2015a"></a>Strogatz, S. H. (2015). *Nonlinear Dynamics and Chaos* (2nd ed.). Westview Press.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Training](training.md)
