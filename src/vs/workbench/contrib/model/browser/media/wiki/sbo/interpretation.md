# Surrogate-Based Optimisation: Interpretation

How to read the best point, the surrogate's prediction there, the refinements, the comparisons and the fitted surrogate itself.

## The best point

**Best Solution** prints the best evaluated point, rounded to six significant digits, its value, the surrogate's prediction there, the evaluation at which it was found and the total number of evaluations. The best point is always one at which the objective was actually evaluated, so its value is exact.

For the interpolating surrogates, **Kriging** and **Radial Basis Functions**, the prediction at an evaluated point equals the value there; [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) show that the DACE predictor interpolates the data. For **Response Surface Methods**, the least-squares quadratic need not pass through the point, and the gap between prediction and value is a residual of the fit.

## Refinement and restarts

**Local Refinement** starts Nelder–Mead from the best point, on the true objective evaluated inside the box, with at most 100 evaluations. It prints the value before and after, the improvement, the refined point and the number of extra evaluations. **Multi-Start** repeats the whole search from three independent initial designs and keeps the best result.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) describe the role of response surfaces as estimating the location of the optimum and suggesting points where additional evaluations may improve that estimate. [Regis and Shoemaker (2007)](#ref-RS2007a) also develop a multistart local optimisation version of their method.

## Comparisons

**Compare with Direct Search** gives the same number of evaluations to random search and to Nelder–Mead from a random start, three seeds each, and prints the mean and the worst best value beside those of the surrogate search. **Compare with Surrogates.jl** fits the Kriging and RadialBasis surrogates of Surrogates.jl to the same evaluated points and prints the holdout RMSE of each on 200 fresh points.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) motivate their method by the observation that existing global methods often require more function evaluations than can be afforded. The comparison with direct search puts both kinds of method on the same budget.

## The surrogate surface

**Surrogate Surface** draws the contours of the final surrogate over the first two variables, with the others fixed at the best point, and marks the evaluated points and the best one. For n > 2, the plot is a slice through the best point.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) describe visualisation as one of the uses of response surfaces, and [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) give a chapter to visualisation, with matrices of contour plots and nested dimensions for more than two variables.

## The fitted settings

**Solution Summary** lists each variable of the best point with its bounds, then the settings of the surrogate: the quadratic coefficients and **Region Size** for **Response Surface Methods**, the length scale for **Kriging**, and, for all three, the best value, **Initial Samples** and **Evaluations**.

The quadratic coefficients are in the unit box: the constant, the n linear terms, then the products zᵢzⱼ for i ≤ j. The length scale is also in unit-box coordinates, chosen from 0.05, 0.1, 0.2, 0.3, 0.5 and 1.0; [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) interpret their correlation parameters as describing how the function typically behaves, with a large θₕ for an active variable, whose correlation drops off rapidly with distance.

## The surrogate guide

**Surrogate Guide** prints a table with, for each surrogate, the problems it suits, its fitting cost and whether it gives an uncertainty estimate: the quadratic needs at least (n + 1)(n + 2)/2 points, and only Kriging reports an uncertainty. The table is the same for every tab and every objective.

The **Decision Guide** sets the same choice against the sources, and **Compare with Surrogates.jl**, **Leave-One-Out Error** and the other tabs compare the surrogates on the current objective.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-RS2007a"></a>Regis, R. G., & Shoemaker, C. A. (2007). A Stochastic Radial Basis Function Method for the Global Optimization of Expensive Functions. *INFORMS Journal on Computing* 19(4), 497-509. [doi:10.1287/ijoc.1060.0182](https://doi.org/10.1287/ijoc.1060.0182)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Response Surface Methods](rsm.md) · [Kriging](kriging.md) · [Radial Basis Functions](rbf.md)
