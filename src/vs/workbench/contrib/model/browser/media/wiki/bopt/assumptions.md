# Assumptions

Bayesian optimisation only saves evaluations if its surrogate describes the function, and the setting suits the method. Each assumption here affects how far a result can be trusted.

## Why Evaluations Must Be Expensive

The method spends real computing to choose each point: it refits a surrogate and optimises an acquisition function, with costs that grow sharply with the number of observations. That is worthwhile only if a single evaluation costs much more than that. For a function that takes microseconds, a simple method can run millions of evaluations in the same time, and would usually do better. The panel's default function is cheap and serves only as a demonstration. **vs Gradient-Based** makes the trade-off visible, as its call counts differ widely.

## What the Squared Exponential Kernel Assumes

`SEArd` assumes an infinitely smooth, stationary function, whose smoothness is the same throughout the box. A function with kinks, jumps or sharply different scales in separate regions violates this, and the surrogate then becomes overconfident or too wiggly. [Rasmussen and Williams (2006)](#ref-RW2006a) describe the kernel's properties and its alternatives. [Snoek, Larochelle and Adams (2012)](#ref-SLA2012a) argue that squared exponential smoothness is often too strong for practical optimisation, and they use a Matérn form. A different kernel can be set in the code where `SEArd` appears.

## Why Dimension Must Stay Modest

A Gaussian process has to cover the space, and that gets far harder as dimension grows. [Frazier (2018)](#ref-Fra2018a) notes that the method is typically used for no more than about 20 dimensions. The panel's refit also learns one length scale per dimension from few points. The starting design takes about 5 n evaluations, so it must fit inside **Evaluations**, a point **Budget Sensitivity** warns about. **Dimension (n)** of more than a few needs a much larger budget. A high-dimensional problem may need another method, or a reduced search space.

## What the Bounds and Noise Settings Assume

All variables share one **Lower Bound** and **Upper Bound**, so they are assumed to have similar scales. Variables with different ranges need rescaling inside **Objective Body**. A solution on the boundary may mean that the box is too small. The surrogate also assumes one constant Gaussian noise level, and it fits that level within fixed bounds. A deterministic function still gets a small noise term, which keeps the calculations stable. Noise that varies across the box, or that has heavy tails, breaks the assumption.

## What the Fixed Hyperparameter Bounds Assume

Length scales and signal size are fitted within fixed ranges, namely log length scale from -1 to 4 and log signal sd from 0 to 10. These assume that the variables and the output have moderate scales. A function with very large or very small values, or a box that is very wide or narrow, may press against them. The zero mean also assumes that outputs are not far from zero relative to the signal size, so rescaling a function with a large offset helps. **GP Hyperparameters** shows where they have settled.

## What Refitting Assumes

Hyperparameters are refitted only every 10 evaluations, by maximum a posteriori search. With few points, a fit can mislead, for instance by choosing a long length scale because the first points happened to look flat. Search may then stop too early. The approach gives no account of hyperparameter uncertainty, and treating it fully is one of the refinements discussed in the literature. Also, the runs carry no **Random Seed** input, so one result does not stand for what the method typically does on the problem.

## References

<a id="ref-Fra2018a"></a>Frazier, P. I. (2018). A tutorial on Bayesian optimization. [arXiv:1807.02811](https://arxiv.org/abs/1807.02811)

<a id="ref-RW2006a"></a>Rasmussen, C. E. and Williams, C. K. I. (2006). *Gaussian Processes for Machine Learning*. MIT Press. [gaussianprocess.org/gpml](https://gaussianprocess.org/gpml/)

<a id="ref-SLA2012a"></a>Snoek, J., Larochelle, H. and Adams, R. P. (2012). Practical Bayesian optimization of machine learning algorithms. *NeurIPS*. [arXiv:1206.2944](https://arxiv.org/abs/1206.2944)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
