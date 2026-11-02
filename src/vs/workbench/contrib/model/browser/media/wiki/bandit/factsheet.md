# Factsheet

**Bandit Problems** simulates a Bernoulli multi-armed bandit, and runs epsilon-greedy, UCB or Thompson sampling on it.

## What the Bandit Problems Panel Does

| Item | Detail |
|---|---|
| Purpose | Balance exploration and exploitation, and measure the cost through regret |
| Julia stack | `Random` and `Statistics` for simulation, `Distributions.jl` for Beta draws, `Plots.jl` for figures; `ReinforcementLearning.jl` is named and not loaded |
| Tabs | **epsilon-Greedy**, **UCB**, **Thompson Sampling** |
| Input shape | No data: rewards are simulated from the probabilities given |
| Reward | 0 or 1, independently at each pull |
| Printed result | `total_reward`, `pulls_per_arm`, `best_arm`, `share_on_best_arm`, `final_regret` |
| Functions for Next Steps | `run_bandit`, `mean_regret`, `choose` |

## What the Inputs of the Bandit Problems Panel Default To

| Input | Default | Tabs |
|---|---|---|
| **Arm Success Probabilities** | [0.10, 0.25, 0.40, 0.55, 0.50] | All |
| **Steps** | 1000 | All |
| **Monte Carlo Runs** | 200 | All, for averaged actions |
| **Random Seed** | 1 | All, for the main run |
| **Exploration (epsilon)** | 0.1 | **epsilon-Greedy** |
| **UCB Constant (c)** | 1.41 | **UCB** |
| **Prior alpha** | 1 | **Thompson Sampling** |
| **Prior beta** | 1 | **Thompson Sampling** |

The default arms set a real test: the best arm, the fourth, leads the fifth by only 0.05.

## What Each Selection Rule in the Panel Computes

| Tab | Rule at step t | First steps |
|---|---|---|
| **epsilon-Greedy** | With probability epsilon a random arm, else argmax W / N | Random for K steps |
| **UCB** | argmax W / N + c sqrt(log t / N) | Each arm once |
| **Thompson Sampling** | argmax of one draw from Beta(alpha + W, beta + N − W) per arm | From the prior |

N holds the pulls and W the successes per arm, and K is the number of arms.

## What Each Next Step in the Panel Runs

| Action | Runs |
|---|---|
| **Cumulative Reward**, **Action Frequency**, **Estimate Accuracy**, **Arm Estimates**, **Posterior / Confidence Bounds** | The main run, `res` |
| **Regret Plot**, **Exploration Over Time**, **Regret Decomposition**, **Lai-Robbins Bound** | **Monte Carlo Runs** |
| **Optimal Arm** | Main run and **Monte Carlo Runs** |
| **Regret Forecast** | **Monte Carlo Runs** at four times **Steps** |
| **Algorithm Benchmark** | **Monte Carlo Runs** for each of three rules |
| **Parameter Sweep** | **Monte Carlo Runs** for each of 5 or 6 values |

## See Also

- [Overview](overview.md) · [epsilon-Greedy](epsilon-greedy.md) · [UCB](ucb.md) · [Thompson Sampling](thompson-sampling.md) · [Diagnostics](diagnostics.md)
