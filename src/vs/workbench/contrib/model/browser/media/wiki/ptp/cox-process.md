# Cox Process

A Cox process is a Poisson process whose rate is a random path. Events are independent once that path is known, and they cluster because the rate rises and falls unseen. [Cox (1955)](#ref-Cox1955a) introduced the idea, and the **Cox** tab fits a log-Gaussian form with one addition: a self-excitation term.

## What a Log-Gaussian Cox Process Computes

The log-Gaussian Cox process of [Møller, Syversveen and Waagepetersen (1998)](#ref-MSW1998a) takes

lambda(t) = exp(m + y(t))

where y(t) is a zero-mean Gaussian process with a chosen covariance. Given the path, events follow an inhomogeneous Poisson process. The marginal process is overdispersed: counts have more variance than a Poisson count with the same mean. Estimation targets the posterior of the whole path, so a band for lambda(t) comes from the draws.

## How the Cox Tab Differs from a Pure Cox Model

The tab fits `ContinuousStandardHawkesProcess` with a log-Gaussian Cox baseline, so its conditional intensity is the baseline path plus a sum over past events of W theta exp(-theta (t - t_i)). The weight W is the expected direct offspring per event, and theta is the decay. Pure Cox data should give W near 0. So the tab tests for triggering, and its intensity after a burst holds two parts. **Inhomogeneous** gives a rate with no hidden randomness, and **Hawkes** a constant baseline.

## How the Cox Tab Estimates the Hidden Rate

The path sits on 51 points, one for each end of the 50 grid intervals, with linear interpolation between them. `NHP.mcmc!` runs a Gibbs sweep over parents, the path, the decay and the weight. The path update is elliptical slice sampling, from [Murray, Adams and MacKay (2009)](#ref-MAM2009a), which needs no tuning and proposes on an ellipse through the current path. The package stops with an error if a step fails after 100 attempts. The mean m is fixed at the log of the observed average rate.

## Which Panel Inputs Affect the Cox Tab

| Input | Effect on the **Cox** tab |
|---|---|
| **GP Variance (sigma2)** | Prior variance of the log rate, in both the simulation and the fit |
| **Length Scale (l)** | Prior time scale of the path, in both the simulation and the fit |
| **Kernel** | **Squared Exp.** uses sigma2 exp(-((x - y)/l)^2 / 2), and **Ornstein-Uhlenbeck** uses sigma2 exp(-abs(x - y)/l) |
| **Log Baseline (mu0)** | Simulation only |
| **Gibbs Iterations** | Sweeps, with the first quarter discarded |

## Where a Cox Process Is Strong and Where It Misleads

The tab separates an unseen driver from triggering and gives an uncertainty band over the rate. It misleads in several ways. The fixed hyperparameters shape the result, and the panel has no way to learn them from the events. A short **Length Scale (l)** can absorb real triggering into the path, and a long one can push slow waves into W. Features under T/50 cannot appear. The fit describes only [0, T], and **Next Event Time**, **Future Events** and **Expected Count** print a message and no forecast.

## What to Compare a Cox Process With

Compare with **Hawkes** on the same events, and read **Q-Q Plot** and W in **Branching Ratio**. W near 0 and a good **Q-Q Plot** fit a hidden rate. Compare also with **Inhomogeneous**, whose kernel estimate is simpler, gives no band, and often gives a similar curve when the rate is slow. Do not compare **Log-Likelihood** raw across these tabs: a path of 51 values fitted to the same events has many more degrees of freedom, and its likelihood is at a plug-in.

## References

<a id="ref-Cox1955a"></a>Cox, D. R. (1955). Some statistical methods connected with series of events. *Journal of the Royal Statistical Society: Series B* 17(2), 129–157. [doi:10.1111/j.2517-6161.1955.tb00188.x](https://doi.org/10.1111/j.2517-6161.1955.tb00188.x)

<a id="ref-MSW1998a"></a>Møller, J., Syversveen, A. R. and Waagepetersen, R. P. (1998). Log Gaussian Cox processes. *Scandinavian Journal of Statistics* 25(3), 451–482. [doi:10.1111/1467-9469.00115](https://doi.org/10.1111/1467-9469.00115)

<a id="ref-MAM2009a"></a>Murray, I., Adams, R. P. and MacKay, D. J. C. (2009). Elliptical slice sampling. arXiv:1001.0175. [doi:10.48550/arXiv.1001.0175](https://doi.org/10.48550/arXiv.1001.0175)

## See Also

- [Poisson Process](poisson-process.md) · [Hawkes Process](hawkes-process.md) · [Intensity Function](intensity-function.md) · [Decision Guide](decision-guide.md)
