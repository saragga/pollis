# Probability of Improvement

Probability of improvement scores a point by how likely it is to beat the current best, whatever the size of the gain. It is the oldest of the four rules, and the greediest.

## How Probability of Improvement Is Computed

Under the Gaussian posterior:

- z = (f_best − xi − mu(x)) / sigma(x)
- PI(x) = Phi(z)

Phi is the standard normal distribution function, and xi ≥ 0 is an optional margin that the improvement must exceed. A margin of zero rewards any gain, however small. The idea goes back to [Kushner (1964)](#ref-Kus1964a), writing on locating the maximum of a multipeak curve. The panel's call `ProbabilityOfImprovement()` passes no margin.

## Why Probability of Improvement Is Greedy

A point very close to the current best has a good chance of a tiny gain, and so it scores highly, because small steps improve with near certainty. The rule ignores gain size, and so it can polish one region while better regions go unseen. Sampling then clusters tightly around the incumbent. **Acquisition Guide** shows this, as its printed distance to the incumbent tends to be the smallest for this rule. Early local refinement may look like good progress on **Convergence Trace**, and then stall at a poor value.

## How a Target Changes the Behaviour

A demanding margin changes the question to "how likely is a substantial gain?", and it forces the rule to look elsewhere. [Jones (2001)](#ref-Jon2001a) discusses how results depend on this target: too small a one gives local search, and too large a one gives a slow global search. A schedule of decreasing margins moves from exploration to exploitation. To add one, consult the constructor of the acquisition, or code a custom rule from the surrogate's predictions, with `predict_f` giving mu and sigma squared.

## Which Inputs the Probability of Improvement Tab Uses

**Objective Body**, **Dimension (n)**, **Lower Bound**, **Upper Bound** and **Evaluations** have their usual roles. With no parameter to set, its behaviour on a problem is decided by those inputs alone. As with all tabs, a starting design spreads the first points, so the greediness shows only afterwards. Too few **Evaluations** may therefore hide the difference from **Expected Improvement**, and a longer run shows it better.

## Where Probability of Improvement Is Useful

Use it when a good region is already known and the aim is to refine within it, for instance by shrinking **Lower Bound** and **Upper Bound** around a promising point. A tight budget that rules out exploration also favours it. It can act as a second stage, after a more exploratory rule has found a basin. Otherwise, one of the other tabs is usually a safer choice, and [Garnett (2023)](#ref-Gar2023a) treats the family of rules in full.

## What to Compare Probability of Improvement With

**Acquisition Comparison** shows whether greediness costs anything on the current function. Multimodal functions such as the default are harder for it than smooth bowls. **Run Consistency** often reveals a large spread for this rule, since runs that happen to start far from the best basin may stay there. **Evaluation Scatter** makes the behaviour visible for n ≥ 2, as points bunch up around one location. Comparing with **Expected Improvement** shows what accounting for gain size adds.

## References

<a id="ref-Gar2023a"></a>Garnett, R. (2023). *Bayesian Optimization*. Cambridge University Press. [bayesoptbook.com](https://bayesoptbook.com)

<a id="ref-Jon2001a"></a>Jones, D. R. (2001). A taxonomy of global optimization methods based on response surfaces. *Journal of Global Optimization* 21(4), 345–383. [doi:10.1023/A:1012771025575](https://doi.org/10.1023/A:1012771025575)

<a id="ref-Kus1964a"></a>Kushner, H. J. (1964). A new method of locating the maximum point of an arbitrary multipeak curve in the presence of noise. *Journal of Basic Engineering* 86(1), 97–106. [doi:10.1115/1.3653121](https://doi.org/10.1115/1.3653121)

## See Also

- [Factsheet](factsheet.md) · [Expected Improvement](ei.md) · [Upper Confidence Bound](ucb.md) · [Thompson Sampling](ts.md)
