# State Space Models — Assumptions

A simulated series obeys its model by construction, so nothing can fail inside the simulation itself. The assumptions decide whether a simulated series says anything about a real process, and whether the filter in **Nonlinear SSM** can do its work.

## What the Linear State Space Tabs Assume About the Noise

**Linear Gaussian** and **Custom SSM** draw Gaussian disturbances that are independent over time, independent of each other and constant in variance. Real series often break all of this, with fat tails, outliers and volatility that changes. A simulation from these tabs then understates extreme moves and shows calm and turbulent stretches only by chance. To tell, set the histogram of a real series beside **Distribution**, and look for clusters of large changes that the simulated paths lack.

## Why a Random-Walk State Makes Sample Statistics Depend on Length

The local level and local linear trend models have non-stationary states, and the state variance keeps growing with time. Sample variances and the autocorrelation of one path then do not settle on a fixed value as **Time Steps (n)** rises. If the statistics from **Marginal Variance** or **Signal-to-Noise Ratio** change a great deal with n or **Seed**, that is the model's nature and not a fault. Only a stable **T Matrix (m x m)** in **Custom SSM** gives a stationary state.

## What a Filter Needs from the Model in the Nonlinear SSM Tab

The filter in **Nonlinear SSM** receives the same f, h, noise levels and starting distribution that generated the data. Its result is therefore the most favourable case. With a real system, every one of these would be uncertain, and a wrong noise level leaves a filter either too slow or too jumpy. The panel offers no way to give the filter a different model, so a user who wants to test this must build a second filter in the session.

## What the Unscented Filter Assumes About the State Distribution

An **Unscented Kalman Filter** keeps only a mean and a covariance, so it treats the state distribution at each step as close to Gaussian. The assumption fails when several states explain the same observation, as with a periodic measurement such as sin(x[1]), since the true distribution can then have several modes. The filter still returns an answer, and its reported covariance gives no warning. A disagreement with **Particle Filter** at a high **Particles (N)** is a practical sign of this failure.

## What the Particle Filter Assumes About the Number of Particles

A **Particle Filter** approximates the state distribution with **Particles (N)** weighted draws, and the approximation holds only if enough of them carry real weight. With too few particles, or small observation noise, one particle can take nearly all the weight. The number needed grows steeply with the state dimension. To tell, run the filter twice with different seeds and look at how far the log-likelihood `sol_filt.ll` moves.

## What the Nonlinear SSM Tab Assumes About the Noise and Dimensions

**Process Noise (sigma)** applies one standard deviation to every state, and **Obs. Noise (sigma)** one to every observed channel, both additive. A state component with no noise, or noise that scales with the state, cannot be written in these inputs. **State Dim (nx)** and **Obs. Dim (ny)** must equal the lengths that f and h return, or the run stops with an error or draws the wrong size of noise. **Input Dim (nu)** only sizes an input vector of zeros, so no external input reaches the model.

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
