# Sequential Monte Carlo — Overview

**Sequential Monte Carlo** (SMC) methods, or **particle filters**, estimate the hidden state of a **state-space model** as observations arrive. A latent state x[t] evolves by a Markov transition p(x[t+1] | x[t]), and each observation y[t] depends on the current state through p(y[t] | x[t]). The **filtering distribution** p(x[t] | y[1:t]) is represented by N weighted samples, the **particles**, which are moved through the dynamics, reweighted by each new observation, and resampled when the weights become uneven. The same run estimates the **likelihood** p(y[1:T]), the basis for estimating the model's parameters.

The Sequential Monte Carlo panel runs the particle filter of LowLevelParticleFilters.jl on a **linear-Gaussian** model, x[t+1] = a x[t] + w[t] and y[t] = c x[t] + e[t] with Gaussian noises of variances q and r, where the **Kalman filter** and smoother give the exact answers. Every particle estimate is compared with them, so the panel shows how accurate the particle approximation is, and how its accuracy depends on N, the noise variances and the resampling threshold. For linear-Gaussian models in practice, use the Kalman filter; the particle filter is for the nonlinear and non-Gaussian models where no exact filter exists.

## Particle Filter
The **bootstrap particle filter** draws each particle's next state from the dynamics, weights it by the likelihood of the new observation, and resamples when the **effective sample size** (ESS) falls below the **Resampling Threshold** times N. It returns the filtering means and variances and the log-likelihood estimate.

## Particle Smoother
The **particle smoother** estimates p(x[1:T] | y[1:T]), the states given all the data, by **forward filtering, backward simulation**: after the filter, it draws **M** trajectories backwards through the stored particles, reweighting them by the transition density. Compared with the Rauch-Tung-Striebel smoother, it shows how later data sharpen the early states.

## Common Workflow

1. Set the model (**State Coefficient a**, **Observation Coefficient c**, **State Noise Variance q**, **Observation Noise Variance r**, **Initial Mean m0**, **Initial Variance v0**), the **Particles (N)**, the **Steps (T)** and the **Resampling Threshold**, and run.
2. Look at the **Filtering Density**, the **ESS Trajectory** and the **Weight Distribution**.
3. Diagnose with the **ESS per Step**, the **Log-Likelihood Trajectory** and the **Resampling and Path Degeneracy**.
4. Predict: the **Filter Mean**, the **One-Step Predictive** and the **Smooth Path**.
5. Compare: the **Particle Count Study**, the **Resampling Threshold Sweep** and the **Log-Likelihood Variance**.
6. Read the **Log-Likelihood**, the **Filtering Means** and the **Weight Entropy**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
