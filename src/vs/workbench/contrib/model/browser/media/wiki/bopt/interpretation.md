# Interpretation

The output of a run is a best value and a best point, along with a surrogate that describes what was learned. These answer different questions.

## How to Read the Observed and Model Optimum

**Run BO** and **Solution Summary** print two pairs. `observed_optimum` and `observed_optimizer` are the best real evaluation, and they can be reproduced for a deterministic function. `model_optimum` and `model_optimizer` are where the surrogate believes the best value lies, and that point may never have been evaluated. Trust the observed pair for reporting. A model optimum lower than the observed one is a suggestion worth one more real evaluation. A large gap between them suggests that the surrogate has not settled.

## How to Read Fitted Length Scales

**Kernel Interpretation** prints length scales with short guidance. A short length scale means that the function varies quickly along that variable, and a long one means that it varies little. The ratio to the box width matters: a length scale above the width shows nearly no effect from that variable within the box, a finding that may justify fixing it. Such relevance readings rest on few evaluations, so treat them as hints. Length scales from a poor fit are unreliable, and a rerun may give others.

## How to Read the Fitted Noise

Noise is the surrogate's estimate of the variation left unexplained at a point. High noise makes the model trust observations less, and so it smooths them, and low noise makes it interpolate them closely. For a deterministic function, noise should be small, with its value mostly reflecting the lower bound. A larger value can signal that the kernel cannot represent the function's roughness, so that roughness is counted as noise. For a noisy function, a good estimate is useful in itself, and the best observed value is then partly luck.

## How to Read an Acquisition Comparison

**Acquisition Comparison** prints the median best value and the range over 10 seeds for each of the four rules. Read the medians with the ranges: overlapping ranges mean that the order is not settled. Ten seeds and one function give weak evidence, and the winner may differ on another function or at another budget. **Acquisition Guide** tells another story, by giving the next point that each rule would pick from the same surrogate, with its uncertainty and its distance from the best point. Large values of each indicate exploring.

## How to Read Budget Sensitivity

**Budget Sensitivity** prints the median and range at 10, 20, 50, 100 and 200 evaluations. Improvements should shrink as the budget grows. A large gain from 100 to 200 suggests that the method is still working, and that the chosen budget was too small. Small budgets may consist only of the starting design, and so tell nothing about the acquisition. Ranges that tighten at higher budgets show growing reliability. Cost should enter any decision, as [Frazier (2018)](#ref-Fra2018a) frames the method by its use with limited evaluations.

## What Local Refinement Tells

**Local Refinement** runs Nelder-Mead, the simplex method of [Nelder and Mead (1965)](#ref-NM1965a), from the best point found. A large gain means that the search located a basin but not its bottom, which is normal with the coarse final stage of a global method. It uses extra evaluations that are not counted in **Evaluations**. The call has no bounds, so the refined point can lie outside the box, and it needs checking. A negligible gain means that the search already reached a local minimum, and not that the minimum is global.

## References

<a id="ref-Fra2018a"></a>Frazier, P. I. (2018). A tutorial on Bayesian optimization. [arXiv:1807.02811](https://arxiv.org/abs/1807.02811)

<a id="ref-NM1965a"></a>Nelder, J. A. and Mead, R. (1965). A simplex method for function minimization. *The Computer Journal* 7(4), 308–313. [doi:10.1093/comjnl/7.4.308](https://doi.org/10.1093/comjnl/7.4.308)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
