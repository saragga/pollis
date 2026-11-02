# UCB

Upper Confidence Bound rules give each arm the benefit of the doubt. An arm is pulled when its estimate could plausibly be the best, so uncertainty itself draws exploration.

## How the UCB Tab Chooses an Arm

The first K pulls take each arm once. After that, the rule pulls the arm with the highest index:

- Index of arm a at step t: W_a / N_a + c × sqrt(log(t) / N_a)

The first term rewards a good record. The second grows slowly with time and falls as an arm is pulled, so a neglected arm eventually gets another try. **UCB Constant (c)** sets the bonus weight. No randomness enters, so given the rewards so far, the choice is fixed. Ties go to the lowest arm number.

## Why the UCB Bonus Has Its Form

Hoeffding's inequality bounds how far a mean of bounded rewards strays from the truth: the chance of a deviation above u is at most exp(−2 N u²). Choosing u so that this chance shrinks with time gives a bonus proportional to sqrt(log(t) / N), and the true mean then rarely exceeds the index. An arm's index stays high only if it has real promise or little evidence. As [Lattimore and Szepesvári (2020)](#ref-LS2020a) put it, the rule acts on optimism in the face of uncertainty.

## What Regret UCB Guarantees

[Auer, Cesa-Bianchi and Fischer (2002)](#ref-ACF2002a) prove a bound for every horizon, and not only in the limit, for the UCB1 choice of c = sqrt(2):

- Expected regret after n pulls ≤ 8 × sum over suboptimal arms of (log n / gap_a) + (1 + pi² / 3) × sum of gap_a

Growth is logarithmic, and a smaller gap costs more. The result needs rewards in the range from 0 to 1, and no knowledge of the gaps or the horizon. The constant is not tight, so actual regret usually falls well under the bound.

## How to Choose the UCB Constant

The default of 1.41 approximates sqrt(2). A larger **UCB Constant (c)** explores more and settles later. A smaller one exploits sooner, and often does better in practice because the theoretical value is conservative, but a value too small can lock on the wrong arm, and the guarantee no longer applies. **Parameter Sweep** tests 0.25, 0.5, 1.0, 1.41, 2.0 and 3.0. A value tuned on one set of arms need not carry over to another, particularly where the gaps differ.

## Which Inputs the UCB Tab Uses

**UCB Constant (c)** weighs the bonus. **Arm Success Probabilities** must leave at least as many **Steps** as arms, so that the first round can finish. **Random Seed** affects only the rewards, as the rule itself draws nothing. **Monte Carlo Runs** sets the averaging. **Exploration (epsilon)**, **Prior alpha** and **Prior beta** are ignored here. **Posterior / Confidence Bounds** draws each arm's mean with its upper bound, computed at the final step.

## Where UCB Is Strong and Weak

UCB has a clean guarantee, needs no prior, and needs no horizon. Its determinism makes it easy to audit and to replay. On the other hand, it needs an update after every pull, and rewards arriving in delayed batches make it repeat the same arm, which a randomised rule avoids. Its bonus ignores the variance of each arm, so it can over-explore arms with low variance. Variants such as the KL form, tighten that for Bernoulli rewards.

## References

<a id="ref-ACF2002a"></a>Auer, P., Cesa-Bianchi, N. and Fischer, P. (2002). Finite-time analysis of the multiarmed bandit problem. *Machine Learning* 47(2–3), 235–256. [doi:10.1023/A:1013689704352](https://doi.org/10.1023/A:1013689704352)

<a id="ref-LS2020a"></a>Lattimore, T. and Szepesvári, C. (2020). *Bandit Algorithms*. Cambridge University Press. [doi:10.1017/9781108571401](https://doi.org/10.1017/9781108571401)

## See Also

- [Factsheet](factsheet.md) · [epsilon-Greedy](epsilon-greedy.md) · [Thompson Sampling](thompson-sampling.md) · [Diagnostics](diagnostics.md)
