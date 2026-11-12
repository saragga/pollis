# Decision Guide

The choice of a jump-diffusion tab comes from three questions: how large jumps are, whether their timing depends on the state, and whether the input drift should already include them. Solver and aggregator matter much less to the model.

## Which Jump-Diffusion Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| Symmetric shocks with a known maximum size | **Compound Poisson** | Log-jumps stay inside (-0.2, 0.2), and mean log growth is unchanged |
| Mainly downward or upward shocks, as with crashes or news | **Gaussian Jumps** | **Jump mean muJ** sets the direction and **Jump std sigmaJ** the spread |
| Expected growth fixed by a model, and jumps not meant to change it | **Gaussian Jumps** | The code subtracts lambda kappa X from the drift |
| Jumps that arrive faster at higher levels of X | **Custom Rate** | The rate is lambda abs(X), and `rate` can be edited |
| No sudden moves at all | Diffusion Processes panel | Without a jump term a plain diffusion is simpler and cheaper |

## When a Constant or a State-Dependent Jump Rate Is Appropriate

A constant rate suits shocks from outside the system, unrelated to its level, and it comes with exact jump times, a closed form for the first two moments under linear f and g, and fast runs. A rate that depends on X suits feedback, as when activity rises with size. The price is a run time that climbs with X, as more jumps mean more work, and no closed form. A rate that responds to past jumps is a self-exciting process in the sense of [Hawkes (1971)](#ref-Haw1971a), which **Custom Rate** does not express, as its rate reads only the current X.

## How to Choose a Jump Size Law for a Jump-Diffusion

A normal log-jump is the standard start of [Merton (1976)](#ref-Mer1976a), with few parameters and simple cumulants. Its tails are thin, so large jumps are rare. The double-exponential law of [Kou (2002)](#ref-Kou2002a) has heavier tails and separate up and down behaviour, and running it requires editing `affect!`, `kappa`, `kappa2` and the overlay. The uniform law of **Compound Poisson** bounds the jump size, and its width is the constant `a` in the code. Choose the law from what is known about the size of shocks, as simulation cannot supply that knowledge.

## How to Choose the Solver and Aggregator for Jumps

| Input | Choice | Why |
|---|---|---|
| **SDE solver** | SRIW1 | Default, adaptive and of strong order 3/2 for scalar or diagonal noise |
| **SDE solver** | EM | Simple reference at a fixed step, useful as a check on another solver |
| **SDE solver** | LambaEM | Adaptive at strong order 1/2, as a check on SRIW1 |
| **SDE solver** | RKMil | Strong order 1, adaptive, starting from **Step size dt** |
| **Jump aggregator** | **Direct** | One jump channel gives **SortingDirect** nothing to sort |

## What the Jump-Diffusion Panel Does Not Decide

The panel takes parameters as given. It does not test observed data for the presence of jumps, for which bipower variation is one tool ([Barndorff-Nielsen and Shephard (2004)](#ref-BS2004a)). It does not fit lambda, muJ or sigmaJ, and it does not value options. [Shreve (2004)](#ref-Shr2004a) treats pricing under jump processes. A rate bound and `Coevolve` could speed up some problems, but the bound fails when a diffusion moves the state, as here.

## References

<a id="ref-BS2004a"></a>Barndorff-Nielsen, O. E. and Shephard, N. (2004). Power and bipower variation with stochastic volatility and jumps. *Journal of Financial Econometrics* 2(1), 1–37. [doi:10.1093/jjfinec/nbh001](https://doi.org/10.1093/jjfinec/nbh001)

<a id="ref-Haw1971a"></a>Hawkes, A. G. (1971). Spectra of some self-exciting and mutually exciting point processes. *Biometrika* 58(1), 83–90. [doi:10.1093/biomet/58.1.83](https://doi.org/10.1093/biomet/58.1.83)

<a id="ref-Kou2002a"></a>Kou, S. G. (2002). A jump-diffusion model for option pricing. *Management Science* 48(8), 1086–1101. [doi:10.1287/mnsc.48.8.1086.166](https://doi.org/10.1287/mnsc.48.8.1086.166)

<a id="ref-Mer1976a"></a>Merton, R. C. (1976). Option pricing when underlying stock returns are discontinuous. *Journal of Financial Economics* 3(1-2), 125–144. [doi:10.1016/0304-405X(76)90022-2](https://doi.org/10.1016/0304-405X(76)90022-2)

<a id="ref-Shr2004a"></a>Shreve, S. E. (2004). *Stochastic Calculus for Finance II: Continuous-Time Models*. Springer. [doi:10.1007/978-1-4757-4296-1](https://doi.org/10.1007/978-1-4757-4296-1)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md)
