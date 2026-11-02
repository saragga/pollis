# State Space Models — Nonlinear SSM

The **Nonlinear SSM** tab simulates a system from two functions you write, and then filters the simulated observations with either an unscented Kalman filter or a particle filter. The filter is told the true model, so the tab shows filtering in its most favourable setting.

## What Model the Nonlinear SSM Tab Simulates

The model has additive Gaussian noise on both equations:

- x[t+1] = f(x[t], u[t], p, t) + w[t], with Var(w[t]) = sigma_x^2 I
- y[t] = h(x[t], u[t], p, t) + v[t], with Var(v[t]) = sigma_y^2 I

The first state is drawn from a standard Normal distribution of dimension nx. The panel's own `sim` function runs this loop, with `u` a vector of zeros and `p` equal to `nothing`. The filter takes no part in the simulation.

## Which Inputs Set the Nonlinear SSM Tab

| Input | Role | Default |
|---|---|---|
| **Dynamics f(x,u,p,t)** | Returns the next state, without noise | `[x[1]+x[2], x[2]*0.5]` |
| **Measurement h(x,u,p,t)** | Returns the observed vector, without noise | `[sin(x[1])]` |
| **Filter** | **Unscented Kalman Filter** or **Particle Filter** | **Unscented Kalman Filter** |
| **State Dim (nx)**, **Obs. Dim (ny)**, **Input Dim (nu)** | Vector lengths | 2, 1, 0 |
| **Particles (N)** | Size of the sample, for **Particle Filter** only | 1000 |
| **Process Noise (sigma)**, **Obs. Noise (sigma)** | sigma_x and sigma_y | 0.1, 0.2 |
| **Time Steps (n)**, **Seed** | Path length and random draws | 100, 42 |

## How the Unscented Kalman Filter Handles Nonlinearity

The unscented transform of [Julier and Uhlmann (1997)](#ref-JU1997a) picks a small set of sigma points that reproduce the current mean and covariance. Each point goes through f or h, and the outputs are combined into a new mean and covariance. The update then follows the Kalman form, x[t|t] = x[t|t-1] + K[t] e[t], with innovation e[t] and gain K[t]. No derivatives are needed, as [Wan and Van Der Merwe (2000)](#ref-WM2000a) stress. The result is deterministic for given observations, and it keeps only two moments of the state distribution.

## How the Particle Filter Tracks the State Distribution

The bootstrap filter of [Gordon, Salmond and Smith (1993)](#ref-GSS1993a) keeps **Particles (N)** draws of the state. Each step moves every particle through f with fresh noise, then multiplies its weight by the density of the observation under h. When the effective number of particles, 1 / sum(w^2), falls under a share of N, the particles are resampled in proportion to their weights. In LowLevelParticleFilters.jl that share defaults to 0.1, and the scheme is systematic. Sampling noise remains in the result, and it shrinks as N rises.

## What the Filter Result Contains in the Nonlinear SSM Tab

The tab stores the result of `forward_trajectory` as `sol_filt`, and no Next Step reads it. With **Unscented Kalman Filter**, `sol_filt.x` holds the predicted means, `sol_filt.xt` the filtered means, `sol_filt.R` and `sol_filt.Rt` their covariances, and `sol_filt.e` the innovations. With **Particle Filter**, `sol_filt.x` holds the particles, and `sol_filt.we` their weights. Both have `sol_filt.ll`, the log-likelihood of the observations under the given model. All of the Next Steps work from the true `signal` and `alpha`, not from these estimates.

## Strengths of the Nonlinear SSM Tab

Any function that Julia can compute may serve as f or h, including non-smooth ones, since neither filter takes a derivative. The pairing of a filter with its true model isolates the error that comes from the approximation itself. Comparing the two filters on the same observations shows how much the Gaussian form of the unscented filter costs on a given system. Setting h to a linear function also permits several observed series, which **Custom SSM** cannot simulate.

## Where the Nonlinear SSM Tab Misleads

A good result here does not carry over to real data, where f, h and the noise levels are all guesses. **Plot State Path**, **Signal-to-Noise Ratio** and **Marginal Variance** see only the first observed channel, so with **Obs. Dim (ny)** above 1 they ignore the rest. **Input Dim (nu)** does not add an input, as the code always passes zeros. Particle filters also suffer as state dimension grows, since the particle count needed rises steeply with it, as [Snyder, Bengtsson, Bickel and Anderson (2008)](#ref-SBBA2008a) showed.

## What to Compare the Filters in the Nonlinear SSM Tab With

Compare the two filters against each other and against the true states in `alpha`. The mean squared difference between `sol_filt.xt` and `alpha` gives the error of the unscented filter. A linear special case gives a reference, since the Kalman filter is exact there and the unscented result should be close to it. For model comparison, `sol_filt.ll` can rank candidate noise settings on the same observations, though the particle version carries sampling noise.

## References

<a id="ref-GSS1993a"></a>Gordon, N. J., Salmond, D. J. and Smith, A. F. M. (1993). Novel approach to nonlinear/non-Gaussian Bayesian state estimation. *IEE Proceedings F (Radar and Signal Processing)* 140(2), 107–113. [doi:10.1049/ip-f-2.1993.0015](https://doi.org/10.1049/ip-f-2.1993.0015)

<a id="ref-JU1997a"></a>Julier, S. J. and Uhlmann, J. K. (1997). A new extension of the Kalman filter to nonlinear systems. *Signal Processing, Sensor Fusion, and Target Recognition VI*, SPIE Proceedings 3068, 182. [doi:10.1117/12.280797](https://doi.org/10.1117/12.280797)

<a id="ref-SBBA2008a"></a>Snyder, C., Bengtsson, T., Bickel, P. and Anderson, J. (2008). Obstacles to high-dimensional particle filtering. *Monthly Weather Review* 136(12), 4629–4640. [doi:10.1175/2008mwr2529.1](https://doi.org/10.1175/2008mwr2529.1)

<a id="ref-WM2000a"></a>Wan, E. A. and Van Der Merwe, R. (2000). The unscented Kalman filter for nonlinear estimation. *Proceedings of the IEEE 2000 Adaptive Systems for Signal Processing, Communications, and Control Symposium*, 153–158. [doi:10.1109/ASSPCC.2000.882463](https://doi.org/10.1109/ASSPCC.2000.882463)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Linear Gaussian](linear-gaussian.md) · [Custom SSM](custom-ssm.md)
