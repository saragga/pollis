# Expected Improvement

Expected improvement scores a point by how much better than the current best it is likely to be, on average. It accounts for both the chance of a gain and its size.

## How Expected Improvement Is Computed

Write f_best for the lowest value so far. Improvement at x is max(f_best − f(x), 0). Taking its expectation under the Gaussian posterior gives a closed form:

- z = (f_best − mu(x)) / sigma(x)
- EI(x) = (f_best − mu(x)) Phi(z) + sigma(x) phi(z)

Phi and phi are the standard normal distribution and density. The first term rewards a low predicted mean, and the second rewards uncertainty. EI is zero at an observed point when noise is low, and it is cheap to compute everywhere.

## Why Expected Improvement Balances Search and Refinement

A point scores well either because its mean is low or because its uncertainty is high, so there is no explicit exploration setting. Once a region has been sampled, its sigma shrinks and its EI drops, and the search moves on. Far points eventually become attractive as they keep large uncertainty. The balance is automatic, which is why the method became standard after the efficient global optimisation scheme of [Jones, Schonlau and Welch (1998)](#ref-JSW1998a).

## How the Expected Improvement Tab Is Set Up

The code writes `acq = ExpectedImprovement()`, with no parameter. The package stores the incumbent inside the object, which is why **Acquisition Comparison** creates a fresh one for each run. **Evaluations** counts all calls to the objective, including a starting design of about 5 n points. **Dimension (n)**, **Lower Bound** and **Upper Bound** define the box. **Objective Body** is the function. The same surrogate settings apply in all tabs, so a change in result comes from the acquisition, along with random variation.

## Where Expected Improvement Is Strong

Smooth functions with few dimensions suit the rule well. No tuning is needed, and a small budget goes a long way. Its formula is differentiable, so it can be maximised efficiently. A long track record supports it, and the review by [Shahriari, Swersky, Wang, Adams and de Freitas (2016)](#ref-SSWAF2016a) treats it as one of the standard choices. When the aim is the lowest value in a limited number of noise-free evaluations, it is the natural first run.

## Where Expected Improvement Falls Short

Its definition takes the best observed value as certain, which is awkward under noise: a lucky observation sets a bar that nothing can clear. Noisy tasks may call for a variant built on the best posterior mean. It can also be too greedy on a function with many narrow basins, once the surrogate believes it knows the shape. Its surface becomes flat and multimodal as evidence grows, and finding its maximum is then a small optimisation problem of its own, in which an inner optimiser can fail.

## What to Compare Expected Improvement With

**Acquisition Comparison** runs all four on the same seeds. **Sample Efficiency** tests it against pure random search. **Budget Sensitivity** shows how returns fall with more evaluations. **Acquisition Guide** shows where each rule would go next from the same fitted surrogate. Expect differences to be modest on smooth low-dimensional functions, and do not rank methods on one run. Results with 10 seeds give only a rough ranking.

## References

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M. and Welch, W. J. (1998). Efficient global optimization of expensive black-box functions. *Journal of Global Optimization* 13(4), 455–492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-SSWAF2016a"></a>Shahriari, B., Swersky, K., Wang, Z., Adams, R. P. and de Freitas, N. (2016). Taking the human out of the loop: a review of Bayesian optimization. *Proceedings of the IEEE* 104(1), 148–175. [doi:10.1109/JPROC.2015.2494218](https://doi.org/10.1109/JPROC.2015.2494218)

## See Also

- [Factsheet](factsheet.md) · [Probability of Improvement](pi.md) · [Upper Confidence Bound](ucb.md) · [Thompson Sampling](ts.md)
