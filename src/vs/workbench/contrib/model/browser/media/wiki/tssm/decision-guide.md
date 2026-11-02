# State Space Models — Decision Guide

The first decision is whether the process can be written with linear equations. The second is whether a standard trend form is enough or the matrices need to be written out.

## Which State Space Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| A level that wanders, with measurement error | **Linear Gaussian** with **Local Level** | One state and two noise settings |
| A trend whose slope also changes | **Linear Gaussian** with **Local Linear Trend** | Level and slope, each with its own noise |
| A nonlinear system to simulate and filter | **Nonlinear SSM** | Takes any f and h, and is the only tab that runs a filter |
| A linear form with one observed series, such as an autoregression or a seasonal state | **Custom SSM** | The matrices are written directly |
| Several observed series in a linear form | **Nonlinear SSM** with linear f and h | **Custom SSM** runs only with p = 1 |
| A real data set to fit | None of the tabs | The panel simulates, and estimation needs `fit!` in StateSpaceModels.jl |

## When to Choose a Local Level or a Local Linear Trend

Choose **Local Level** when the series has no lasting direction and the question is how much it drifts. Choose **Local Linear Trend** when a direction persists for a while and can change. Its paths are much smoother and stray much further over the same n, because the noise is summed twice on its way to the level. Setting **Slope Noise (sigma_2)** to 0 gives a level with a fixed random-free slope, which starts at zero under this panel's settings, so a nonzero slope has to come from a small positive value.

## How to Set the Noise Levels of a State Space Simulation

The ratio of noises shapes the path more than their sizes. Start by choosing the ratio of **Level Noise (sigma_1)** to **Obs. Noise (sigma_eps)**: well above 1 means a path dominated by the state, and well under 1 means a path dominated by scatter. Rescaling all noises together only changes the units of the plot. Then use **Noise Sensitivity** to see the observation noise alone at four fixed levels, which are not scaled to your settings.

## When to Use the Unscented Kalman Filter or the Particle Filter

Use **Unscented Kalman Filter** when the functions are smooth and the state distribution likely has one peak, since it is fast and has no sampling noise. Use **Particle Filter** when several states can explain one observation, or the distribution is strongly skewed. **Particles (N)** sets its cost, which rises in proportion. A particle filter with a state of more than a few dimensions needs far more particles than the default 1000 can offer. Running both and comparing `sol_filt` in the session is a cheap test of the choice.

## How Long to Simulate a State Space Model

**Time Steps (n)** should be long enough to show the feature in question. A stationary model needs n of many times its longest memory for sample statistics to settle. A random-walk model never settles, and more steps only widen its range, so several short paths from **Multiple Scenarios** often say more than a single long one. **Particle Filter** cost rises in proportion to n, as does the memory taken by `sol_filt`.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Linear Gaussian](linear-gaussian.md) · [Nonlinear SSM](nonlinear-ssm.md) · [Custom SSM](custom-ssm.md)
