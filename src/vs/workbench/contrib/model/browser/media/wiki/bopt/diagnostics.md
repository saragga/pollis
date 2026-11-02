# Diagnostics

Diagnostics ask whether the surrogate is sensible, whether search is making progress, and whether the result stands up against a simple baseline.

## How to Read a Convergence Trace

**Convergence Trace** plots the best value so far against the evaluation. It steps down and never rises. Long flat stretches followed by a drop show that exploration paid off later, so a flat end does not prove convergence. Steps near the end suggest that a larger budget would help. The first part reflects the starting design, not the acquisition. There is no meaningful convergence test for a global search, so stopping is a matter of budget. Compare the final value with a known minimum where one exists, as in the default.

## How to Check the Surrogate's Hyperparameters

**GP Hyperparameters** prints the fitted length scales, one per dimension, and the noise level. Compare length scales with the size of the box. One close to the bounds, exp(-1) or exp(4), suggests the fit wants to go further. A very long length scale means a nearly flat dimension, or too little information. A very short one implies a surrogate that fits noise. For a deterministic function, a large noise level indicates a problem. [Rasmussen and Williams (2006)](#ref-RW2006a) discuss the fitting of such hyperparameters.

## How to See the Surrogate in One Dimension

**GP Posterior** forces n = 1, reruns, and plots the posterior mean with a band of 2 standard deviations, along with the observations. Band width should be small near points and wider away from them. Truth lying far outside the band reveals an overconfident surrogate. **Objective Body** must work with a vector of length 1. Where the function is known, overlaying it gives a direct test. A band that stays wide everywhere suggests a length scale too short. The plot is the most direct picture of what the method believes.

## How to Check Where the Search Looked

**Evaluation Scatter** plots the first two coordinates of the evaluated points, coloured by value, and it requires n ≥ 2. Good runs show a spread of points in the early stage and a concentration later. Heavy concentration from the start signals too little exploration, and an even scatter throughout signals too little exploitation. Points on the boundary are common, as uncertainty is greatest at the edges. With n > 2, only a projection is visible, so structure in other dimensions stays hidden.

## How to Test Against a Baseline

**Sample Efficiency** compares the method with uniform random search, with the same budget and over 10 seeds, and it prints medians, ranges and the number of wins. A method that cannot beat random search on a task has failed, whatever else it reports. **vs Gradient-Based** runs L-BFGS from **Evaluations** random starts, which makes many more function calls, as printed. Note that L-BFGS has no bounds in this call, and uses numerical gradients unless given one. The review by [Shahriari, Swersky, Wang, Adams and de Freitas (2016)](#ref-SSWAF2016a) discusses how such comparisons are made.

## How to Measure Stability Across Runs

**Run Consistency** repeats a run 10 times, and prints mean, standard deviation, best and worst. A small spread suggests that the result is reliable for this function and budget. A wide spread means that the budget is too small or that the surface is hard. Runs have no fixed seed, so repeated calls differ a little. **Multi-Start BO** keeps the best of five runs, which spends five times the budget. Spending the same total in one long run is often at least as good, since it keeps all its data.

## References

<a id="ref-RW2006a"></a>Rasmussen, C. E. and Williams, C. K. I. (2006). *Gaussian Processes for Machine Learning*. MIT Press. [gaussianprocess.org/gpml](https://gaussianprocess.org/gpml/)

<a id="ref-SSWAF2016a"></a>Shahriari, B., Swersky, K., Wang, Z., Adams, R. P. and de Freitas, N. (2016). Taking the human out of the loop: a review of Bayesian optimization. *Proceedings of the IEEE* 104(1), 148–175. [doi:10.1109/JPROC.2015.2494218](https://doi.org/10.1109/JPROC.2015.2494218)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
