# Assumptions

The panel studies the simplest bandit, and each simplifying assumption is one that a real application may break. Knowing which matters is the first step in choosing a method.

## Why the Arms Must Stay the Same Over Time

Each arm keeps one probability throughout a run. All three rules build on that: estimates pool every past pull with equal weight, and **UCB** and **Thompson Sampling** let exploration fade as evidence grows. If an arm changes, old pulls mislead, and a rule that has stopped exploring may never notice. **epsilon-Greedy** keeps sampling, and yet its estimate still averages over the old regime. The usual remedy is a sliding window or a discount, covered by [Lattimore and Szepesvári (2020)](#ref-LS2020a).

## What Independent Rewards Assume

Rewards are drawn independently, both across steps and across arms. Pulling one arm teaches nothing about another, and does not change it. Real choices can break this, as when a customer tires of a repeated advert, or when two arms share a feature and thus an outcome. Dependence between arms is often an opportunity, since shared structure reduces the amount of learning needed, but only a structured model can use it. Pulls that change later rewards turn the problem into a full reinforcement learning one.

## Why the Panel Ignores Context

No rule sees any information about the current situation, so the best arm is treated as the same for everybody at all times. Where the best arm varies with a user or a state, a rule that ignores such information settles on the arm that does best on average. A contextual bandit models reward as a function of features, and needs its own method. A panel study of plain bandits remains useful as a baseline, and as a way of understanding regret.

## What Binary Rewards and Immediate Feedback Assume

Rewards are 0 or 1, as a Bernoulli outcome. Regret bounds for **UCB** rest on bounded rewards, and the Beta posterior in **Thompson Sampling** rests on a Bernoulli likelihood, so other rewards need a rescale or another family. Results also arrive at once, before the next pull. Delays are common in practice, when an outcome takes days to appear. Then estimates lag, and a deterministic rule can pull the same arm many times before any reward arrives.

## What the Prior Assumes in Thompson Sampling

A Beta prior on every arm says that each arm's probability comes from the same belief, and that arms are unrelated. The uniform default claims little. A strong wrong prior slows learning, as the data need time to outweigh it, and a very pessimistic one makes the search too narrow in early steps. Over a long horizon the data dominate. Over a short one, the prior can change the outcome materially, which makes its choice part of the design, as [Russo, Van Roy, Kazerouni, Osband and Wen (2018)](#ref-RVKOW2018a) discuss.

## What the Monte Carlo Averages Assume

Averaged actions use seeds 1 to **Monte Carlo Runs**, and they ignore **Random Seed**. Averages rest on those runs alone, so a small number leaves visible noise. Rules in **Algorithm Benchmark** share seeds, but they use random numbers at different rates, so the rewards do not line up pull by pull. Differences are therefore not paired, and a small gap between two curves needs more runs. The true probabilities are also fixed across runs, so results speak to these arms alone.

## References

<a id="ref-LS2020a"></a>Lattimore, T. and Szepesvári, C. (2020). *Bandit Algorithms*. Cambridge University Press. [doi:10.1017/9781108571401](https://doi.org/10.1017/9781108571401)

<a id="ref-RVKOW2018a"></a>Russo, D., Van Roy, B., Kazerouni, A., Osband, I. and Wen, Z. (2018). A tutorial on Thompson sampling. *Foundations and Trends in Machine Learning* 11(1), 1–96. [doi:10.1561/2200000070](https://doi.org/10.1561/2200000070)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
