# Interpretation

## Parameter Estimates
**Parameter Estimates** gives every parameter of the margins and the copula with bootstrap standard errors, which refit the whole model on each resample. A copula parameter is easier to read through its Kendall's tau: theta = 2 in Clayton is tau = theta / (theta + 2) = 0.5; theta = 2 in Gumbel is tau = 1 - 1 / theta = 0.5; rho in the Gaussian is tau = (2 / pi) arcsin(rho).

## Against Independence
**Against Independence** is a likelihood ratio test of the fitted copula against independence, with the same margins, on as many degrees of freedom as the copula has parameters. With two-stage or rank-based margins the chi-square reference is approximate.

## Compare Copula Families
**Compare Copula Families** fits the Gaussian, Student-t, Clayton, Gumbel, Frank and Joe copulas with the same margins and ranks them by AIC, with BIC beside it. On the default data, Clayton should come first: the Gaussian matches the overall correlation but not the lower tail. A small AIC gap between families with different tails means the data cannot tell them apart.

## Tail Dependence
**Tail Dependence** estimates P(both below 0.05) / 0.05 and P(both above 0.95) / 0.05, from the data and from 100,000 model draws. Under independence these are 0.05; as the threshold shrinks, a copula with tail dependence keeps them away from zero. For the default Clayton the lower value is high, the upper low; a Gaussian fit understates the lower.

## Joint Exceedance Probability
**Joint Exceedance Probability** is the chance that every variable exceeds its 95% quantile together: from the data, the model and independence ((0.05)^d, 0.0025 in two dimensions). It is the quantity behind joint risk, and where families differ most.

## Simulate From the Fitted Model
**Simulate From the Fitted Model** draws as many observations as the data from the fitted Sklar distribution, on the original scale, and overlays them on the data.

## See Also
- [Diagnostics](diagnostics.md) · [Dependence Measures](dependence-measures.md) · [Decision Guide](decision-guide.md)
