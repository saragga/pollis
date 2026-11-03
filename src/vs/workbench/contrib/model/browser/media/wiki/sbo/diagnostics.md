# Surrogate-Based Optimisation: Diagnostics

How to check the surrogate and the search: cross-validation, holdout points, the spread of the guided evaluations, and the sensitivity to the design size.

## Cross-validation

**Leave-One-Out Error** refits the surrogate without each evaluated point in turn and predicts it back. It prints the root mean squared error of those predictions, the largest absolute error, the standard deviation of the evaluated values and the ratio of the first to the third, the relative RMSE.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) describe the same idea as cross-validation: leave out one observation and predict it from the remaining n − 1 points, which assesses the accuracy of the model without sampling any points beyond those used to fit it. In their practice, the DACE parameters are kept at the estimates from all the observations, since dropping one point usually has a negligible effect on them; the panel's action refits the whole surrogate, so for **Kriging** the length scale is chosen again each time.

## Standardised residuals

For a model with a standard error, [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) go one step further: the cross-validated residual divided by the cross-validated standard error, which they call the standardised cross-validated residual, should lie roughly in [−3, +3] if the model is valid. They plot it against the cross-validated predictions, and against standard normal quantiles.

When the plots show problems, they refit after a log or inverse transformation, ln(y) or −1/y, of the response, and keep the transformation that gives satisfactory diagnostics. **Leave-One-Out Error** reports the cross-validated errors in the units of f for all three surrogates; of the three, only **Kriging** has a predictive standard error.

## Holdout points

**Predicted vs Actual** evaluates the objective at 200 fresh uniform points and plots the surrogate's predictions against the true values, with the line of perfect fit. **Model Accuracy** prints the RMSE and R² on 200 uniform points and on 200 points near the best one, drawn with a spread of 0.05 of the box.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) mention the option of selecting a few additional points as a validation or test sample and comparing actual and predicted values on it. The holdout actions use extra evaluations of f, outside the budget of the search; [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) include model testing as the third stage of the modelling process.

## The spread of the search

**Exploration Check** splits the guided evaluations, those after the initial design, by their distance to the best point in the unit box. It prints the share within 0.1 of it, the median distance, the smallest gap between a new point and an earlier one, and the number of times the best value improved after the design.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) show that minimising the surrogate alone, even when iterated, can lead to a local minimum, and that sampling only where the standard error is highest puts all the emphasis on global search; a figure of merit is needed that balances the two. A share near 1 shows the search refining; a small share with a large median distance shows it exploring.

## The design size

**Sample Size Sensitivity** keeps the total number of evaluations fixed and splits it differently between the initial design and the guided evaluations, with designs of n + 1, 5, 10, 20 and 40 points that fit within the total. For each, it prints the mean and the worst best value over 3 seeds.

[Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) give a section to the question of how many sample plan and infill points to use. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) use about 10k points in k dimensions for their initial designs.

## Convergence

**Convergence Trace** plots the best value after each evaluation as a step line, with every evaluation as a dot and a dashed line at the end of the initial design. **Budget Sensitivity** repeats the search with 5, 10, 20, **Evaluations** and twice **Evaluations** guided points and prints the best value and the run time.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) stop their algorithm when the expected improvement is less than 1% of the current best value, and [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) discuss convergence criteria for a surrogate-based search. The panel's loop runs a fixed number of evaluations instead.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Response Surface Methods](rsm.md) · [Kriging](kriging.md) · [Radial Basis Functions](rbf.md)
