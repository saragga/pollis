# Neural ODEs for System Identification: Interpretation

How to read what the fitted model says about the system: simulations from new starting points and beyond the data, the comparison with a linear ODE, the learned vector field, the estimated rates of the UDE, and the Lyapunov estimate.

## Forward simulation

**Forward Simulation** starts the fitted model from a new initial condition, the first observation plus random normal noise with standard deviation 0.5 in every state, and integrates it from t0 at 200 points up to T. The new trajectory shows what the learned dynamics do from a state the training never started from.

The noise is drawn from a generator seeded with **Random Seed**, so a run is repeated exactly with the same seed, and another seed starts from another point. A trajectory from the new start that behaves like the observed one, for instance spiralling towards the same point, is consistent with dynamics learned around the data rather than along one path alone.

## Extrapolation

**Extrapolation** integrates the model from u0 up to 2T, twice the training horizon, and plots the observations and a dashed line at the end of training. [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) point out that, with a time-invariant vector field, a trajectory can be extended arbitrarily far forwards or backwards in time.

Past T, the model has no data to follow, and the curve shows the behaviour the learned field implies there: decay to a fixed point, a cycle, growth or drift. [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) show how the equations they recover for a Lotka–Volterra model extrapolate beyond the training data.

## Against a linear ODE

**vs Linear ODE** fits both the model and the linear ODE du/dt = A u, starting from A = 0, on the first 80% of the time points, with the same optimiser and number of iterations, and prints the squared error of each on the last 20%, with the fitted matrix A. As the code's comment says, the lower held-out error wins.

A linear ODE has a fixed structure: its solution is u(t) = exp(At) u0, so its behaviour, decay, growth or rotation, is set by the eigenvalues of A. A neural model that does no better than the linear one on the held-out part adds no predictive value on these data.

## The learned vector field

**Learned Vector Field** draws arrows of du/dt for the first two states. For **Neural ODE** and **UDE**, the arrows sit on a 15 × 15 grid over the range of the observations, with any further states held at their mean. For **Augmented**, the velocity of the observed states depends on the extra states too, so the arrows are drawn at 60 points along the fitted path, with the extra states at their fitted values.

The field shows where the system moves from each state: arrows pointing inwards around a point mark an attracting fixed point, arrows circulating around it a rotation. Away from the observations, the field reflects what the network extrapolates rather than what the data show.

## The rates of the UDE

For **UDE**, the fitted parameter vector `p_opt` contains `theta`, the estimated rate of each state in the known term θ ⊙ u, beside the weights of the network. A negative rate marks decay of that state, a positive one growth.

The network can also represent linear terms, so part of a growth or decay may end up in the network rather than in θ. [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) go on from a trained network to symbolic regression, in order to arrive at symbolic equations for the missing terms.

## Lyapunov estimate

**Lyapunov Estimate** integrates the model from u0 and from u0 + 10⁻⁴ up to 2T at tight tolerances, and takes the least-squares slope of the log distance between the two trajectories over the phase in which the distance is past the start and still under 10% of the size of the visited region. The slope is a rough estimate of the largest Lyapunov exponent, the average exponential rate at which nearby trajectories separate.

The output prints the estimate, the number of points in the fit, and a reading: converging trajectories for a slope that is zero or negative, too few points when the separation saturates too soon, and separating trajectories otherwise, with a note that an autonomous ODE in two dimensions cannot be chaotic. **Augmented** is integrated in n + p dimensions, which the reading takes into account.

## References

<a id="ref-CRBD2018a"></a>Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). Neural Ordinary Differential Equations. [doi:10.48550/arXiv.1806.07366](https://doi.org/10.48550/arXiv.1806.07366)

<a id="ref-RMMWZ...2020a"></a>Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A., & Edelman, A. (2020). Universal Differential Equations for Scientific Machine Learning. [doi:10.48550/arXiv.2001.04385](https://doi.org/10.48550/arXiv.2001.04385)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Architecture](architecture.md) · [Training](training.md)
