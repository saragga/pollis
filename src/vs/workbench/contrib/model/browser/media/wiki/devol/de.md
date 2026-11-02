# Classic DE

The **DE** tab implements the original scheme, DE/rand/1/bin, with fixed settings. The name records the base vector, the number of differences and the type of crossover.

## How Mutation Builds a Candidate

Choose three distinct members, a, b and c, all different from the target:

- v = x_a + F (x_b − x_c)

In the code, `pick(NP, i, 3)` draws them, and `clamp.` holds the result inside the box. The difference x_b − x_c sets the direction and the size of a step. Differences reflect the shape of the population, so that a stretched population yields stretched steps. [Storn and Price (1997)](#ref-SP1997a) gave that self-organising rule. No covariance is computed, and no distribution is assumed.

## How Crossover and Selection Work

Binomial crossover takes each coordinate from the mutant with probability **Crossover Rate (CR)**, and it forces at least one with `jrand`, so that the trial always differs from its parent. Selection compares a trial with its own parent only, and the trial wins ties, with `fu <= fX[i]`. Accepting ties lets the search drift across flat regions. No member can ever get worse, and the best value cannot rise. Each member is updated in place within a generation, so that later members may use new values.

## How to Set F and CR

| Setting | Typical range | Effect |
|---|---|---|
| **Scale Factor (F)** | 0.5 to 0.9 | Small: fast, may stall. Large: wide, slower |
| **Crossover Rate (CR)** | 0.9 | Suits related variables |
| **Crossover Rate (CR)** | 0.1 | Suits separable problems |
| **Population Size** | About 10n | Small: fast, may collapse. Large: robust, slower |

The tuning advice in [Price, Storn and Lampinen (2005)](#ref-PSL2005a) starts there. Good settings depend on the problem, and that dependence is the reason for the adaptive tabs.

## What the Naming Scheme Covers

| Part | Options | Effect |
|---|---|---|
| Base | rand, best, current-to-best | Exploration against speed |
| Differences | 1, 2 | More variety at more cost |
| Crossover | bin, exp | Independent or contiguous coordinates |

Using the best member as the base converges quickly, and it risks losing variety. [Das and Suganthan (2011)](#ref-DS2011a) survey these strategies and many others. The tab uses the most robust classic form.

## How the Constrained Tab Extends DE

**epsilonDE** adds **Constraints g(x) <= 0**, with a violation measured as the sum of positive parts. Two points compare by objective when both violations are at most epsilon, or are equal, and by violation otherwise. Epsilon starts at the violation of the best 20% of the first population, and it shrinks as (1 − t/Tc)^5, to 0 at **Epsilon Horizon** of the run. That follows the idea of [Takahama and Sakai (2006)](#ref-TS2006a), without its gradient-based mutation. Early on, the search can pass through infeasible regions, which hard rules forbid. Check `final_violation` in **Convergence Check**.

## Where Classic DE Is Strong and Weak

DE is simple, and it often does surprisingly well on rugged continuous problems. Its code fits on a page. Differences carry no information from a single point, so it cannot use a gradient, and precision comes slowly compared with local methods. Evaluations are many, so that it suits cheap objectives. Clamping the mutant to the box can pile members onto the bounds. A local polish at the end, from the best point, is a sensible addition when the objective is smooth nearby.

## References

<a id="ref-DS2011a"></a>Das, S. and Suganthan, P. N. (2011). Differential evolution: a survey of the state-of-the-art. *IEEE Transactions on Evolutionary Computation* 15(1), 4–31. [doi:10.1109/TEVC.2010.2059031](https://doi.org/10.1109/TEVC.2010.2059031)

<a id="ref-PSL2005a"></a>Price, K. V., Storn, R. M. and Lampinen, J. A. (2005). *Differential Evolution: A Practical Approach to Global Optimization*. Springer. [doi:10.1007/3-540-31306-0](https://doi.org/10.1007/3-540-31306-0)

<a id="ref-SP1997a"></a>Storn, R. and Price, K. (1997). Differential evolution: a simple and efficient heuristic for global optimization over continuous spaces. *Journal of Global Optimization* 11(4), 341–359. [doi:10.1023/A:1008202821328](https://doi.org/10.1023/A:1008202821328)

<a id="ref-TS2006a"></a>Takahama, T. and Sakai, S. (2006). Constrained optimization by the ε constrained differential evolution with gradient-based mutation and feasible elites. *2006 IEEE International Conference on Evolutionary Computation*, 1–8. [doi:10.1109/CEC.2006.1688283](https://doi.org/10.1109/CEC.2006.1688283)

## See Also

- [Factsheet](factsheet.md) · [SHADE](shade.md) · [Adaptive DE](adaptive-de.md) · [Decision Guide](decision-guide.md)
