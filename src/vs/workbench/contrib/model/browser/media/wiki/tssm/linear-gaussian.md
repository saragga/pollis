# State Space Models — Linear Gaussian

The **Linear Gaussian** tab draws paths from two structural time series models, the local level and the local linear trend. It sets their variances from your inputs and simulates. It does not fit them or run a filter.

## What the Local Level and Local Linear Trend Models Say

The local level model has one state, the level mu[t]:

- y[t] = mu[t] + eps[t]
- mu[t+1] = mu[t] + eta[t]

The local linear trend adds a slope beta[t] that feeds the level:

- y[t] = mu[t] + eps[t]
- mu[t+1] = mu[t] + beta[t] + xi[t]
- beta[t+1] = beta[t] + zeta[t]

All disturbances are independent Gaussians. Both are structural models in the sense of [Harvey (1990)](#ref-Har1990a), with states that have a direct meaning.

## Which Inputs Set the Linear Gaussian Tab

| Input | Role | Default |
|---|---|---|
| **Model** | **Local Level** or **Local Linear Trend** | **Local Linear Trend** |
| **Time Steps (n)** | Length of the simulated path | 200 |
| **Level Noise (sigma_1)** | Standard deviation of the level disturbance | 0.1 |
| **Slope Noise (sigma_2)** | Standard deviation of the slope disturbance, for **Local Linear Trend** only | 0.05 |
| **Obs. Noise (sigma_eps)** | Standard deviation of the measurement error | 0.2 |
| **Seed** | Fixes the random draws | 42 |

## How the Linear Gaussian Tab Draws a Path

The code builds `LocalLevel(zeros(n))` or `LocalLinearTrend(zeros(n))`, sets `model.system.Q` and `model.system.H`, and calls `simulate` with a zero mean for the first state. That first state already includes one disturbance. The state path therefore starts near zero, and its variance grows from there. In the local level model Var(mu[t]) is t times the level noise variance. In the local linear trend, slope noise accumulates twice, so the level variance grows roughly with the cube of t.

## What a Kalman Filter Would Add to a Local Level Model

The [Kalman (1960)](#ref-Kal1960a) recursion would turn each observation into an updated estimate of the level, using a gain that settles once the variance of the estimate stops changing. For the local level model, that settled filter is exponential smoothing, whose forecasts [Muth (1960)](#ref-Mut1960a) showed to be optimal for a random walk observed with noise. The gain depends on the ratio q that **Signal-to-Noise Ratio** prints. The tab does not run this recursion, and `kalman_filter` and `kalman_smoother` in StateSpaceModels.jl are there for a user who wants it.

## What Simulating a Linear Gaussian Model Is Good For

Simulation shows what a set of variances implies before any data enter: how smooth a path is, how often it seems to trend and how much of it the measurement error hides. It also gives series with known true states, which a user can pass to a filter or an estimator to test it, a practice described at length by [Durbin and Koopman (2012)](#ref-DK2012a). A path costs very little to draw, so seeds can be varied freely.

## Where a Linear Gaussian Simulation Misleads

A local level path often appears to contain trends and cycles, and these are chance patterns of an accumulated random walk. Sample statistics from one path are poor guides to the model, since non-stationary states make them depend on n and on **Seed**. The Gaussian noise understates large moves compared with most financial and economic series. A zero starting mean also matters: the slope starts near zero, so a persistent direction appears only after the slope noise has had time to build one.

## What to Compare a Linear Gaussian Simulation With

Compare **Local Level** and **Local Linear Trend** at the same noise settings to see what the slope adds. Compare the path with a real series in the same units, through its plot and autocorrelation, to judge whether the structure is plausible. To go beyond a known linear form, use **Custom SSM** for other matrices and **Nonlinear SSM** for nonlinear functions.

## References

<a id="ref-DK2012a"></a>Durbin, J. and Koopman, S. J. (2012). *Time Series Analysis by State Space Methods*, 2nd edition. Oxford University Press. [doi:10.1093/acprof:oso/9780199641178.001.0001](https://doi.org/10.1093/acprof:oso/9780199641178.001.0001)

<a id="ref-Har1990a"></a>Harvey, A. C. (1990). *Forecasting, Structural Time Series Models and the Kalman Filter*. Cambridge University Press.

<a id="ref-Kal1960a"></a>Kalman, R. E. (1960). A new approach to linear filtering and prediction problems. *Journal of Basic Engineering* 82(1), 35–45. [doi:10.1115/1.3662552](https://doi.org/10.1115/1.3662552)

<a id="ref-Mut1960a"></a>Muth, J. F. (1960). Optimal properties of exponentially weighted forecasts. *Journal of the American Statistical Association* 55(290), 299–306. [doi:10.1080/01621459.1960.10482064](https://doi.org/10.1080/01621459.1960.10482064)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Nonlinear SSM](nonlinear-ssm.md) · [Custom SSM](custom-ssm.md)
