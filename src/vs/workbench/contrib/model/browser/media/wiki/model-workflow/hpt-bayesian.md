# Bayesian Optimisation

Bayesian optimisation uses the scores obtained so far to decide what to try next. Each evaluation is costly, so effort goes into choosing it well.

## What Bayesian Optimisation Computes

The approach builds a cheap statistical model of how scores relate to settings, and uses it to pick the next point, balancing promising regions against unexplored ones. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) set out the idea with a Gaussian process and expected improvement, and [Shahriari, Swersky, Wang, Adams and de Freitas (2016)](#ref-SSWAF2016a) review the field. The **Bayesian** tab uses a different surrogate, through `MLJTreeParzenTuning` from TreeParzen.jl.

## How the Tree-Structured Parzen Estimator Chooses

The estimator of [Bergstra, Bardenet, Bengio and Kégl (2011)](#ref-BBBK2011a) models the settings given the score, and not the other way round. Past configurations are split into a better group and a worse group by a quantile of their scores. A density is fitted to the settings of each group, l(x) for the better and g(x) for the worse. Candidates are drawn from l(x), and the one with the highest ratio l(x) / g(x) is evaluated next. That ratio is tied to expected improvement. Each hyperparameter gets its own density, which makes categorical and conditional spaces easy to handle. The price is that interactions between hyperparameters are poorly captured.

## How the Bayesian Tab Reads the Panel Inputs

**Calls** is the total number of configurations, with a default of 30, so the default run takes 150 fits at 5 folds. `random_trials=10` is fixed in the generated code, so the first 10 calls are random draws, and with **Calls** at 10 or fewer the tab is simply random search. The space is a `Dict` of TreeParzen.jl expressions. `HP.Choice` lists discrete candidates, and `HP.LogUniform` takes the logarithms of its bounds, as in `log(0.001)` and `log(0.3)`, a common source of mistakes. Using **Performance Measure**, **CV Folds**, **Feature Matrix** and **Target Vector** works as in the other tabs.

## What Bayesian Optimisation Does Well

When each fit is expensive and the budget is small, using earlier results can find a good region in fewer evaluations than blind draws. Mixed spaces of categorical and continuous settings pose no difficulty for this estimator. A long search tends to concentrate its evaluations around the best settings it has found, so a late refinement costs nothing extra to set up. The scale of the score does not matter either, because only its ranking enters the split into two groups.

## Where Bayesian Optimisation Misleads

With few calls beyond the random start, the surrogate has little to go on, and the gain over **Random Search** can be small. Scores from cross-validation are noisy, so a lucky early score can pull later draws towards it. Concentrating draws also leaves less known about the rest of the space, and a second good region may go unseen. Because each draw depends on earlier scores, the search is sequential by nature, and running draws in parallel loses part of the benefit. Selection bias remains too: the winning score is the best of many tries, and a model tuned towards one set of folds can overfit those folds.

## What to Compare Bayesian Optimisation With

**Random Search** with the same number of configurations and the same space is the baseline to beat, since the extra machinery should earn its place. Compare on data set aside, and over more than one seed if the budget allows, as one run shows little. The generated **Random Search** range for `min_purity_increase` differs from the one here, so align them first. **Best Parameters Summary** shows the leading configurations. Top entries that lie close together show that the search has concentrated, and their scores then say little about the wider space.

## References

<a id="ref-BBBK2011a"></a>Bergstra, J., Bardenet, R., Bengio, Y. and Kégl, B. (2011). Algorithms for hyper-parameter optimization. *Advances in Neural Information Processing Systems* 24.

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M. and Welch, W. J. (1998). Efficient global optimization of expensive black-box functions. *Journal of Global Optimization* 13(4), 455–492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-SSWAF2016a"></a>Shahriari, B., Swersky, K., Wang, Z., Adams, R. P. and de Freitas, N. (2016). Taking the human out of the loop: A review of Bayesian optimization. *Proceedings of the IEEE* 104(1), 148–175. [doi:10.1109/JPROC.2015.2494218](https://doi.org/10.1109/JPROC.2015.2494218)

## See Also

- [Overview](hpt-overview.md) · [Grid Search](hpt-grid.md) · [Random Search](hpt-random.md) · [Choosing a Strategy](hpt-strategy.md)
