# Compound Poisson

A compound Poisson process is a sum of random jumps counted by a Poisson process. Here it multiplies a diffusion, with log-jumps drawn from a uniform law of fixed width.

## What the Compound Poisson Tab Computes

The **Compound Poisson** tab solves dX = f dt + g dW + X- (exp(J) - 1) dN, where N is a Poisson process of constant rate **Jump rate lambda** and each J is an independent Uniform(-a, a) draw. The code writes `a = 0.2`, and no input changes it. Between jumps the chosen **SDE solver** integrates **Drift f(X)** and **Diffusion g(X)**. At each jump, `affect!` replaces X by X exp(J). The result `sol` is one path over [0, **Time span T**], saved twice at each jump time.

## What the Compound Poisson Tab Uses as Inputs

| Input | Role in the tab | Default |
|---|---|---|
| **Drift f(X)** | Drift of the continuous part alone | `0.05*X` |
| **Diffusion g(X)** | Continuous noise, read in the Itô sense | `0.2*X` |
| **Jump rate lambda** | Expected jumps per unit of time | 2.0 |
| **Jump aggregator** | Scheduler of jump times | **Direct** |
| **SDE solver** | Integrator between jumps | SRIW1 |
| **Step size dt** | Step of EM, first step of RKMil | 0.001 |

## What the Compound Poisson Moments Are in Closed Form

The code computes kappa = sinh(a)/a - 1 and kappa2 = sinh(2a)/(2a) - 1, the means of exp(J) - 1 and exp(2J) - 1. With f = m X and g = s X:

- E[X(T)] = X0 exp((m + lambda kappa) T)
- E[X(T)^2] = X0^2 exp((2 m + s^2 + lambda kappa2) T)
- Mean of log growth: (m - s^2/2) T
- Variance of log growth: (s^2 + lambda a^2/3) T
- Fourth cumulant of log growth: lambda a^4 T / 5

**Ensemble Moments** prints the first two as its theory line. J has no third cumulant contribution, since Uniform(-a, a) is symmetric.

## How Jump Times Are Scheduled in the Compound Poisson Tab

The `ConstantRateJump` keeps the next jump time as a stopping time of the solver, so a step ends exactly on it. No step-size error enters the arrival times, and their law is exact at any **Step size dt**. Selecting **SortingDirect** adds a one-entry dependency graph, `dep_graph = [[1]]`, and with a single jump channel it leaves the law of arrivals as it was and has nothing to sort.

## Where the Compound Poisson Tab Is Strong

A bounded law keeps each jump to a known range: a log-jump under 0.2 in absolute size, or a factor between about 0.82 and 1.22. A symmetric J leaves mean log growth where the diffusion puts it, which makes the effect of jumps on spread and kurtosis easy to isolate in **With vs Without Jumps**. A positive state remains positive at a jump. The closed-form moments give a direct check of a run through **Ensemble Moments**.

## Where the Compound Poisson Tab Misleads

The upper limit on jump size is a modelling choice, and a real shock can exceed it. A symmetric J still raises E[X(T)], because exp is convex, so typing a drift while thinking of it as total growth understates the growth rate of the mean by lambda kappa. Editing `Uniform` inside `affect!` alone leaves `kappa`, `kappa2` and the overlay of **Jump Size Distribution** tied to the old law, without any warning. Theory printed under non-linear f or g has no validity.

## What to Compare the Compound Poisson Tab With

**Gaussian Jumps** uses an unbounded jump law and a compensated drift, so a comparison must allow for both differences. Setting muJ to 0 and sigmaJ to a / sqrt(3) gives log-jumps of equal variance. A pure diffusion with a variance of s^2 + lambda a^2/3 has the same spread of log growth without excess kurtosis, which isolates the shape of the jumps. [Cont and Tankov (2004)](#ref-CT2004a) treat finite-activity models of this kind in depth.

## References

<a id="ref-CT2004a"></a>Cont, R. and Tankov, P. (2004). *Financial Modelling with Jump Processes*. Chapman and Hall / CRC. [doi:10.1201/9780203485217](https://doi.org/10.1201/9780203485217)

## See Also

- [Factsheet](factsheet.md) · [Gaussian Jumps](gaussian-jumps.md) · [Custom Rate](custom-rate.md) · [Diagnostics](diagnostics.md)
