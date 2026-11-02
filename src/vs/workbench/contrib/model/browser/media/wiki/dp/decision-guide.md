# Decision Guide

The choices are whether exact dynamic programming fits the problem, how to model the uncertainty, which algorithm to run, and how to set the discount and the grid.

## Which Tab Fits the Problem

| Situation | Tab |
|---|---|
| Outcomes known in advance | **Deterministic** |
| Random outcomes with known probabilities | **Stochastic** |
| Want the value of planning for uncertainty | Both, then compare `value_at_empty_stock` |

Use **Deterministic** first if a mean-value answer may be a good guide, and use **Stochastic** to measure how much is lost by it. A stochastic model costs little here, as only the transition table grows.

## When Exact Dynamic Programming Is the Right Tool

| Situation | Better tool |
|---|---|
| Small discrete state, known model | Exact DP, as in the panel |
| Hidden state | POMDP tools (`POMDPs.jl`) |
| Large or continuous state | Approximate DP, reinforcement learning |
| Model unknown, learned from experience | Reinforcement learning |
| Convex problem with stagewise independent noise | Stochastic dual dynamic programming |

Exact DP does not need convexity or smooth dynamics. Its limit is the size of the state, so a state of more than a few discrete variables usually points to another row.

## Which Algorithm to Run

| Method | Best when |
|---|---|
| `PFI` | Small state, γ near 1, exact answer wanted |
| `VFI` | Large state, sparse transitions, or moderate γ |
| `MPFI` | Middle ground, often the fastest in practice |
| `backward_induction` | Finite horizon, with policies by period |

Policy iteration solves a linear system each round, and [Ye (2011)](#ref-Ye2011a) shows that it is strongly polynomial at a fixed discount. Partial evaluation, due to [Puterman and Shin (1978)](#ref-PS1978a), trades accuracy within a round for cheaper rounds.

## How to Choose the Discount

Base γ on the economics of the problem: a per-period interest rate i corresponds to γ = 1 / (1 + i). For an effective horizon of about H periods, use γ near 1 − 1 / H. Treat γ as a modelling input, and not as a tuning setting, since it changes the answer. Higher γ slows value iteration, as sweeps scale with 1 / (1 − γ), but it hardly slows policy iteration. Use **Discount Sensitivity** to see whether the policy, rather than the value, changes over the plausible range.

## How to Set the State Grid and Scenarios

Set **States (S)** high enough that the order-up-to level sits well below the top, and confirm by raising it. Here, an S above 20 is plenty, because the largest order is 10. Set **Demand Scenarios (N)** to represent the real distribution. Note the flat stretch in **Scenario Resolution**, which means that more scenarios do not always change the value. Fit the demand distribution from the data where it exists, in place of the even spacing used in the code.

## What to Report from a Solution

Give the states, actions, reward and transition rules, the discount, and the solver with its tolerance. Report the policy in words, such as order up to 10, along with the value and its meaning. State the checks: agreement among methods, Monte Carlo against the exact value, and capacity not binding. Mention the sensitivity to the discount and to demand. Describe the result as optimal for the model, which is the only sense of optimal available to exact DP.

## References

<a id="ref-PS1978a"></a>Puterman, M. L. and Shin, M. C. (1978). Modified policy iteration algorithms for discounted Markov decision problems. *Management Science* 24(11), 1127–1137. [doi:10.1287/mnsc.24.11.1127](https://doi.org/10.1287/mnsc.24.11.1127)

<a id="ref-Ye2011a"></a>Ye, Y. (2011). The simplex and policy-iteration methods are strongly polynomial for the Markov decision problem with a fixed discount rate. *Mathematics of Operations Research* 36(4), 593–603. [doi:10.1287/moor.1110.0516](https://doi.org/10.1287/moor.1110.0516)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Deterministic DP](deterministic.md) · [Stochastic DP](stochastic.md)
