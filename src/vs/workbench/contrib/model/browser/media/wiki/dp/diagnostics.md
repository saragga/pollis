# Diagnostics

A program solved exactly has no sampling error, so the checks ask whether the numbers have converged, whether independent routes agree, and whether the grid limits the answer.

## How to Read the Convergence Plot

**Convergence** starts value iteration from zero, and it plots the largest change per sweep on a log scale. Theory says the residual falls at least as fast as γ^k, shown as the dashed line. At γ = 0.95, starting from a first residual of about 40, reaching 1e-8 takes about 430 sweeps. A curve above the dashed line signals an error in the model. At a residual ε, the remaining error in V is at most ε γ / (1 − γ), as [Puterman (2005)](#ref-Put2005a) shows, so a small residual overstates accuracy when γ is close to 1.

## How to Compare the Three Algorithms

**Value vs Policy Iteration** runs `VFI`, `PFI` and `MPFI`. All three should reach the same policy, so `same_policy` is a useful check. A false value may just reflect ties, where two orders give the same value, or the tolerance of value iteration, so compare the values too. `iterations` count different kinds of step and are not comparable as work. Timings from `@elapsed` include compilation on the first call, so that `VFI`, which runs first, can look slow. Run the action twice before reading `ms`.

## How to Check the Value by Simulation

**Policy Evaluation** runs the policy 1000 times from empty stock, over a horizon where discounting leaves little behind: at γ = 0.95, 270 periods. The mean should fall within about two standard errors of `dp_value`. Monte Carlo only tests the value of the policy, and not its optimality. On **Deterministic**, every run is the same, and `std_error` is zero, which confirms the reward and transition logic but tells nothing about sampling. A large gap suggests that `build` and `simulate` disagree.

## How to Check the Results by Hand

The deterministic problem and the stochastic one with top coverage have closed forms:

| Quantity | Value at the defaults |
|---|---|
| **Deterministic** V(0) | 30 / (1 − γ) = 600 |
| **Deterministic** order-up-to level | 5 |
| **Stochastic** ratio | 6 / (8.5 − 2γ), about 0.909 |
| **Stochastic** order-up-to level at N = 10 | 10 |
| **Stochastic** V(0) at N = 10 | 27 / (1 − γ) = 540 |

After a change to prices or to demand, redo the short sums in [Deterministic DP](deterministic.md) and [Stochastic DP](stochastic.md), and compare before trusting a run.

## How to Check the Grid and the Horizon

**States (S)** should leave room above the order-up-to level. Check it in **Optimal Policy**: if stock after ordering reaches the top, then capacity binds, and a larger S may change the answer. Raise S and see if `value_at_empty_stock` moves. **Horizon Sensitivity** should show the finite-horizon value climbing to the dashed line, with a gap that shrinks by about γ per period. A failure to reach that line points to a bug, since the two computations should agree in the limit.

## References

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Deterministic DP](deterministic.md) · [Stochastic DP](stochastic.md)
