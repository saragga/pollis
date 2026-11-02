# Interpretation

Results here are trade-offs: a level of profit in exchange for a level of protection. Reading them means asking how much protection was bought and at what price.

## How to Read a Single Solution

The run prints `x`, `profit`, `true_violation`, `target` and `solved`. Profit is the value of the objective at x, as the objective has no random part. `true_violation` can be read against `target`, and the two together say whether the plan delivers what it promised. Realised rates below the target mean spare protection. In a real case, `true_violation` would be missing, so that the reported profit might rest on a promise that cannot be checked. Compare all methods on the same data.

## How to Read the Baselines Table

**Robust and Nominal Baselines** shows decision, profit and failure rate for four formulations. The nominal form earns the most, and fails near half the time, as it plans for average use. The box form uses mean + 3 sd for each coefficient, and fails almost never, at a large cost in profit. Chance-constrained and distributionally robust plans lie between. The table is the panel's clearest statement of what the choice involves. The classical robust approach, set out by [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a), is a limit in which probability plays no part.

## How to Read the Epsilon Sweep

**Epsilon Sweep** plots profit and realised failure rate against the allowed rate. Profit rises as epsilon grows, with diminishing returns as more risk is allowed. A curve steep at small epsilon says that the last bit of reliability is costly. In the second panel, a realised curve above the dashed target shows under-protection, and below it shows over-protection. Choose a point where the marginal gain no longer justifies the extra failures, and the figure gives that trade-off directly.

## How to Read Shadow Prices

**Shadow Prices** reports profit gained from one more unit of capacity and from loosening epsilon by 0.01, per unit of epsilon. The first is exactly profit / b here, since both constraints scale with x, so it carries little extra information in this example. The second is the price of reliability, which tends to be larger at small epsilon. Both figures are local differences, computed by re-solving, and hold only near the current point. Dividing by 100 gives the gain for each point of allowed failure.

## How to Read Resource Use

**Out-of-Sample** plots realised use across fresh draws, with capacity marked, and prints the mean and the 95% quantile. The area beyond the line is the failure rate. The gap between the mean and capacity is the safety margin that protection imposes, which shows as unused capacity on most days. A wide distribution means that more margin is needed. A real plan should weigh that cost, as idle capacity has its own price.

## How to Read the Uncertainty and Worst-Case Plots

**Uncertainty Set** shows samples, the line of the decision, and either an ellipsoid or the tail samples. **Worst-Case Distribution** shows the point or points that the constraint guards against. Neither is a forecast. They display the mathematical adversary built into the formula, as discussed by [Mohajerin Esfahani and Kuhn (2018)](#ref-EK2018a) for the Wasserstein case. A worst case that looks implausible suggests over-protection, and a worst case within the range of real experience suggests that the protection is modest.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L. and Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-EK2018a"></a>Mohajerin Esfahani, P. and Kuhn, D. (2018). Data-driven distributionally robust optimization using the Wasserstein metric. *Mathematical Programming* 171(1–2), 115–166. [doi:10.1007/s10107-017-1172-1](https://doi.org/10.1007/s10107-017-1172-1)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
