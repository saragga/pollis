# Density Estimation — Overview

This webview estimates a density in three ways, on the eruption durations of the Old Faithful geyser by default: a sample with two clear peaks, near 2 and 4.5 minutes, that shows quickly what each estimator keeps and what it smooths away.

## The Three Models
- **Histogram**: counts in bins, with StatsBase's fit(Histogram, ...). The **Specification** gives the number of bins, **Bins (n)**, or the **Edges**; **Bin Intervals** chooses (a, b] or [a, b); **Normalise** turns the counts into a PDF, a density or probabilities.
- **Kernel Density**: a smooth estimate, the average of one **Kernel** centred on each observation, with KernelDensity.jl's kde. The **Bandwidth** sets the kernel's width, by default from Silverman's rule.
- **Parametric**: a **Distribution** fitted by maximum likelihood with Distributions.jl, from Bernoulli to Weibull, or the multivariate Dirichlet, Multinomial and MvNormal. Each family has example data of its kind: Titanic survival for Bernoulli, O-ring failures for Binomial, publication counts for Poisson.
The **Dimensions** tab chooses one or two variables, for the histogram and the kernel.

## Common Workflow

1. Choose a model, its **Dimensions** and its tuning: **Bins (n)** or **Edges**, the **Kernel** and **Bandwidth**, or the **Distribution**.
2. Look at the **Estimate Over the Data** and the **Empirical Against Estimated CDF**.
3. Check the **Sensitivity to Tuning and Sampling** and the **Goodness of Fit and Tuning Rules**; for a parametric fit, the **Bootstrap Parameter Intervals**.
4. Use the estimate: **Density at New Points** and **Draw New Samples**.
5. Compare **Histogram, Kernel Density and Normal Fit** and the **Candidate Distributions by AIC**.
6. Read the **Summary of the Estimate** and the **Probability of an Interval**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
