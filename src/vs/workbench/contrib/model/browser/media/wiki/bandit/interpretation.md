# Interpretation

Bandit results come in two kinds: how much a rule earned, and what it learned. The two can diverge, since a rule that earns well need not know every arm well.

## How to Read the Printed Results of a Bandit Run

The run prints `total_reward`, `pulls_per_arm`, `best_arm`, `share_on_best_arm` and `final_regret`. All except `best_arm` describe one run, with **Random Seed**. A total reward contains the luck of the draws, whereas `final_regret` is computed from true probabilities, so it depends only on the arms pulled. Regret is measured in expected rewards lost, against always pulling the best arm. `share_on_best_arm` reads simply, and should be judged against the gap to the second arm.

## How to Read Cumulative Reward Against the Oracle

**Cumulative Reward** plots one run's total against the expected total of an oracle, p_best × t. A wider gap means more loss. Rewards are random while the oracle is a straight expected line, so in a short run the two can cross, and a run can even lie above the oracle by luck. That is why regret, computed from gaps, gives a cleaner reading of how well the rule chose. Use the plot to convey scale, and rely on **Regret Plot** for judgement.

## How to Read Per-Arm Estimates

**Arm Estimates** lists each arm's true probability, pulls, successes and estimate. Trust an estimate according to its pulls. A good rule leaves poor arms with few pulls and rough estimates, and that is success, not a failure. Estimates for those arms tend to run low, as arms that begin badly get dropped. A learning aim that needs all arms to be measured well calls for a different design, such as a balanced experiment.

## How to Read Regret by Arm

**Regret Decomposition** splits average regret into gap × expected pulls, for each arm. The total equals expected final regret. Arms with small gaps often contribute most, as a rule struggles to tell them from the best, and pulls them more. Arms with large gaps are costly per pull but are soon dropped. For the default arms, expect the close second to absorb many pulls. Comparing tabs shows where the rules differ: **epsilon-Greedy** keeps paying on the worst arms, and the others pay on the near misses.

## How to Read Posteriors and Confidence Bounds

**Posterior / Confidence Bounds** changes with the tab. In **Thompson Sampling** it plots each arm's Beta posterior: a narrow peak is well known, and heavy overlap with the leader means that the arm still gets pulls. In **UCB**, it shows each mean and index at the final step: arms that share a similar index have all been pulled about as much as the rule wants. In **epsilon-Greedy**, it shows estimates with two standard errors, and true values. A posterior is a belief given the prior, and is not a long-run frequency.

## How to Read the Best Arm and the Forecast

**Optimal Arm** reports the most pulled arm as `believed_best`, its estimate, and `identified_correctly_share`, the share of runs with the true best arm most pulled. Under **Thompson Sampling**, it adds the posterior probability of being best. **Regret Forecast** gives expected regret at 1, 2 and 4 times **Steps**, with growth per unit of log t and per step late. Logarithmic growth, as [Lai and Robbins (1985)](#ref-LR1985a) show is the best possible order, gives a steady first figure and a shrinking second. Linear growth gives a steady second figure.

## References

<a id="ref-LR1985a"></a>Lai, T. L. and Robbins, H. (1985). Asymptotically efficient adaptive allocation rules. *Advances in Applied Mathematics* 6(1), 4–22. [doi:10.1016/0196-8858(85)90002-8](https://doi.org/10.1016/0196-8858(85)90002-8)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
