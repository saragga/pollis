# Generalized Pareto Distribution — Overview

The GP has CDF H(y) = 1 - (1 + xi y / sigma)^(-1/xi) for excesses y > 0:
- **xi > 0**: a heavy, Pareto-like tail.
- **xi = 0**: the exponential distribution, the limit as xi goes to 0.
- **xi < 0**: bounded, with excesses at most -sigma / xi.
Its mean is sigma / (1 - xi) for xi < 1.

## Fit
**Data series** is the full series, and **Threshold u** selects the exceedances; the fit uses their excesses X - u. The default is the daily rainfall in south-west England, 1914-1962, 17,531 days in millimetres, an example of Coles (2001), with u = 30 mm: nearly half the days are dry, so the usual starting point, the 90th percentile, is only 10.9 mm here. **Estimation method**:
- **Maximum Likelihood**: the default.
- **Probability-Weighted Moments**: faster, closed-form.
- **Bayesian Estimation**: posterior draws of the parameters.
It prints sigma, xi and the number of exceedances.

## Evaluate
With **Threshold mu**, **sigma** and **xi**, **Evaluate** gives the density and CDF at **Eval point x**, which must lie above mu, and the quantile at **Quantile p**.

## Sample
**Sample** draws **Sample size n** values from that GP and prints their mean and standard deviation.

## Common Workflow

1. Load the **Data series**; choose the **Threshold u** and the **Estimation method**; **Fit**.
2. Check the threshold with the **Mean Excess Plot** and **Threshold Stability**; change it and fit again if needed.
3. Check the **Fit Diagnostics** probability and quantile plots.
4. Compute the **Tail Probability** of a new largest excess.
5. Read the **Tail Behaviour**.
6. **Evaluate** or **Sample** a GP with chosen parameters.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
