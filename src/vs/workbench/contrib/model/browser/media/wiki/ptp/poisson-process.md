# Poisson Process

The Poisson process is the reference model for event times: no memory, no clusters, one rate. The **Poisson** and **Inhomogeneous** tabs both build on it. A textbook account is in [Ross (2014)](#ref-Ros2014a).

## What a Homogeneous Poisson Process Computes

A homogeneous Poisson process has a constant intensity lambda. The count N(a, b) in an interval is Poisson with mean lambda (b - a), counts in separate intervals are independent, and the gaps are independent Exp(lambda). The log-likelihood of n events on [0, T] is

log L = n log(lambda) - lambda T

so the maximum likelihood estimate is lambda_hat = n / T. Only the count enters the estimate. The times themselves carry no further information about lambda, and they are what a goodness-of-fit check uses.

## How the Exact Interval for a Poisson Rate Is Computed

The **Poisson** tab prints a 95% interval from the method of [Garwood (1936)](#ref-Gar1936a), in the code as `quantile(Chisq(2n), 0.025) / (2T)` and `quantile(Chisq(2n + 2), 0.975) / (2T)`. The interval follows from the link between Poisson counts and chi-square quantiles, and its coverage is at least 95% for any rate when the count is truly Poisson. Clustered events have more variance than a Poisson count, and the interval is then too short.

## What an Inhomogeneous Poisson Process Computes

An inhomogeneous process replaces lambda with a function lambda(t), and counts stay independent, with mean equal to the integral of lambda(t). The **Inhomogeneous** tab estimates it in the way of [Diggle (1985)](#ref-Dig1985a):

lambda_hat(t) = n f(t) / e(t)

Here f(t) is a Gaussian kernel density of the events, with **Bandwidth (h)** as standard deviation, and e(t) = Phi((T - t) / h) - Phi(-t / h) is the share of kernel mass inside [0, T]. Without e(t), the estimate would droop at both ends of the window.

## Which Panel Inputs Affect the Poisson Tabs

**Event Times** and **Time Horizon (T)** are all that a **Poisson** fit needs. **Rate (lambda)** sets the simulated example and plays no part in a fit to your own events. **Inhomogeneous** adds **Bandwidth (h)**. Its simulated example draws from a sinusoidal rate by the thinning method of [Lewis and Shedler (1979)](#ref-LS1979a), which proposes events at a constant upper rate and keeps each with probability lambda(t) over that upper rate.

## Where Poisson Process Models Are Strong and Where They Mislead

The homogeneous model gives closed-form results and exact forecasts: **Next Event Time** is an exponential, and **Expected Count** draws the rate from a Gamma(n + 1, 1/T) posterior under a flat prior before drawing a count. Clusters break it, as does a trend. The inhomogeneous fit can absorb clusters as bumps in the rate and so look good on them, particularly with a small **Bandwidth (h)**. It has no forecast past T, and it cannot say why the rate moved.

## What to Compare a Poisson Process With

Start from the **Poisson** fit and read **Inter-Event Times** and **Q-Q Plot**, since nearly all departures of interest show up there. **Poisson vs Hawkes** compares it with a three-parameter Hawkes fit on AIC and BIC, as a chi-square test does not apply: under the Poisson model the branching ratio sits on its boundary at 0, and the decay is not identified. Compare a clustered series with both **Hawkes** and **Cox**.

## References

<a id="ref-Dig1985a"></a>Diggle, P. J. (1985). A kernel method for smoothing point process data. *Journal of the Royal Statistical Society: Series C (Applied Statistics)* 34(2), 138–147. [doi:10.2307/2347366](https://doi.org/10.2307/2347366)

<a id="ref-Gar1936a"></a>Garwood, F. (1936). Fiducial limits for the Poisson distribution. *Biometrika* 28(3-4), 437–442. [doi:10.1093/biomet/28.3-4.437](https://doi.org/10.1093/biomet/28.3-4.437)

<a id="ref-LS1979a"></a>Lewis, P. A. W. and Shedler, G. S. (1979). Simulation of nonhomogeneous Poisson processes by thinning. *Naval Research Logistics Quarterly* 26(3), 403–413. [doi:10.1002/nav.3800260304](https://doi.org/10.1002/nav.3800260304)

<a id="ref-Ros2014a"></a>Ross, S. M. (2014). *Stochastic Processes*. Wiley (3rd ed.).

## See Also

- [Intensity Function](intensity-function.md) · [Goodness of Fit](goodness-of-fit.md) · [Hawkes Process](hawkes-process.md) · [Cox Process](cox-process.md)
