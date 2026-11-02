# Intensity Function

The conditional intensity is the common language of all five tabs. Likelihood, simulation, forecast and goodness of fit all come from it and from its integral. [Daley and Vere-Jones (2003)](#ref-DV2003a) give the formal treatment.

## What the Conditional Intensity of a Point Process Is

The conditional intensity lambda(t) is the rate of events at time t given the history before t:

lambda(t) = limit as d goes to 0 of P(event in [t, t + d) | history) / d

A larger lambda(t) means an event is more likely just after t, though it is not itself a probability and can exceed 1. Its unit is events per unit of time. For a Poisson process the history plays no part, and for a Hawkes process the history is the point of the model.

## How the Intensity Differs Across the Point Process Tabs

| Tab | lambda(t) | Depends on past events |
|---|---|---|
| **Poisson** | lambda | No |
| **Inhomogeneous** | n f(t) / e(t), a kernel estimate with edge correction | No |
| **Cox** | Baseline path plus sum of W theta exp(-theta (t - t_i)) | Through W |
| **Hawkes** | mu + sum of alpha exp(-beta (t - t_i)) | Yes |
| **Network Hawkes** | mu_n + sum of A W theta exp(-theta (t - t_i)) along links | Yes, across nodes |

## What the Compensator of a Point Process Is

The compensator is the integral of the intensity, written Lam(a, b) in the panel's code. It gives the expected count between a and b, conditional on how the history develops. `Lam` comes from `integrated_ground_intensity` in **Poisson**, from `HP.compensator` in **Hawkes**, and from `quadgk` in the other tabs, split at the jumps on **Cox** and **Network Hawkes**. The **Time-Rescaling Test** and **Q-Q Plot** rest on it, and so does **Next Event Time**: F(s) = 1 - exp(-Lam(T, T + s)) when no new event occurs in between.

## How the Likelihood of a Point Process Comes from the Intensity

For events t_1 to t_n on [0, T], the log-likelihood is

log L = sum over i of log lambda(t_i) - integral over [0, T] of lambda(t) dt

The first term rewards high intensity at the events. The second penalises high intensity everywhere, including the quiet time after the last event. **Log-Likelihood** prints this at the fit, with its value per event. HawkesProcesses.jl computes the integral with truncation at T. NetworkHawkesProcesses.jl counts each event's full offspring mass, which is an approximation near T.

## How Events Are Simulated from an Intensity

The thinning method of [Lewis and Shedler (1979)](#ref-LS1979a) proposes events at a constant upper rate and keeps each with probability lambda(t) over that rate, and **Inhomogeneous** uses it for the simulated example. [Ogata (1981)](#ref-Oga1981a) extended thinning to conditional intensities that depend on the history, with the upper rate updated as events occur. HawkesProcesses.jl uses the cluster form instead, in `HP.simulate_forward`, and draws immigrants and offspring in turn.

## How to Read a Plot of a Fitted Intensity

**Intensity Function** draws the fitted curve at 1000 points on [0, T]. Smooth curves on **Inhomogeneous** are the bandwidth's work, so their small bumps may be noise. Jumps on **Hawkes** are built into the model and occur at every event, so a saw-tooth is not evidence for excitation in itself. The height of the jumps is the evidence, against the baseline. **Effective Intensity** reads the same function just before each event.

## References

<a id="ref-DV2003a"></a>Daley, D. J. and Vere-Jones, D. (2003). *An Introduction to the Theory of Point Processes, Vol. I: Elementary Theory and Methods*. Springer (2nd ed.).

<a id="ref-LS1979a"></a>Lewis, P. A. W. and Shedler, G. S. (1979). Simulation of nonhomogeneous Poisson processes by thinning. *Naval Research Logistics Quarterly* 26(3), 403–413. [doi:10.1002/nav.3800260304](https://doi.org/10.1002/nav.3800260304)

<a id="ref-Oga1981a"></a>Ogata, Y. (1981). On Lewis simulation method for point processes. *IEEE Transactions on Information Theory* 27(1), 23–31. [doi:10.1109/TIT.1981.1056305](https://doi.org/10.1109/TIT.1981.1056305)

## See Also

- [Overview](overview.md) · [Goodness of Fit](goodness-of-fit.md) · [Interpretation](interpretation.md)
