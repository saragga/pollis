# Mixed-Integer Convex Programming — Interpretation

The solution of a mixed-integer convex program has two parts: the choice made by the integer variables, and the continuous values that go with it. The Visualise, Predict and Interpret steps of the Mixed-Integer Convex Programming panel show both, and how the optimum depends on the limit set by the integer constraints.

## Reading the Solution and the Selected Variables

The **Solution** step draws the optimal portfolio weights, regression coefficients or packed items, one bar for each; the zeros are the variables the integer part switches off. **Selected Variables** lists the ones it switches on:

| Tab | Columns of **Selected Variables** |
|---|---|
| **Cardinality Portfolio** | `asset`, `weight`, `expected_return`, `volatility` |
| **Best Subset Regression**, **Sparse Logistic Regression** | `predictor`, `estimate`, `truth` |
| **Chance-Constrained Knapsack** | `item`, `value`, `mean_weight`, `sd_weight` |

On the two regression tabs the data are simulated from known coefficients, so `truth` shows whether the selected predictors are those that generate the data, and how close the estimates come to them.

## What does the Problem Picture show?

The **Problem Picture** places the solution among the alternatives. On **Cardinality Portfolio** each asset is a point by volatility and expected return, the held ones highlighted, with a dashed line at the **Target Return**, so that the held assets can be compared with those left out. On the regression tabs the estimated coefficients stand beside the true ones. On **Chance-Constrained Knapsack** each item is a point by mean weight and value, with a bar for the range of its weight at the 95% level, and the packed items highlighted.

## How does the optimum depend on k or C?

The **Parametric Sweep** solves the problem again for a range of the **Cardinality k**, or of the **Capacity C** on the knapsack, and plots the optimal value. Raising k or C relaxes a constraint, so the optimal risk, residual norm or log-loss can only fall, and the value of the knapsack can only rise. A curve that flattens shows the point beyond which the limit no longer binds: on the regression tabs, the number of predictors beyond which more add little to the fit. The step then restores the problem at the chosen k or C.

## Choosing k with the Holdout Error

A better fit on the training data does not mean better predictions, since a larger k always fits at least as well. The **Holdout Error**, on the two regression tabs, fits the model for each k and scores it on fresh data simulated from the same coefficients: the root mean squared error on **Best Subset Regression**, the share of correct labels on **Sparse Logistic Regression**. The k at which the score stops improving is the one the data support. [Bertsimas, King and Mazumder (2016)](#ref-BKM2016a) treat best subset selection as a mixed-integer optimisation problem that can be solved to optimality for each k, which makes such a comparison across k possible.

## What is the Price of the Integer Constraint?

The **Price of the Integer Constraint** compares the optimum with that of a nearby problem:

| Tab | Outputs | Reading |
|---|---|---|
| **Cardinality Portfolio** | `risk`, `risk_return_up_1pt`, `risk_no_cardinality_limit` | The risk of earning one percentage point more expected return, and the risk when any number of assets may be held |
| Regression tabs | `value_k`, `value_k_plus_1` | The fit gained by allowing one more predictor |
| **Chance-Constrained Knapsack** | `value_C`, `value_C_plus_1` | The value gained by one more unit of capacity |

A mixed-integer problem does not give dual prices as a continuous convex problem does, so the step measures each change by solving the problem again; `value_k_again` and `value_C_again` confirm that the problem has been restored.

## References

<a id="ref-BKM2016a"></a>Bertsimas, D., King, A. and Mazumder, R. (2016). Best Subset Selection via a Modern Optimization Lens. *The Annals of Statistics* 44(2), 813–852. [doi:10.1214/15-AOS1388](https://doi.org/10.1214/15-AOS1388)

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
