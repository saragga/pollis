# epsilon-Greedy

Epsilon-greedy explores at a fixed rate and otherwise takes the arm that looks best. It is the simplest reasonable rule, and a standard baseline.

## How the epsilon-Greedy Tab Chooses an Arm

With probability **Exploration (epsilon)**, the rule pulls an arm at random among all arms. Otherwise, it pulls the arm with the highest estimate W / N. The first K pulls are random as well, so an arm can start with no pulls, and an estimate of zero, until exploration reaches it. Ties go to the lowest arm number, as `argmax` returns the first maximum. [Sutton and Barto (2018)](#ref-SB2018a) present the rule as their first answer to the exploration problem.

## Why Fixed epsilon Gives Linear Regret

Exploration never stops, so a share of pulls is always spent on poor arms, however much has been learned. Once the best arm is found, the regret per step settles at about:

- Regret per step = epsilon × (1 / K) × sum over arms of gap_a

Regret therefore grows in a straight line, and its slope is proportional to epsilon. **Regret Forecast** reports the late rate as `regret_per_step_late`, which can be compared with that formula. A rate that shrinks over time removes the problem, and [Auer, Cesa-Bianchi and Fischer (2002)](#ref-ACF2002a) show logarithmic regret for a decaying schedule.

## How to Choose epsilon

Large values find the best arm quickly and then pay for exploration for ever. Small values cost little per step, and risk locking on a poor arm for a long time. The best value depends on the horizon: a short run favours more exploration, and a long one favours less. It also depends on the gaps, since a small gap takes more samples to resolve, yet costs little if missed. **Parameter Sweep** tests 0.01, 0.05, 0.1, 0.2 and 0.3 at the current **Steps**, and the result changes when **Steps** changes.

## Which Inputs the epsilon-Greedy Tab Uses

**Exploration (epsilon)** must lie between 0 and 1. **Arm Success Probabilities** sets the arms, and the rule sees none of them directly. **Steps** sets the run length, and **Random Seed** the main run. **Monte Carlo Runs** sets how many runs enter averaged actions, each with its own seed from 1 upwards. **UCB Constant (c)**, **Prior alpha** and **Prior beta** have no effect here. To add a decaying rate, replace `epsilon` in `choose` with an expression in `t`, which the function already receives.

## Where epsilon-Greedy Is Strong and Weak

The rule is easy to explain, needs one number, and costs almost nothing to compute. It suits any reward type, and tolerates slow change in the arms, because it keeps sampling all of them. Its exploration is blind, however: an arm known to be poor gets as many random pulls as a promising one, whereas **UCB** and **Thompson Sampling** concentrate exploration where it may pay. On a long horizon, those rules leave it far behind.

## What to Compare epsilon-Greedy With

**Algorithm Benchmark** plots it with epsilon of 0.1 against **UCB** and **Thompson Sampling**. Short horizons can flatter it, so raise **Steps** to see the straight line pull away. **Lai-Robbins Bound** shows a curve flattening while the rule's regret keeps climbing. **Regret Decomposition** shows that much of its late regret comes from pulls of the worst arms, which targeted rules largely avoid.

## References

<a id="ref-ACF2002a"></a>Auer, P., Cesa-Bianchi, N. and Fischer, P. (2002). Finite-time analysis of the multiarmed bandit problem. *Machine Learning* 47(2–3), 235–256. [doi:10.1023/A:1013689704352](https://doi.org/10.1023/A:1013689704352)

<a id="ref-SB2018a"></a>Sutton, R. S. and Barto, A. G. (2018). *Reinforcement Learning: An Introduction*, 2nd ed. MIT Press. [incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Factsheet](factsheet.md) · [UCB](ucb.md) · [Thompson Sampling](thompson-sampling.md) · [Decision Guide](decision-guide.md)
