# Overview

Dynamic programming splits a sequence of decisions into one decision now and the value of what follows. The panel applies it to a small inventory problem, with known demand on one tab and random demand on the other.

## What Dynamic Programming Solves

Each period, a decision maker sees a state, picks an action, collects a reward, and moves to a new state. The aim is a rule that gives the best action in every state, called a policy. Listing whole sequences grows hopelessly with the horizon, so the method works with one value per state. [Bellman (1954)](#ref-Bel1954a) stated the principle of optimality: whatever the first decision, the remaining decisions must be optimal for the state that results.

## What the Bellman Equation Says

The value of a state is the best reward now plus the discounted value of the next state:

- V(s) = max over a of { r(s, a) + γ Σ P(s' | s, a) V(s') }

The discount γ below 1 makes the right-hand side a contraction, so one solution exists and repeated substitution reaches it. [Shapley (1953)](#ref-Sha1953a) had already used that kind of argument for stochastic games. Once V is known, the best action in each state follows from the same formula.

## Which Problem the Panel Solves

A shop holds s units, orders a units, and then meets demand. Sales beyond the stock are lost, and leftovers carry over. The reward is 8 per unit sold, less 2 per unit ordered, less 0.5 per leftover unit. Orders are at most 10 units, and stock cannot pass the capacity in **States (S)**.

| Tab | Demand |
|---|---|
| **Deterministic** | Always 5 |
| **Stochastic** | N equally likely values between 0 and 10, mean 5 |

Both tabs solve the same equation with `DiscreteDP` from `QuantEcon.jl`, and [Sargent and Stachurski (2024)](#ref-SS2024a) teach the tools in Julia.

## How the Equation Is Solved

| Method | Idea | Code |
|---|---|---|
| Value iteration | Apply the right-hand side repeatedly | `VFI` |
| Policy iteration | Evaluate a policy exactly, then improve it | `PFI` |
| Modified policy iteration | Evaluate a policy only partly, then improve it | `MPFI` |
| Backward induction | Work back from the last period of a finite horizon | `backward_induction` |

Policy iteration, from [Howard (1960)](#ref-How1960a), is the panel's main solver.

## A Common Workflow for a New Setting

1. Run a tab, and read `value_at_empty_stock` and `order_up_to`.
2. Check **Convergence** and **Value vs Policy Iteration**.
3. Confirm the value with **Policy Evaluation**.
4. Look at **Value Function** and **Optimal Policy**.
5. Watch the policy act in **Policy Simulation**.
6. Test the settings with **Discount Sensitivity** and **Horizon Sensitivity**.

On the default problem, the hand answers in the two tab wikis give a further check at the first step.

## References

<a id="ref-Bel1954a"></a>Bellman, R. (1954). The theory of dynamic programming. *Bulletin of the American Mathematical Society* 60(6), 503–515. [doi:10.1090/S0002-9904-1954-09848-8](https://doi.org/10.1090/S0002-9904-1954-09848-8)

<a id="ref-How1960a"></a>Howard, R. A. (1960). *Dynamic Programming and Markov Processes*. MIT Press.

<a id="ref-SS2024a"></a>Sargent, T. J. and Stachurski, J. (2024). *Quantitative Economics with Julia*. [julia.quantecon.org](https://julia.quantecon.org)

<a id="ref-Sha1953a"></a>Shapley, L. S. (1953). Stochastic games. *Proceedings of the National Academy of Sciences* 39(10), 1095–1100. [doi:10.1073/pnas.39.10.1095](https://doi.org/10.1073/pnas.39.10.1095)

## See Also

- [Factsheet](factsheet.md) · [Deterministic DP](deterministic.md) · [Stochastic DP](stochastic.md) · [Decision Guide](decision-guide.md)
