# State Space Models — Interpretation

All outputs of this panel describe what a model produces when its parameters are known. None of them is an estimate from data, a fitted trend or a forecast of a real series.

## How to Read a Simulated Observation Series

**Plot Simulated Series** shows one random realisation of the model, and a new **Seed** gives another that is just as valid. Rises, falls and turning points in that path have no meaning of their own, as they arise from chance alone. What can be read is the character of the model: how smooth the path is, how far it wanders and how much scatter surrounds it. A reader who sees a clear trend in one path of a local level model has seen the random walk and not a slope.

## What the Noise-Free Signal Means in a State Space Simulation

**Plot State Path** draws the signal, computed as Z times the state, or in **Nonlinear SSM** as the first output of h without noise. The signal is known here only because the state was generated. It is not a filtered or smoothed estimate, and despite the label, the line is not the state itself when Z or h transforms it. A real analysis has only the observations, so the closeness of the two lines shows how hard recovery would be, not how well any method did.

## How to Read the Latent States in Decompose Components

**Decompose Components** has two parts: the columns of the state path, and the observation noise y minus the signal. In **Local Level** there is one state, the level. In **Local Linear Trend** the states are level and slope, on different scales. In **Nonlinear SSM** and **Custom SSM** they are numbered, and their meaning is whatever the functions or matrices give them. The panel does not extract these components from a series, so this is not a decomposition in the sense of a fitted structural model.

## How to Read the Signal-to-Noise Ratio of a State Space Model

**Signal-to-Noise Ratio** prints the sample SNR, the variance of the signal over the variance of y minus the signal. For a random-walk level it grows with n, so it cannot be compared between paths of different lengths. **Linear Gaussian** also prints q, the level noise variance over the observation noise variance, which does not depend on n. A large q means the level moves a lot between observations. A small q means long averages would be needed to see it. The value of q leaves out **Slope Noise (sigma_2)**.

## How to Read the Marginal Variance of a Simulated Series

**Marginal Variance** gives three sample variances from one path. Var(y) is usually near Var(signal) plus Var(y - signal), but the sum is not exact, because a finite sample leaves some correlation between the signal and the noise. With random-walk states, the first two grow with n and vary widely from seed to seed, so neither is a property of the model alone. Only Var(y - signal) estimates a fixed quantity, the observation noise variance.

## Why Extend Forward and Multiple Scenarios Are Not Forecasts

**Extend Forward** draws one random continuation from the last state, so it shows a possible future and not an expected one. **Multiple Scenarios** restarts each of its 10 paths from the beginning, so its paths are not conditioned on the first path, and their spread is not a forecast interval. A reader who wants an interval conditional on the end of a path can repeat `sim(n_ahead; from=alpha[end, :])` many times and take quantiles at each step.

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
