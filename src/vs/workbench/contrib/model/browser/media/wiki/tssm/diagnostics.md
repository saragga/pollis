# State Space Models — Diagnostics

Every series in this panel comes from known parameters, so these checks do not test a fit to data. They ask whether a simulation behaves as the chosen structure should, and whether the settings give the signal a chance to be seen.

## How to Check the Time Structure of a Simulated State Space Series

**Autocorrelation** plots the autocorrelation of y up to lag 40. A slow decay is what a trend or random-walk level should give. A quick geometric decay is what a stable **T Matrix (m x m)** should give. A drop to near zero after lag 0 in a model meant to carry a trend says that the observation noise is swamping the state, so lower **Obs. Noise (sigma_eps)** or raise the state noise. Read several seeds before concluding, as one path of a non-stationary model can look quite unlike another.

## How to Read the Histogram of a Simulated State Space Series

**Distribution** shows the histogram of y over one path. For a stationary linear Gaussian model it should look roughly bell-shaped once n is large. For a random-walk level it does not estimate any fixed distribution, and lumps or two peaks only show where that path happened to wander. Compare the shapes across **Seed** values before reading anything into them. A strongly non-Gaussian shape under **Nonlinear SSM** usually comes from the measurement function and not from the noise.

## How to See Whether the Signal Stands Out from the Noise

**Plot State Path** overlays the noise-free signal on the observations. A good setting for studying a trend leaves the signal visible through the scatter. A signal buried in the scatter calls for a smaller observation noise or a larger state noise. **Noise Sensitivity** repeats the path at four observation noise levels with the same random draws, so the state path stays put and only the scatter changes. The level at which the signal disappears by eye is a rough limit of what a filter could recover from one path.

## How to Check the Observation Noise of a Simulated Series

**Marginal Variance** prints the sample variances of y, the signal and y minus the signal. The last of these should be close to the square of the observation noise setting, or to the value in **H Matrix (p x p)**, with a closeness that improves with n. A large gap on a long path means the settings are not what the reader thinks they are. With **Obs. Dim (ny)** above 1, these numbers describe only the first observed channel.

## How to Tell Whether a State Space Path Is Exploding

**Multiple Scenarios** overlays 10 independent paths, and **Extend Forward** continues one path for 50 steps. Paths that fan out gradually are normal for random-walk states. Paths that race away, or that reach `Inf` or `NaN`, point to an unstable system. In **Custom SSM**, compute `eigvals(T_mat)`, since an eigenvalue above 1 in size gives exponential growth. In **Nonlinear SSM**, inspect **Dynamics f(x,u,p,t)**, as a term that grows faster than the state can blow up in a few steps.

## How to Check the Filter When No Next Step Shows It

No Next Step reads the filter result in **Nonlinear SSM**, so the check has to be made in the session. After `using Plots`, `plot(sol_filt)` draws the solution. For **Unscented Kalman Filter**, compare `sol_filt.xt` with the true states in `alpha`, and check that the innovations in `sol_filt.e` look like white noise. For **Particle Filter**, compute the effective number of particles at step t as 1 / sum(w[t]^2), with weights from `sol_filt.we` normalised to sum to one. Values that stay near 1 mean the particle set has collapsed, so raise **Particles (N)**.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Nonlinear SSM](nonlinear-ssm.md)
