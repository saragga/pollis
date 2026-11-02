# Thompson Sampling

Thompson sampling picks a point according to the probability that it is the best. It does this by drawing from the posterior and then optimising the draw.

## How Thompson Sampling Selects a Point

The idea goes back to [Thompson (1933)](#ref-Tho1933a), who wrote on allocating treatments. For a Gaussian process, the ideal version draws one whole function from the posterior, and then evaluates the true function at the draw's optimum. Uncertain regions produce widely varying draws, so they sometimes win, while well-known regions win only if truly good. Exploration therefore needs no parameter. A single draw also explains the method's value in parallel work, as separate draws give naturally different points.

## What the Thompson Sampling Tab Actually Draws

The code calls `ThompsonSamplingSimple()`, the simple form. It draws an independent value at each candidate point, from N(mu(x), sigma²(x)), rather than one coherent function, and takes the best draw among candidates. The outcome is cheap, but it ignores the posterior correlation between points. It can behave differently from an exact draw, since many candidates in uncertain areas give many chances for one extreme value, which leans towards exploration. A result here therefore does not fully represent exact Thompson sampling.

## Why Thompson Sampling Suits Parallel Evaluations

Rules such as **Expected Improvement** are deterministic, so several workers given the same data would pick the same point, unless special steps prevent it. Thompson sampling gives each worker a different draw. [Kandasamy, Krishnamurthy, Schneider and Póczos (2017)](#ref-KKSP2017a) analyse that scheme, including asynchronous workers. Panel runs are sequential, so this benefit does not show here. It matters when several evaluations can run together, as with a cluster or a laboratory.

## Which Inputs the Thompson Sampling Tab Uses

**Objective Body**, **Dimension (n)**, **Lower Bound**, **Upper Bound** and **Evaluations** act as in every tab. There is no parameter, as the posterior sets the exploration. **Acquisition Guide** includes this rule on its 2000 candidates, and its result changes with each run. The surrogate's hyperparameters matter strongly here, as the draws take the posterior's uncertainty at face value. An overconfident surrogate gives draws that are too narrow, and the search too little exploration.

## Where Thompson Sampling Is Strong and Weak

Needing no tuning, and no incumbent, makes it attractive. It handles noise naturally, and extends to many model types. It is also weaker in some settings. A sequential, low-noise run often does better with **Expected Improvement**, because each draw is random, and some evaluations go on points of low merit. The results vary more from run to run, as a further source of randomness enters. In high dimensions, a draw over a limited set of candidates may poorly represent the search space.

## What to Compare Thompson Sampling With

**Acquisition Comparison** gives a fair test over seeds. **Run Consistency** measures spread, and a wide range is to be expected. **Evaluation Scatter** usually shows wider coverage than **Probability of Improvement**. Compare on the final best value, and not on any single run. The simple form used by the tab may rank differently from an exact posterior draw in the literature, so a comparison with published results needs that caveat. [Shahriari, Swersky, Wang, Adams and de Freitas (2016)](#ref-SSWAF2016a) review the family.

## References

<a id="ref-KKSP2017a"></a>Kandasamy, K., Krishnamurthy, A., Schneider, J. and Póczos, B. (2017). Asynchronous parallel Bayesian optimisation via Thompson sampling. [arXiv:1705.09236](https://arxiv.org/abs/1705.09236)

<a id="ref-SSWAF2016a"></a>Shahriari, B., Swersky, K., Wang, Z., Adams, R. P. and de Freitas, N. (2016). Taking the human out of the loop: a review of Bayesian optimization. *Proceedings of the IEEE* 104(1), 148–175. [doi:10.1109/JPROC.2015.2494218](https://doi.org/10.1109/JPROC.2015.2494218)

<a id="ref-Tho1933a"></a>Thompson, W. R. (1933). On the likelihood that one unknown probability exceeds another in view of the evidence of two samples. *Biometrika* 25(3–4), 285–294. [doi:10.1093/biomet/25.3-4.285](https://doi.org/10.1093/biomet/25.3-4.285)

## See Also

- [Factsheet](factsheet.md) · [Expected Improvement](ei.md) · [Probability of Improvement](pi.md) · [Upper Confidence Bound](ucb.md)
