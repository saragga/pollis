# Neural ODEs for System Identification: Assumptions

What the three models take for granted: autonomous dynamics, a fully observed state, a known initial condition at time zero, smooth vector fields, a squared-error fit, and, for the UDE, a known part of the physics.

## Autonomous dynamics

The vector field depends on the state alone, not on time: du/dt = nn(u) for **Neural ODE**, and likewise for the augmented and universal models. [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) use such a time-invariant function in their latent time-series model and note its consequence: given any state, the entire trajectory is uniquely defined, which lets the model extrapolate forwards or backwards in time.

A system driven by an external input that varies with time, or whose rules change during the observation window, lies outside this form unless the input is added as a state.

## A fully observed state

**Neural ODE** and **UDE** compare all n states of the solution with the n rows of **Observed trajectory**, so every state variable must be measured at every one of **Time points**. **Augmented** adds states that are never observed: they start at zero and are dropped before the comparison, so only the n observed rows enter the loss.

[Rubanova, Chen and Duvenaud (2019)](#ref-RCD2019a) treat the more general setting of a latent state observed through a decoder at irregular times, which the panel's models do not use.

## The initial condition

Every model starts its integration from the first column of **Observed trajectory**, taken as the exact state at time 0, as the tooltip of the input states. The solution is saved at **Time points**, so the first of them is expected to be 0, and the others to lie within [0, T].

Noise in the first observation is therefore carried into the whole fitted trajectory, since the initial condition is not estimated. **Initial-Condition Sensitivity** shows how much a change of 1% in u0 moves the fitted trajectory over time.

## Smooth vector fields

The networks use `tanh` activations and finite weights. [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) recall that, by Picard's existence theorem, the initial value problem then has a unique solution, because the network is uniformly Lipschitz continuous in the state.

Unique solutions imply that two trajectories of the same autonomous ODE cannot cross, the property on which [Dupont, Doucet and Teh (2019)](#ref-DDT2019a) build their analysis. An observed trajectory that passes through the same state twice, heading in different directions, calls for **Augmented**.

## A squared-error fit

The loss adds the squared differences between the fitted and observed values over all states and times, with equal weight for each. States measured on a larger scale contribute larger differences, so the fit follows them more closely unless the data are rescaled beforehand.

The loss uses no prior on the parameters and no penalty on the network's weights. The fitted parameters `p_opt` are the end point of **Iterations** steps of Adam from a random initialisation of the network, by the method of [Kingma and Ba (2015)](#ref-KB2015a).

## Known physics in the UDE

**UDE** assumes that part of the right-hand side is known in form. The code's placeholder, `known(u, theta) = theta .* u`, is a growth or decay term for each state with an unknown rate, and the comment invites replacing it with a model of one's own. The network then learns only what the known terms leave out.

[Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) illustrate the idea with a Lotka–Volterra model whose prey birth rate is known and whose predator decay is assumed linear, the interactions being left to the network.

## References

<a id="ref-CRBD2018a"></a>Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). Neural Ordinary Differential Equations. [doi:10.48550/arXiv.1806.07366](https://doi.org/10.48550/arXiv.1806.07366)

<a id="ref-DDT2019a"></a>Dupont, E., Doucet, A., & Teh, Y. W. (2019). Augmented Neural ODEs. [doi:10.48550/arXiv.1904.01681](https://doi.org/10.48550/arXiv.1904.01681)

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-RMMWZ...2020a"></a>Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A., & Edelman, A. (2020). Universal Differential Equations for Scientific Machine Learning. [doi:10.48550/arXiv.2001.04385](https://doi.org/10.48550/arXiv.2001.04385)

<a id="ref-RCD2019a"></a>Rubanova, Y., Chen, R. T. Q., & Duvenaud, D. (2019). Latent ODEs for Irregularly-Sampled Time Series. [doi:10.48550/arXiv.1907.03907](https://doi.org/10.48550/arXiv.1907.03907)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Architecture](architecture.md) · [Training](training.md)
