# Factsheet

The Jump-Diffusion Processes panel simulates a diffusion that also jumps at random times, through JumpProcesses.jl on top of StochasticDiffEq.jl. It works forward from the equation and parameters you give, and it does not estimate them or price any claim.

## What the Jump-Diffusion Processes Panel Does

| Item | Description |
|---|---|
| **Purpose** | Simulation of dX = f dt + g dW + a jump term, with checks on jump counts, moments and jump sizes |
| **Julia stack** | JumpProcesses.jl for `ConstantRateJump`, `VariableRateJump` and `JumpProblem`; StochasticDiffEq.jl for the path between jumps |
| **Models** | **Compound Poisson**, **Gaussian Jumps** and **Custom Rate** tabs |
| **Common inputs** | **Drift f(X)**, **Diffusion g(X)**, **Jump rate lambda**, **SDE solver**, **Initial state X0**, **Time span T**, **Step size dt** |
| **Default inputs** | Drift `0.05*X`, diffusion `0.2*X`, lambda 2.0, SRIW1, X0 of 1.0, T of 5.0, dt of 0.001 |
| **Key choice** | The law of the jump size, whether the rate depends on X, and what **Drift f(X)** is taken to mean |

## What Differs Between the Three Jump-Diffusion Tabs

| Tab | Jump rate | Jump in X | **Drift f(X)** means | Extra inputs |
|---|---|---|---|---|
| **Compound Poisson** | lambda | X times exp(J), J ~ Uniform(-0.2, 0.2) | Drift of the continuous part | **Jump aggregator** |
| **Gaussian Jumps** | lambda | X times exp(J), J ~ Normal(muJ, sigmaJ) | Total expected growth, as lambda kappa X is subtracted | **Jump mean muJ**, **Jump std sigmaJ**, **Jump aggregator** |
| **Custom Rate** | lambda times abs(X) | X times (1 + 0.1 Z), Z ~ Normal(0, 1) | Drift of the continuous part | None |

## Which Step Control the Jump-Diffusion Solvers Use

**SDE solver** handles the path between jumps. EM runs at the fixed **Step size dt**, and SRIW1 and LambaEM adapt with no step set by the user. RKMil adapts its step too, starting from **Step size dt**. Adaptive solvers use the package default tolerances of 0.01. The width 0.2 of the uniform jump and the factor 0.1 in **Custom Rate** are written into the code and have no input.

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Compound Poisson](compound-poisson.md) · [Gaussian Jumps](gaussian-jumps.md) · [Custom Rate](custom-rate.md)
