# State Space Models — Overview

State space models separate what a system does from what is seen of it. The recursive estimator of [Kalman (1960)](#ref-Kal1960a) made the linear form practical, and it remains the base of the modern methods.

## Where State Space Models Come From

The Kalman filter updates an estimate of a hidden state each time a new observation arrives. [Harvey (1990)](#ref-Har1990a) used that recursion to build structural time series models, in which level, slope and season are each a state with a direct meaning. [Durbin and Koopman (2012)](#ref-DK2012a) give the standard treatment of estimation and smoothing. Nonlinear systems led to two later approaches. The unscented filter of [Julier and Uhlmann (1997)](#ref-JU1997a) carries a small set of chosen points through the nonlinear functions. The particle filters of [Gordon, Salmond and Smith (1993)](#ref-GSS1993a) and [Kitagawa (1996)](#ref-Kit1996a) carry a large random sample.

## The Two Equations That Define a Linear State Space Model

A linear Gaussian model has an observation equation and a state equation:

- y[t] = Z' alpha[t] + eps[t], with Var(eps[t]) = H
- alpha[t+1] = T alpha[t] + R eta[t], with Var(eta[t]) = Q

The vector alpha[t] is the hidden state. T moves the state forward, Z reads the observed part of it, and H and Q set how much noise enters each equation. Both noises are Gaussian and independent over time. All the classic trend, seasonal and autoregressive forms can be written by choosing these matrices.

## How the Linear Gaussian Tab Simulates a Trend

The **Linear Gaussian** tab builds a `LocalLevel` or `LocalLinearTrend` model on a series of zeros, writes the noise variances into its `system` field and calls `simulate`. The result is a path of observations and states drawn from the model. **Level Noise (sigma_1)** drives the level, **Slope Noise (sigma_2)** drives the slope when **Model** is **Local Linear Trend**, and **Obs. Noise (sigma_eps)** sets the measurement error. No filter runs and nothing is estimated.

## How the Nonlinear SSM Tab Simulates and Filters

The **Nonlinear SSM** tab takes two functions, **Dynamics f(x,u,p,t)** and **Measurement h(x,u,p,t)**, and draws a path with additive Gaussian noise. The panel then builds a filter that is given the true functions, the true noise levels and the true starting distribution. `forward_trajectory` runs that filter over the simulated observations and stores the outcome as `sol_filt`. None of the Next Steps reads `sol_filt`, so the filter's estimates appear only if the user asks for them in the session.

## How the Custom SSM Tab Turns Matrices into a Model

The **Custom SSM** tab passes **T Matrix (m x m)**, **Z Matrix (p x m)**, **Q Matrix (m x m)** and **H Matrix (p x p)** to `LinearUnivariateTimeInvariant`. That type holds a single observed series, so the code needs p = 1 and a one-element H. R is the identity matrix and both intercepts are zero. The path comes from `simulate`, as in the **Linear Gaussian** tab, and no filter runs.

## What the State Space Models Panel Leaves Out

The panel generates series from parameters you give it, and so it answers what a model implies, not which parameters fit a data set. It does not read data, estimate variances or produce a smoothed state. For a real series, StateSpaceModels.jl provides `fit!`, `kalman_filter`, `kalman_smoother` and `forecast`, which a user can call from the session on a model built with the observed values in place of the zeros.

## A Common Workflow for Simulating State Space Models

1. Pick the tab that holds the structure, and set the noise levels or matrices.
2. Look at **Plot Simulated Series** and **Plot State Path** to see the path against its signal.
3. Read **Autocorrelation** and **Signal-to-Noise Ratio** for what the settings imply.
4. Use **Noise Sensitivity** to see how the measurement error hides the signal.
5. Use **Multiple Scenarios** to see how far independent paths spread.

## References

<a id="ref-DK2012a"></a>Durbin, J. and Koopman, S. J. (2012). *Time Series Analysis by State Space Methods*, 2nd edition. Oxford University Press. [doi:10.1093/acprof:oso/9780199641178.001.0001](https://doi.org/10.1093/acprof:oso/9780199641178.001.0001)

<a id="ref-GSS1993a"></a>Gordon, N. J., Salmond, D. J. and Smith, A. F. M. (1993). Novel approach to nonlinear/non-Gaussian Bayesian state estimation. *IEE Proceedings F (Radar and Signal Processing)* 140(2), 107–113. [doi:10.1049/ip-f-2.1993.0015](https://doi.org/10.1049/ip-f-2.1993.0015)

<a id="ref-Har1990a"></a>Harvey, A. C. (1990). *Forecasting, Structural Time Series Models and the Kalman Filter*. Cambridge University Press.

<a id="ref-JU1997a"></a>Julier, S. J. and Uhlmann, J. K. (1997). A new extension of the Kalman filter to nonlinear systems. *Signal Processing, Sensor Fusion, and Target Recognition VI*, SPIE Proceedings 3068, 182. [doi:10.1117/12.280797](https://doi.org/10.1117/12.280797)

<a id="ref-Kal1960a"></a>Kalman, R. E. (1960). A new approach to linear filtering and prediction problems. *Journal of Basic Engineering* 82(1), 35–45. [doi:10.1115/1.3662552](https://doi.org/10.1115/1.3662552)

<a id="ref-Kit1996a"></a>Kitagawa, G. (1996). Monte Carlo filter and smoother for non-Gaussian nonlinear state space models. *Journal of Computational and Graphical Statistics* 5(1), 1–25. [doi:10.1080/10618600.1996.10474692](https://doi.org/10.1080/10618600.1996.10474692)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Linear Gaussian](linear-gaussian.md) · [Nonlinear SSM](nonlinear-ssm.md) · [Custom SSM](custom-ssm.md)
