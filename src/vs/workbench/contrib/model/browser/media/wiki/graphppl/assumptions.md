# Assumptions

Message passing is only as good as its model and its approximation. Some assumptions belong to the model, and others to the choice of inference.

## What the Model Assumes

All results are conditional on the model. The first two tabs treat observations as independent draws around one mean, so that drift or outliers count against the model, without any warning. Normal noise has thin tails, so that one large value can move the mean a long way. The third tab assumes a smooth random-walk trend with a fixed step size, and a probit link. **Posterior Predictive** gives a first check that these fit. **Known Variance** on the first tab is a strong assumption, which gives the exact result its simplicity.

## What the Priors Assume

Priors enter as factors, on the same footing as data. **Prior Predictive** draws from them, and compares the result with the data. On **Variational Message Passing**, Gamma(1, 1) on the precision has mass close to 0, and so the prior predictive has heavy tails, which the code trims to |y| below 50 to keep the plot readable. A prior of variance 10 is weak for a mean near 1.5, and it would be strong for data on a scale of thousands. Rescale the data, or the prior, to match.

## What the Graph Structure Assumes

Exactness applies only when the factor graph is a tree. The first tab is one because the variance is known. Adding an unknown precision forms a loop through mu, tau and each observation. Whether a real model is a tree should be worked out and not assumed. Conjugate pairs are also needed for closed-form messages, and other combinations need rules or approximations. [Bagaev and de Vries (2023)](#ref-BV2023a) describe how such messages are organised in the reactive engine behind the package.

## What the Mean-Field Assumption Costs

Mean field assumes no dependence between the groups of variables in the posterior. If they are close to independent, then little is lost. If they are strongly dependent, the variances are too small, and the means can shift. The sample size also matters: the understatement in the default example shrinks as n grows, as both spreads narrow. Other factorisations are possible through `@constraints`, and keeping a dependent pair together inside one factor improves accuracy where the rules allow it.

## What the Gaussian Projection Assumes

**Expectation Propagation** assumes that each marginal is close to Gaussian. A skewed or bimodal posterior loses its shape, and a Gaussian with the right moments can then put mass where there is little. A strong-prior probit with extreme data gives skewness in the true marginal. Multiple modes are outside the method's reach, and it will report only one bump. **Posterior Distribution** always shows a Gaussian on this tab, so that it cannot reveal any such failure, whereas a sampling method can.

## What Reading the Free Energy Assumes

F compares approximations and models only on the same data. A lower F on one approximation suggests a better q, if they are computed in the same way. Using F for model comparison treats the KL gap as if it were similar across the models. That is a good assumption in some cases, and it should be noted in others. On a tree, the gap is zero, and so F gives the exact log evidence. Under EP, F is not a strict upper limit in general, and it should be read as an estimate.

## References

<a id="ref-BV2023a"></a>Bagaev, D. and de Vries, B. (2023). Reactive message passing for scalable Bayesian inference. *Scientific Programming* 2023, 1–26. [doi:10.1155/2023/6601690](https://doi.org/10.1155/2023/6601690)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
