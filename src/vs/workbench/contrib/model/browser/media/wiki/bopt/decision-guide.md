# Decision Guide

Bayesian optimisation is one option among many for a black-box problem. The choices below start with whether it fits, and then cover the rule and the budget.

## When to Use Bayesian Optimisation

| Situation | Better choice | Why |
|---|---|---|
| Few variables, evaluations costly, no gradient | Bayesian optimisation | Uses each evaluation carefully |
| Gradient available | Gradient-based search | Far cheaper per unit of progress |
| Evaluations cheap | Evolutionary or random search | Many evaluations beat careful selection |
| Many variables | Other methods, or a reduced space | The surrogate needs too many points |
| Many categorical choices | Tree-based surrogate | A GP kernel fits awkwardly |

## Which Acquisition Tab to Choose

Start with **Expected Improvement**, as it needs no tuning, and has a long record. Choose **Upper Confidence Bound** when a function is rugged or when direct control over exploration is wanted. Choose **Thompson Sampling** when several evaluations can run at once. Choose **Probability of Improvement** only for refining a known region. [Shahriari, Swersky, Wang, Adams and de Freitas (2016)](#ref-SSWAF2016a) review these and more advanced alternatives, such as those based on information about the optimum's location. Differences among good rules are often small compared with those of a poor surrogate.

## How to Set the Budget

The panel's tooltip suggests 30 to 100 **Evaluations**, for its small problems. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) start from about 10 evaluations per dimension, and rugged functions need more. **Budget Sensitivity** gives direct evidence for a cheap test function of a similar shape. Save some evaluations for a final refinement, or a repeated check of the chosen point when noise is present. Stop if the time spent choosing points grows to match the time spent evaluating.

## How to Set the Search Space

A smaller box helps greatly, so use whatever domain knowledge exists. Transform variables to suit the problem: a learning rate belongs on a log scale, and the transform can be placed inside **Objective Body**. The tab's single **Lower Bound** and **Upper Bound** then cover the transformed variables. Check whether the answer lands on a boundary, which would suggest widening the box. Rescale the output when its size is extreme. [Snoek, Larochelle and Adams (2012)](#ref-SLA2012a) show the method applied to tuning learning algorithms, where such care pays off.

## When to Refine or Restart

**Local Refinement** suits a smooth function where evaluations remain affordable, as a local method descends quickly once in the right basin. For noisy objectives, a simplex method may chase noise. **Multi-Start BO** gives robustness against a poor first design, at five times the cost, and it discards information between runs. Running one long search usually uses the budget better, unless the surrogate tends to lock into one basin. A second run with other settings is more informative than the same run repeated.

## What to Report from a Bayesian Optimisation Study

State the budget, the surrogate, the acquisition, the bounds and any transforms. Report the best value found, along with spread over repeated runs and a baseline such as random search, as a single run gives little evidence. Report the observed optimum and not the model's. Save all evaluated points, since real evaluations are costly and are valuable in themselves, and a second study can start from them. [Garnett (2023)](#ref-Gar2023a) covers such choices at length.

## References

<a id="ref-Gar2023a"></a>Garnett, R. (2023). *Bayesian Optimization*. Cambridge University Press. [bayesoptbook.com](https://bayesoptbook.com)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M. and Welch, W. J. (1998). Efficient global optimization of expensive black-box functions. *Journal of Global Optimization* 13(4), 455–492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-SSWAF2016a"></a>Shahriari, B., Swersky, K., Wang, Z., Adams, R. P. and de Freitas, N. (2016). Taking the human out of the loop: a review of Bayesian optimization. *Proceedings of the IEEE* 104(1), 148–175. [doi:10.1109/JPROC.2015.2494218](https://doi.org/10.1109/JPROC.2015.2494218)

<a id="ref-SLA2012a"></a>Snoek, J., Larochelle, H. and Adams, R. P. (2012). Practical Bayesian optimization of machine learning algorithms. *NeurIPS*. [arXiv:1206.2944](https://arxiv.org/abs/1206.2944)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Expected Improvement](ei.md)
