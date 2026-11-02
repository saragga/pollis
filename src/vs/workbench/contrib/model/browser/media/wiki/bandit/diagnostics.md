# Diagnostics

Diagnostics for a bandit ask whether a rule is learning, how quickly, and whether a result is solid or an accident of one run. Simulated arms make that possible, as the truth is known.

## How to Read a Regret Plot

**Regret Plot** draws mean cumulative regret over **Monte Carlo Runs**, with a band from the 10th to the 90th percentile. A curve that bends and flattens shows a rule that has settled on the right arm. A straight line shows steady loss, as a fixed epsilon produces. A wide band means that outcomes differ greatly across runs. Some runs may lock on a wrong arm and never recover, and the upper edge of the band shows them. Regret never falls, as a gap is never negative.

## How to See Which Arms a Rule Used

**Action Frequency** sets the pulls per arm in the main run next to the true probabilities. Good behaviour puts most pulls on the best arm, with few on arms with large gaps. Heavy pulls on a poor arm can signal a run that locked on early. One run is only an example, so compare with **Regret Decomposition**, which gives average pulls per arm, or try another **Random Seed**. With a small gap between the top two arms, shared pulls are to be expected over a modest horizon.

## How to Check Estimates Against the Truth

**Estimate Accuracy** tabulates each arm's estimate with a 95% interval and the true value. Rarely pulled arms have wide intervals, and it is fine for a good rule to leave a poor arm poorly estimated. Intervals use the normal approximation, so they fail with few pulls, or with an estimate of 0 or 1, where the standard error collapses to zero. Adaptive data bias them as well, since an arm that begins badly gets fewer pulls and so keeps a low estimate. Hence, they can miss the truth more often than 95% suggests.

## How to Watch Exploration Give Way to Exploitation

**Exploration Over Time** plots the share of pulls on the best arm in windows of 50 steps, averaged across runs. The curve should rise and level off. A level near 1 means that exploration has nearly stopped, and a plateau below that shows what remains. For **epsilon-Greedy** the ceiling is 1 − epsilon + epsilon / K. Slow rise points to a small gap, or to too much exploration. Early windows include the rule's initial pulls, so they sit near the 1 / K level.

## How to Compare a Rule with the Lower Bound

**Lai-Robbins Bound** plots mean regret against constant × log t, where constant = sum over suboptimal arms of gap_a / KL(p_a, p_best). [Lai and Robbins (1985)](#ref-LR1985a) prove that consistent rules cannot grow more slowly, asymptotically. The line is a limit for large t, so a curve can lie under it early. Rising above it and running parallel shows a rule of the right order. An arm with probability exactly 0 or 1 makes the code's KL undefined, and it then needs editing.

## How to Check That a Result Is Stable

Raise **Monte Carlo Runs**, and see whether curves move. A mean's standard error is the sd across runs / sqrt(**Monte Carlo Runs**), so doubling precision costs four times the runs. Change **Arm Success Probabilities** too, as one set of arms may favour one rule, and [Auer, Cesa-Bianchi and Fischer (2002)](#ref-ACF2002a) show the importance of the gaps. **Regret Forecast** runs four times **Steps** and reports the late rate per step. A rate close to zero implies that regret has flattened by then.

## References

<a id="ref-ACF2002a"></a>Auer, P., Cesa-Bianchi, N. and Fischer, P. (2002). Finite-time analysis of the multiarmed bandit problem. *Machine Learning* 47(2–3), 235–256. [doi:10.1023/A:1013689704352](https://doi.org/10.1023/A:1013689704352)

<a id="ref-LR1985a"></a>Lai, T. L. and Robbins, H. (1985). Asymptotically efficient adaptive allocation rules. *Advances in Applied Mathematics* 6(1), 4–22. [doi:10.1016/0196-8858(85)90002-8](https://doi.org/10.1016/0196-8858(85)90002-8)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
