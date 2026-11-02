# Decision Guide

The right rule depends on the horizon, the feedback, and whether the aim is to earn during learning or to identify a winner at the end.

## Which Bandit Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| A simple baseline, easy to explain | **epsilon-Greedy** | One number, no model |
| Rewards that drift slowly | **epsilon-Greedy** | Never stops sampling all arms |
| A deterministic rule with a guarantee and no tuning | **UCB** | A finite-time bound with no prior |
| Prior knowledge available, or delayed feedback | **Thompson Sampling** | Beliefs and randomised choices |
| Good default performance on Bernoulli rewards | **Thompson Sampling** | Often the strongest in practice |

## When a Bandit Is Better Than an A/B Test

A fixed experiment divides subjects equally and picks a winner at the end, which gives a clean estimate of every arm. A bandit moves subjects to better arms during the run, which lowers the cost of learning. Choose a bandit when each decision has real value and the option can be changed as evidence comes in. Choose a fixed experiment when an unbiased comparison of all arms is the goal, or when feedback is too delayed to act on. [Lattimore and Szepesvári (2020)](#ref-LS2020a) cover the regret side of that trade-off.

## How the Horizon Changes the Choice

A short horizon leaves little time to benefit from what is learned, so less exploration is needed, and gaps too small to resolve can be ignored. A long horizon rewards careful exploration, and it brings out the difference between linear and logarithmic regret. Set **Steps** to the real horizon, and read the curves at that point. A rule that wins at 1000 steps can lose at 100000, as **Regret Forecast** begins to show. An unknown horizon favours **UCB** or **Thompson Sampling**, which need no such figure.

## How to Choose Parameters

Start with published defaults: epsilon of 0.1 as a baseline, c = sqrt(2) as a safe bound, and a uniform prior. **Parameter Sweep** shows sensitivity on the current arms, and a good value here does not imply a good value elsewhere, particularly as the best one in hindsight depends on gaps that a real user cannot know. Prefer settings that do reasonably across several plausible sets of arms, rather than the best on one. [Sutton and Barto (2018)](#ref-SB2018a) use parameter studies of this kind.

## When the Plain Bandit Is Not Enough

Features of the situation call for a contextual bandit. Arms that change over time call for sliding windows or discounting. A very large or continuous set of arms needs a model that shares information across them, such as Bayesian optimisation. Choices that change future states call for full reinforcement learning. A real deployment also needs guarding against biased reward signals, since an agent optimises what is measured, and the measure may not be what is meant.

## How to Report a Bandit Comparison

State the arms, the horizon, the number of runs, and all parameters, along with the spread and not only the mean. Bear in mind the default arms are only one instance. Give an honest baseline, such as **epsilon-Greedy**, and show the curves at more than one horizon. [Auer, Cesa-Bianchi and Fischer (2002)](#ref-ACF2002a) compare policies on several arm sets, as no single set settles a ranking. A claim that a method is best should name the arms it was tested on.

## References

<a id="ref-ACF2002a"></a>Auer, P., Cesa-Bianchi, N. and Fischer, P. (2002). Finite-time analysis of the multiarmed bandit problem. *Machine Learning* 47(2–3), 235–256. [doi:10.1023/A:1013689704352](https://doi.org/10.1023/A:1013689704352)

<a id="ref-LS2020a"></a>Lattimore, T. and Szepesvári, C. (2020). *Bandit Algorithms*. Cambridge University Press. [doi:10.1017/9781108571401](https://doi.org/10.1017/9781108571401)

<a id="ref-SB2018a"></a>Sutton, R. S. and Barto, A. G. (2018). *Reinforcement Learning: An Introduction*, 2nd ed. MIT Press. [incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [epsilon-Greedy](epsilon-greedy.md) · [UCB](ucb.md) · [Thompson Sampling](thompson-sampling.md)
