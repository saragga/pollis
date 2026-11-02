# Hawkes Process

A Hawkes process lets each event raise the chance of further events for a while, which produces clusters from the data's own history. [Hawkes (1971)](#ref-Haw1971a) defined the process, and the **Hawkes** tab fits its exponential form by Gibbs sampling.

## What the Exponential Hawkes Model Computes

The conditional intensity is

lambda(t) = mu + sum over t_i < t of alpha exp(-beta (t - t_i))

where mu is the baseline, alpha the jump after each event and beta the decay rate. The branching ratio kappa = alpha / beta is the expected number of direct offspring of one event. In the code, the fit uses kappa and an exponential kernel `Exponential(1 / beta)`, and alpha is kappa times beta. For kappa < 1, the process has a stationary rate mu / (1 - kappa).

## How the Cluster Form of a Hawkes Process Works

[Hawkes and Oakes (1974)](#ref-HO1974a) showed that the same process can be built from immigrants, arriving at rate mu, each of which starts a cluster. Every event then produces offspring: a Poisson(kappa) number, at delays drawn from the kernel. So 1 - kappa is the long-run share of immigrants, and 1/(1 - kappa) is the mean size of a cluster. The parent of an event is not observed, and estimation can treat it as a latent variable.

## How the Hawkes Tab Estimates Its Parameters

`HP.fit(t_obs, T, its)` runs a Gibbs sampler in the style of [Rasmussen (2013)](#ref-Ras2013a). Each sweep assigns each event a parent, or the baseline, with probability in proportion to its contribution to the intensity. Given the parents, mu, kappa and beta each have a Gamma conditional, with Gamma(0.01, ...) priors in the package. The tab discards the first quarter of **Gibbs Iterations**, and prints the mean and 95% interval for mu, alpha, beta and kappa. The sampler starts from random values.

## Which Panel Inputs Affect the Hawkes Tab

**Event Times**, **Time Horizon (T)** and **Gibbs Iterations** drive the fit. **Baseline (mu)**, **Excitation (alpha)** and **Decay (beta)** set the true values of the simulated example, and they do not start or constrain the sampler. The event times must be distinct. Intensity and compensator in the Next Steps use the posterior means of mu, kappa and beta as a plug-in, while **Branching Ratio**, **Branching Structure**, **Expected Count** and the printed intervals use the draws themselves.

## Where a Hawkes Fit Is Strong and Where It Misleads

The model gives a short, readable account of bursts, and it has a forecast that depends on recent history. It misleads when the baseline moves: a trend or a seasonal rate reads as excitation and pushes kappa upward, sometimes towards 1. An exponential kernel cannot express slow power-law decay, as in the aftershock models of [Ogata (1998)](#ref-Oga1998a). The model in the tab has no inhibition, marks or covariates. Its Gamma prior on kappa is not limited to values under 1, so **Expected Count** and **Branching Structure** can receive draws from outside the stationary range.

## What to Compare a Hawkes Fit With

**Poisson vs Hawkes** gives AIC and BIC against a constant rate, with a Hawkes maximum likelihood fit from NetworkHawkesProcesses.jl. Its likelihood counts each event's full offspring mass, ignoring truncation at T, and its parameters are bounded at 10, which limits how fast a decay it can find. To test against a hidden rate, fit **Cox** and read its W. The survey of [Bacry, Mastromatteo and Muzy (2015)](#ref-BMM2015a) covers applications in finance, including kernels beyond the exponential form.

## References

<a id="ref-BMM2015a"></a>Bacry, E., Mastromatteo, I. and Muzy, J.-F. (2015). Hawkes processes in finance. *Market Microstructure and Liquidity* 1(1), 1550005. [doi:10.1142/S2382626615500057](https://doi.org/10.1142/S2382626615500057)

<a id="ref-Haw1971a"></a>Hawkes, A. G. (1971). Spectra of some self-exciting and mutually exciting point processes. *Biometrika* 58(1), 83–90. [doi:10.1093/biomet/58.1.83](https://doi.org/10.1093/biomet/58.1.83)

<a id="ref-HO1974a"></a>Hawkes, A. G. and Oakes, D. (1974). A cluster process representation of a self-exciting process. *Journal of Applied Probability* 11(3), 493–503. [doi:10.2307/3212693](https://doi.org/10.2307/3212693)

<a id="ref-Oga1998a"></a>Ogata, Y. (1998). Space-time point-process models for earthquake occurrences. *Annals of the Institute of Statistical Mathematics* 50(2), 379–402. [doi:10.1023/A:1003403601725](https://doi.org/10.1023/A:1003403601725)

<a id="ref-Ras2013a"></a>Rasmussen, J. G. (2013). Bayesian inference for Hawkes processes. *Methodology and Computing in Applied Probability* 15(3), 623–642. [doi:10.1007/s11009-011-9272-5](https://doi.org/10.1007/s11009-011-9272-5)

## See Also

- [Poisson Process](poisson-process.md) · [Network Hawkes](network-hawkes.md) · [Cox Process](cox-process.md) · [Goodness of Fit](goodness-of-fit.md)
