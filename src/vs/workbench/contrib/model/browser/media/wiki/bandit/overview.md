# Overview

A bandit problem asks how to choose repeatedly among options whose rewards are unknown, when every choice both earns something and teaches something. The panel compares three classic rules on the same simulated arms.

## What a Bandit Problem Is

The name comes from a row of slot machines, each with its own unknown payout. At each step, an agent pulls one arm, sees that arm's reward, and sees nothing about the others. Pulling the arm that looks best earns more now, while pulling a less known arm may reveal a better one. That tension between exploitation and exploration is the heart of the problem. [Robbins (1952)](#ref-Rob1952a) set out the question in its modern form, and [Lattimore and Szepesvári (2020)](#ref-LS2020a) give a full treatment.

## What Regret Measures

Regret compares an agent with an oracle that always pulls the best arm:

- Gap of arm a: gap_a = p_best − p_a
- Cumulative regret after t steps: sum over steps of gap at the arm pulled
- Equivalently: sum over arms of gap_a × N_a(t)

The panel computes it from the true probabilities, so the noise of the rewards does not enter. Good rules make regret grow ever more slowly, while a bad rule makes it grow in a straight line. Regret can only be computed in a simulation, since a real agent does not know the best arm.

## How the Three Tabs of the Bandit Panel Differ

| Tab | How it explores | Parameter | Regret growth |
|---|---|---|---|
| **epsilon-Greedy** | Random arm at a fixed rate | **Exploration (epsilon)** | Linear |
| **UCB** | Bonus for uncertain arms | **UCB Constant (c)** | Logarithmic |
| **Thompson Sampling** | Draw from each arm's posterior | **Prior alpha**, **Prior beta** | Logarithmic |

Regret growth is the long-run shape, and short runs can hide it.

## What the Bandit Panel Simulates

Each arm pays 1 with its probability in **Arm Success Probabilities** and 0 otherwise. A run has **Steps** pulls. The main code runs once, with **Random Seed**, and prints the total reward, the pulls per arm, the share on the best arm and the final regret. Averaged actions rerun with seeds 1 up to **Monte Carlo Runs**. Code is written directly with `Random` and `Distributions.jl`, and `ReinforcementLearning.jl`, by [Tian (2020)](#ref-Tia...2020a), is named as the wider toolkit, not loaded by these tabs.

## A Common Workflow for a Bandit Study

1. Run one tab, and read the pulls in the printed result.
2. Use **Regret Plot** to see the average behaviour and its spread.
3. Use **Exploration Over Time** to see how fast the rule settles.
4. Use **Algorithm Benchmark** to compare all three on the same arms.
5. Use **Lai-Robbins Bound** to see the limit that no sensible rule can beat.
6. Use **Parameter Sweep** to test a rule's sensitivity.

## References

<a id="ref-LS2020a"></a>Lattimore, T. and Szepesvári, C. (2020). *Bandit Algorithms*. Cambridge University Press. [doi:10.1017/9781108571401](https://doi.org/10.1017/9781108571401)

<a id="ref-Rob1952a"></a>Robbins, H. (1952). Some aspects of the sequential design of experiments. *Bulletin of the American Mathematical Society* 58(5), 527–535. [doi:10.1090/S0002-9904-1952-09620-8](https://doi.org/10.1090/S0002-9904-1952-09620-8)

<a id="ref-Tia...2020a"></a>Tian, J. (2020). ReinforcementLearning.jl: a reinforcement learning package for the Julia programming language. [github.com/JuliaReinforcementLearning](https://github.com/JuliaReinforcementLearning/ReinforcementLearning.jl)

## See Also

- [Factsheet](factsheet.md) · [epsilon-Greedy](epsilon-greedy.md) · [UCB](ucb.md) · [Thompson Sampling](thompson-sampling.md) · [Decision Guide](decision-guide.md)
