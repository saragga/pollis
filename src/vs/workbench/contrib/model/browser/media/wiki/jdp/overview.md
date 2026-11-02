# Overview

A jump-diffusion adds sudden moves to a continuous random path. The panel builds a stochastic differential equation for the continuous part and a jump process on top of it, and then solves the two together one path at a time.

## What a Jump-Diffusion Equation Says

The equation is dX = f(X,t) dt + g(X,t) dW + X- (exp(J) - 1) dN in the **Compound Poisson** and **Gaussian Jumps** tabs. X- is the state just before a jump, N counts the jumps, and J is a random log-jump drawn afresh each time. Between jumps X is an ordinary diffusion. At a jump it is multiplied by exp(J), so a positive state stays positive. A short horizon therefore has two sources of movement: small Gaussian moves of size sqrt(h), and a rare move of a size that does not shrink with h, with probability near lambda h.

## Where Jump-Diffusion Models Come From

[Press (1967)](#ref-Pre1967a) proposed a compound events model for security prices, combining Gaussian variation with a Poisson number of Gaussian shocks. [Merton (1976)](#ref-Mer1976a) placed log-normal jumps in a continuous-time price model and derived option values, treating jump risk as diversifiable. [Kou (2002)](#ref-Kou2002a) later used a double-exponential law for the jump size. [Cont and Tankov (2004)](#ref-CT2004a) give a full treatment of these models in finance. The panel simulates their paths and leaves valuation to other tools.

## How the Compound Poisson Tab Works

Jumps arrive at the constant **Jump rate lambda**, and each log-jump is drawn from Uniform(-a, a), where the code fixes a = 0.2. The mean relative jump is kappa = sinh(a)/a - 1, which is positive although J is symmetric. **Drift f(X,t)** applies to the continuous part alone, so jumps add expected growth of lambda kappa X on top of it. With the default a and lambda, lambda kappa is about 0.013.

## How the Gaussian Jumps Tab Works

Each log-jump is drawn from Normal(muJ, sigmaJ), the choice of Merton, so kappa = exp(muJ + sigmaJ^2/2) - 1. The code takes **Drift f(X,t)** as the total expected growth and passes f - lambda kappa X to the solver. With muJ at its default of -0.1 and sigmaJ at 0.05, kappa is about -0.094, and at the default lambda the continuous part has a drift of about 0.238 X. Jumps then remove on average what the higher continuous drift adds.

## How the Custom Rate Tab Works

The rate is lambda times abs(X), so jumps arrive faster when X is large, and the jump multiplies X by 1 + 0.1 Z with Z a standard normal draw. A rate that moves with the diffusion has no fixed schedule, so the code uses `VariableRateJump`. JumpProcesses.jl adds an extra state that starts at minus an exponential draw and grows at the rate, and a jump fires when that state crosses zero. The SDE solver integrates that state, so the accuracy of jump times depends on the solver as well. The code passes no rate bound, because the diffusion can carry X past any bound. The simulation of time-varying intensities in this package is described by [Zagatti et al. (2024)](#ref-ZIRIN...2024a).

## How the Panel Schedules Constant-Rate Jumps

For a `ConstantRateJump`, the aggregator draws the waiting time to the next jump from an exponential law and adds that time to the solver's stopping times, so the solver lands on it exactly. **Direct** is the method of [Gillespie (1976)](#ref-Gil1976a), and **SortingDirect** is that of [McCollum et al. (2006)](#ref-MPCSS2006a). They differ in how they search many reaction channels. The panel has one jump channel, so **SortingDirect** gives no gain in speed here. The underlying package is part of the ecosystem of [Rackauckas and Nie (2017)](#ref-RN2017a).

## A Common Workflow in the Jump-Diffusion Panel

1. Pick the tab from the jump law and the rate, and decide what the drift should mean.
2. Run the code, then view one path through **Plot Trajectory**.
3. Run **Jump Counting** on that path against the integrated intensity.
4. Run **Ensemble Moments** to compare Monte Carlo moments with theory where the panel prints it.
5. Use **With vs Without Jumps** to see how the jumps change the law of log growth.
6. Use **Jump Size Distribution** to check realised jumps against the assumed law.
7. Halve the step or tighten the tolerances, and repeat until the results stop changing beyond sampling noise.

## References

<a id="ref-CT2004a"></a>Cont, R. and Tankov, P. (2004). *Financial Modelling with Jump Processes*. Chapman and Hall / CRC. [doi:10.1201/9780203485217](https://doi.org/10.1201/9780203485217)

<a id="ref-Gil1976a"></a>Gillespie, D. T. (1976). A general method for numerically simulating the stochastic time evolution of coupled chemical reactions. *Journal of Computational Physics* 22(4), 403–434. [doi:10.1016/0021-9991(76)90041-3](https://doi.org/10.1016/0021-9991(76)90041-3)

<a id="ref-Kou2002a"></a>Kou, S. G. (2002). A jump-diffusion model for option pricing. *Management Science* 48(8), 1086–1101. [doi:10.1287/mnsc.48.8.1086.166](https://doi.org/10.1287/mnsc.48.8.1086.166)

<a id="ref-MPCSS2006a"></a>McCollum, J. M., Peterson, G. D., Cox, C. D., Simpson, M. L. and Samatova, N. F. (2006). The sorting direct method for stochastic simulation of biochemical systems with varying reaction execution behavior. *Computational Biology and Chemistry* 30(1), 39–49. [doi:10.1016/j.compbiolchem.2005.10.007](https://doi.org/10.1016/j.compbiolchem.2005.10.007)

<a id="ref-Mer1976a"></a>Merton, R. C. (1976). Option pricing when underlying stock returns are discontinuous. *Journal of Financial Economics* 3(1-2), 125–144. [doi:10.1016/0304-405X(76)90022-2](https://doi.org/10.1016/0304-405X(76)90022-2)

<a id="ref-Pre1967a"></a>Press, S. J. (1967). A compound events model for security prices. *The Journal of Business* 40(3), 317. [doi:10.1086/294980](https://doi.org/10.1086/294980)

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: a performant and feature-rich ecosystem for solving differential equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-ZIRIN...2024a"></a>Zagatti, G., Isaacson, S., Rackauckas, C., Ilin, V., Ng, S.-K. and Bressan, S. (2024). Extending JumpProcesses.jl for fast point process simulation with time-varying intensities. *JuliaCon Proceedings* 6(58), 133. [doi:10.21105/jcon.00133](https://doi.org/10.21105/jcon.00133)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Compound Poisson](compound-poisson.md) · [Gaussian Jumps](gaussian-jumps.md) · [Custom Rate](custom-rate.md)
