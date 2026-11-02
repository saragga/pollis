# Overview

Earthquakes, trades, neuron spikes and insurance claims are all events at points in time. Point process models replace the question of a value at each time by the question of how likely an event is at each time, given what has happened so far.

## What a Point Process Is and What Its Intensity Means

A point process is a random collection of event times. Its conditional intensity lambda(t) is the limit of the probability of an event in a small interval after t, divided by the interval's length, given the history up to t. One function then describes the whole process, and its integral over a window is the expected count given how the history unfolds. The texts of [Daley and Vere-Jones (2003)](#ref-DV2003a) and [Daley and Vere-Jones (2008)](#ref-DV2008a) develop the general theory.

## How the Poisson and Inhomogeneous Tabs Model Event Times

**Poisson** assumes a constant rate, so that counts in separate intervals are independent and gaps between events are exponential. Its maximum likelihood estimate is N / T. **Inhomogeneous** keeps the independence and lets the rate change with time. It uses the kernel estimate of [Diggle (1985)](#ref-Dig1985a), with a correction for the loss of kernel mass at both ends of the window. Neither tab lets one event affect another.

## How the Cox Tab Models a Hidden Random Rate

[Cox (1955)](#ref-Cox1955a) proposed a Poisson process whose rate is itself random, and so events cluster with no event causing another. A log-Gaussian Cox process, from [Møller, Syversveen and Waagepetersen (1998)](#ref-MSW1998a), takes the log rate to be a Gaussian process. The **Cox** tab places that path on a grid of 50 intervals, samples it by the elliptical slice method of [Murray, Adams and MacKay (2009)](#ref-MAM2009a), and adds a self-excitation weight W. A W near 0 says the hidden rate alone explains the clustering.

## How the Hawkes Tab Models Self-Excitation

[Hawkes (1971)](#ref-Haw1971a) let each event raise the intensity for a while, and [Hawkes and Oakes (1974)](#ref-HO1974a) showed the same process as immigrant events that each start a cluster of offspring. The **Hawkes** tab has lambda(t) = mu + sum over past events of alpha exp(-beta (t - t_i)). It samples the parameters with a latent parent for each event, in the Bayesian scheme of [Rasmussen (2013)](#ref-Ras2013a). Earthquake aftershock models of [Ogata (1998)](#ref-Oga1998a) and models of trades in [Bacry, Mastromatteo and Muzy (2015)](#ref-BMM2015a) are well-known applications.

## How the Network Hawkes Tab Models Excitation Between Nodes

**Network Hawkes** gives each of N nodes a baseline, and lets an event on one node raise the intensity of others along directed links. The model of [Linderman and Adams (2014)](#ref-LA2014a) combines a Bernoulli prior on the links with a Hawkes likelihood. The tab reports a posterior probability for each link and a mean strength, with a probability of 0.5 at the start of the sampler.

## A Common Workflow for Point Processes

1. Set **Event Times** and **Time Horizon (T)**, and start with **Poisson**.
2. Look at **Event Timeline** and **Inter-Event Times** for trend and clustering.
3. Fit the tab that fits the pattern seen, and read **Intensity Function**.
4. Run **Time-Rescaling Test** and **Q-Q Plot**.
5. Use **Poisson vs Hawkes** and **Branching Ratio** to judge self-excitation.
6. Forecast with **Next Event Time** and **Expected Count** where the tab offers them.

## References

<a id="ref-BMM2015a"></a>Bacry, E., Mastromatteo, I. and Muzy, J.-F. (2015). Hawkes processes in finance. *Market Microstructure and Liquidity* 1(1), 1550005. [doi:10.1142/S2382626615500057](https://doi.org/10.1142/S2382626615500057)

<a id="ref-Cox1955a"></a>Cox, D. R. (1955). Some statistical methods connected with series of events. *Journal of the Royal Statistical Society: Series B* 17(2), 129–157. [doi:10.1111/j.2517-6161.1955.tb00188.x](https://doi.org/10.1111/j.2517-6161.1955.tb00188.x)

<a id="ref-DV2003a"></a>Daley, D. J. and Vere-Jones, D. (2003). *An Introduction to the Theory of Point Processes, Vol. I: Elementary Theory and Methods*. Springer (2nd ed.).

<a id="ref-DV2008a"></a>Daley, D. J. and Vere-Jones, D. (2008). *An Introduction to the Theory of Point Processes, Vol. II: General Theory and Structure*. Springer (2nd ed.).

<a id="ref-Dig1985a"></a>Diggle, P. J. (1985). A kernel method for smoothing point process data. *Journal of the Royal Statistical Society: Series C (Applied Statistics)* 34(2), 138–147. [doi:10.2307/2347366](https://doi.org/10.2307/2347366)

<a id="ref-Haw1971a"></a>Hawkes, A. G. (1971). Spectra of some self-exciting and mutually exciting point processes. *Biometrika* 58(1), 83–90. [doi:10.1093/biomet/58.1.83](https://doi.org/10.1093/biomet/58.1.83)

<a id="ref-HO1974a"></a>Hawkes, A. G. and Oakes, D. (1974). A cluster process representation of a self-exciting process. *Journal of Applied Probability* 11(3), 493–503. [doi:10.2307/3212693](https://doi.org/10.2307/3212693)

<a id="ref-LA2014a"></a>Linderman, S. W. and Adams, R. P. (2014). Discovering latent network structure in point process data. arXiv:1402.0914. [doi:10.48550/arXiv.1402.0914](https://doi.org/10.48550/arXiv.1402.0914)

<a id="ref-MSW1998a"></a>Møller, J., Syversveen, A. R. and Waagepetersen, R. P. (1998). Log Gaussian Cox processes. *Scandinavian Journal of Statistics* 25(3), 451–482. [doi:10.1111/1467-9469.00115](https://doi.org/10.1111/1467-9469.00115)

<a id="ref-MAM2009a"></a>Murray, I., Adams, R. P. and MacKay, D. J. C. (2009). Elliptical slice sampling. arXiv:1001.0175. [doi:10.48550/arXiv.1001.0175](https://doi.org/10.48550/arXiv.1001.0175)

<a id="ref-Oga1998a"></a>Ogata, Y. (1998). Space-time point-process models for earthquake occurrences. *Annals of the Institute of Statistical Mathematics* 50(2), 379–402. [doi:10.1023/A:1003403601725](https://doi.org/10.1023/A:1003403601725)

<a id="ref-Ras2013a"></a>Rasmussen, J. G. (2013). Bayesian inference for Hawkes processes. *Methodology and Computing in Applied Probability* 15(3), 623–642. [doi:10.1007/s11009-011-9272-5](https://doi.org/10.1007/s11009-011-9272-5)

## See Also

- [Factsheet](factsheet.md) · [Intensity Function](intensity-function.md) · [Goodness of Fit](goodness-of-fit.md) · [Decision Guide](decision-guide.md)
