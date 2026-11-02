# Custom Rate

A jump rate that depends on the state links the timing of jumps to the path itself. The tab shows that case with a rate proportional to abs(X), and its code is the place to write a different rate.

## What the Custom Rate Tab Computes

The tab builds `rate(U, p, t) = lambda * abs(U[1])`, with `lambda` from **Jump rate lambda**, and `affect!` multiplies the state by 1 + 0.1 Z, with Z a standard normal draw. Both go into `VariableRateJump(rate, affect!)`, placed in `JumpProblem(prob, Direct(), jump)` over an SDE problem with a one-element array state. **Drift f(X,t)** and **Diffusion g(X,t)** apply only between jumps, and no compensator is subtracted. No **Jump aggregator** appears here, as `Direct()` has no constant-rate jump to schedule.

## How a Variable-Rate Jump Is Located in Time

The arrival of a jump is defined by the integrated rate. JumpProcesses.jl uses the default `VR_FRM` method: it appends a state that starts at minus an exponential draw and grows at the rate, and a continuous callback fires the jump when that state crosses zero. After the jump, a new draw starts the next wait. Thinning, in the sense of [Lewis and Shedler (1979)](#ref-LS1979a), would need an upper bound on the rate, as does the `Coevolve` aggregator of [Zagatti, Isaacson, Rackauckas, Ilin, Ng and Bressan (2024)](#ref-ZIRIN...2024a). No bound holds while a diffusion can carry X upward, so the panel does not offer that aggregator.

## What Formulas Define the Custom Rate Jump Process

- Instantaneous rate: lambda(X) = lambda abs(X)
- Jump factor: 1 + 0.1 Z, relative mean 0, relative standard deviation 0.1
- Log-jump: log(1 + 0.1 Z), which is not a normal variable
- Density of the log-jump at y: phi((exp(y) - 1) / 0.1) exp(y) / 0.1, with phi the standard normal density

**Jump rate lambda** has a different unit here: it is a rate per unit of time for each unit of X. **Ensemble Moments** prints only Monte Carlo values. The factor 0.1 and the form of the rate have no input and are edited in the code.

## Where the Custom Rate Tab Is Strong

Feedback between level and activity comes through directly: higher X brings more jumps, more of them push X around, and the state then determines the next rate. A new rate needs only a change to one line, for instance a rate depending on time. A relative jump with mean zero adds no local drift, so the continuous part alone sets the drift between jumps. Any solver in **SDE solver** can be used, although accuracy depends on it.

## Where the Custom Rate Tab Misleads

The line of **Jump Counting** claiming a Poisson count does not apply to a rate that follows the path. Jump times depend on the solver as well, since the crossing of zero is found along the numerical path, so a coarse **Step size dt** can move them. Growth in X raises the rate and so the cost of a run. With additive g, X can pass through zero, where the rate falls to 0 for an instant.

## How Custom Rate Differs from a Self-Exciting Process

In a self-exciting process, as in [Hawkes (1971)](#ref-Haw1971a), each event raises the future rate directly and the effect fades with time. In **Custom Rate** the rate looks only at the current X, and past jumps matter only through the level they left behind. With a relative jump of mean zero, a jump does not on average raise X, so no steady pile-up of events follows from one jump. Clusters may still appear when X runs high.

## What to Compare the Custom Rate Tab With

Set the rate to a constant in the code to compare with **Compound Poisson**. The jump law differs slightly, and a constant rate lets you check the mechanism against lambda T. To test timing, compare mean jump counts across solvers and steps. Moment equations do not close here, so **Ensemble Moments** has no theory line, and repeated runs at larger `trajectories` are the only reference. [Cont and Tankov (2004)](#ref-CT2004a) cover the constant-rate models from which this tab departs.

## References

<a id="ref-CT2004a"></a>Cont, R. and Tankov, P. (2004). *Financial Modelling with Jump Processes*. Chapman and Hall / CRC. [doi:10.1201/9780203485217](https://doi.org/10.1201/9780203485217)

<a id="ref-Haw1971a"></a>Hawkes, A. G. (1971). Spectra of some self-exciting and mutually exciting point processes. *Biometrika* 58(1), 83–90. [doi:10.1093/biomet/58.1.83](https://doi.org/10.1093/biomet/58.1.83)

<a id="ref-LS1979a"></a>Lewis, P. A. W. and Shedler, G. S. (1979). Simulation of nonhomogeneous Poisson processes by thinning. *Naval Research Logistics Quarterly* 26(3), 403–413. [doi:10.1002/nav.3800260304](https://doi.org/10.1002/nav.3800260304)

<a id="ref-ZIRIN...2024a"></a>Zagatti, G., Isaacson, S., Rackauckas, C., Ilin, V., Ng, S.-K. and Bressan, S. (2024). Extending JumpProcesses.jl for fast point process simulation with time-varying intensities. *JuliaCon Proceedings* 6(58), 133. [doi:10.21105/jcon.00133](https://doi.org/10.21105/jcon.00133)

## See Also

- [Factsheet](factsheet.md) · [Compound Poisson](compound-poisson.md) · [Gaussian Jumps](gaussian-jumps.md) · [Diagnostics](diagnostics.md)
