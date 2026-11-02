# Upper Confidence Bound

Upper confidence bound rules treat every point as being as good as it could plausibly be. One parameter sets how far that optimism goes.

## How the Confidence Bound Rule Scores a Point

The rule chooses the point with the best optimistic value:

- Minimising: lower bound = mu(x) − beta × sigma(x), pick the lowest
- Maximising: upper bound = mu(x) + beta × sigma(x), pick the highest

The code's surrogate models −f, so it uses the upper form. Some authors write sqrt(beta) in place of beta, so published values need care. A point scores well through a good mean or through high uncertainty, with beta setting the exchange rate between the two. No incumbent enters, unlike the improvement-based rules.

## What Theory Says About the Confidence Bound Rule

[Srinivas, Krause, Kakade and Seeger (2010)](#ref-SKKS2010a) treat the search as a bandit problem over a continuous space, and show sublinear regret for GP-UCB, under smoothness assumptions and a beta that grows slowly with the number of evaluations. That means the average loss per evaluation goes to zero, so the rule finds the optimum in the long run. Their growing beta is often too conservative in practice, and a fixed value is a common simplification. It gives up that guarantee.

## How the Upper Confidence Bound Tab Is Set Up

The code calls `UpperConfidenceBound(NoBetaScaling(), 2.0)`, which holds beta at 2.0 for the whole run. `NoBetaScaling()` means that beta does not grow with the evaluations, and the panel has no input for it, so a change means editing the number in the code wherever it appears. Several Next Steps repeat the call, along with the same value. The remaining inputs are shared with the other tabs. The rule needs no incumbent, so its object does not have to be remade for each run.

## How to Choose beta

A larger beta explores more, and spreads evaluations across the box. A smaller beta exploits sooner, and approaches a pure search of the predicted mean at zero, which can stall. A rugged function with many basins favours more exploration, and a smooth function with a clear bowl favours less. Values around 1 to 3 are common starting points. The right scale depends on how well sigma is calibrated. An overconfident surrogate needs a larger beta to explore enough, as the review by [Shahriari, Swersky, Wang, Adams and de Freitas (2016)](#ref-SSWAF2016a) discusses.

## Where the Confidence Bound Rule Is Strong and Weak

Explicit control suits a user who wants to dial exploration in and out. The formula is simple, and it is cheap to maximise. It is free from the fragile incumbent of improvement-based rules, so noise is handled more gracefully. On the other hand, a poor beta can waste the budget, and the good value is not known ahead of time. Unlike **Expected Improvement**, it keeps sampling highly uncertain corners even when they cannot plausibly hold the best value, if beta is too large.

## What to Compare the Confidence Bound Rule With

**Acquisition Comparison** runs it against the others. To study its one parameter, edit the 2.0 and repeat **Run Consistency**. **Evaluation Scatter** shows how widely it sampled, and a large spread confirms that beta is doing its work. Note that `distance to incumbent` in **Acquisition Guide** measures the same tendency at a single moment. When a run ends, the observed best should be the reported answer, not a point that merely had a high bound.

## References

<a id="ref-SSWAF2016a"></a>Shahriari, B., Swersky, K., Wang, Z., Adams, R. P. and de Freitas, N. (2016). Taking the human out of the loop: a review of Bayesian optimization. *Proceedings of the IEEE* 104(1), 148–175. [doi:10.1109/JPROC.2015.2494218](https://doi.org/10.1109/JPROC.2015.2494218)

<a id="ref-SKKS2010a"></a>Srinivas, N., Krause, A., Kakade, S. M. and Seeger, M. W. (2010). Gaussian process optimization in the bandit setting: no regret and experimental design. *ICML*. [arXiv:0912.3995](https://arxiv.org/abs/0912.3995)

## See Also

- [Factsheet](factsheet.md) · [Expected Improvement](ei.md) · [Probability of Improvement](pi.md) · [Thompson Sampling](ts.md)
