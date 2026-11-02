# Diagnostics

The diffusion panel has no data to validate against, so its checks ask two narrower questions: whether the numerics are sound, and whether the simulation agrees with theory where theory is available.

## How to Inspect One Simulated Diffusion Path

**Plot Trajectory** solves the panel problem once more and plots X(t). A rough but continuous curve that stays in a sensible range is what to expect. A curve that shoots off to a huge value, stops early or carries a `NaN` points to coefficients that grow too fast or to a step that is too large, and a warning about `dt` or instability often appears in the REPL. One path cannot confirm that a simulation is correct, as it is a single random draw.

## What to Look for in a Bundle of Diffusion Paths

**Ensemble Paths** overlays 50 trajectories. A fan that widens smoothly, or a band that stops widening under mean reversion, is the normal picture. A few paths that run far from the rest call for a look at the equation: they may be real features of a heavy-tailed law such as geometric Brownian motion, or numerical blow-up. Lowering **Step size dt** tells the two apart, since numerical runaways fade with the step and real tails persist.

## How to Read the Strong Convergence Check

**Strong Convergence** runs EM on a fixed test equation, geometric Brownian motion with a = 1.01 and b = 0.87 over [0, 1], for steps from 1/512 to 1/16 and 1000 paths each. It reports the strong error at the final time and the slope of log error on log step. A slope near the expected 0.5 is the good result, with some scatter from sampling. A distant slope suggests a broken install or too few paths. The check ignores **Drift f(X,t)**, **Diffusion g(X,t)** and **Solver**, so it says nothing about the accuracy of your own run.

## How to Compare a Diffusion Ensemble with Closed Forms

**Mean and Variance** computes moments over 1000 paths and overlays closed forms. Solid and dashed curves that stay close, apart from sampling noise that grows with the variance, are the good outcome. A gap that shrinks with **Step size dt** is discretisation error. The formulas read a and b off f and g at X = 1, so they apply only to f = a X and, outside **Additive Noise**, g = b X, and nothing warns otherwise. A drift such as `-0.5*(X-2)` gives a wrong dashed curve, and a = 0 gives `NaN` for the additive variance.

## What the Ito vs Stratonovich Chart Can and Cannot Show

**Ito vs Stratonovich** solves f and g with EM and with EulerHeun, always at **Step size dt**, whatever **Solver** holds. The first solve omits `save_noise=true`, so StochasticDiffEq.jl keeps only the two ends of the Brownian path. `NoiseWrapper` therefore cannot replay the path, and the second solve takes fresh bridge values between those ends, none of which are stored. Do not read the gap in this chart as the effect of the calculus. Adding `save_noise=true` to the EM call makes the second solve follow the recorded path, and for constant g the two curves should then agree up to discretisation error.

## How to Judge the Stationary Distribution Check

**Stationary Distribution** simulates to t = 1000, drops t up to 100, and plots a histogram of states every 0.1. In **Additive Noise** with f = a X and a < 0, it adds the normal curve with variance sigma^2 / (2 theta), where theta = -a, and the histogram should follow that curve. A clear gap suggests a step that is too large or a burn-in too short for a slow theta. In **Multiplicative Noise** and **Stratonovich** no curve is drawn, since g = b X has no proper stationary law.

## How to Test the Step Size on Your Own Diffusion

The panel offers no convergence check for your own equation, and one can be made by hand. Run **Mean and Variance** or your own ensemble at **Step size dt**, then at half that value, and compare the statistic you care about against its Monte Carlo error. With an adaptive solver, pass `abstol=1e-3, reltol=1e-3` to `solve` and compare again. If the statistic moves by more than sampling noise, keep refining. A fixed `seed` does not align two runs that use different steps, as the Brownian increments differ.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
