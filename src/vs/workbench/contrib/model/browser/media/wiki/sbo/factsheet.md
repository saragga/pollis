# Surrogate-Based Optimisation: Factsheet

The panel's surrogates, inputs, outputs and actions at a glance.

## Surrogates

| Surrogate | Model | Uncertainty | Acquisition |
|---|---|---|---|
| **Response Surface Methods** | 1 + n + n(n + 1)/2 quadratic terms, least squares with a 10⁻⁸ ridge | None | Lowest prediction among 1 000 Gaussian candidates around the best point |
| **Kriging** | Gaussian process on standardised values, squared-exponential kernel, nugget 10⁻⁶ | Predictive standard deviation | Highest expected improvement among 1 000 candidates |
| **Radial Basis Functions** | Cubic kernel r³ plus a linear tail, interpolating | None | Lowest weighted score of prediction and distance among 1 000 candidates |

All three work in the unit box: every variable is mapped to [0, 1] by (x − lower) / (upper − lower) before the surrogate is fitted.

## Common settings

| Item | Setting |
|---|---|
| Initial design | Latin hypercube with one point per stratum in every variable |
| Candidates | 500 uniform in the box and 500 Gaussian around the best point, clamped to the box |
| Spread of the Gaussian candidates | 0.1 of the box for **Kriging** and **Radial Basis Functions**; **Candidate Spread** for **Response Surface Methods** |
| Seed | 1 for the main run |
| Result | Best evaluated point, its value, the number of evaluations and the trace of the best value |

The response surface uses only the Gaussian candidates; the other two use both sets.

## Inputs

| Input | Default | Meaning |
|---|---|---|
| **Dimension (n)** | 2 | Number of decision variables, at least 2 |
| **Objective f(x)** | Rosenbrock function | Julia expression in the vector x; minimum 0 at x = ones(n) |
| **Lower Bounds**, **Upper Bounds** | fill(−2.0, n), fill(2.0, n) | The search box |
| **Initial Samples** | 10 | Points of the Latin-hypercube design |
| **Evaluations** | 40 | Surrogate-guided evaluations after the design |
| **Candidate Spread** | 0.2 | Response surface only: standard deviation of the candidates around the best point, as a fraction of the box |

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Convergence Trace**, **Surrogate Surface**, **Predicted vs Actual** | Best value per evaluation; contours over x₁ and x₂; predictions on 200 fresh points |
| Diagnose | **Leave-One-Out Error**, **Exploration Check**, **Sample Size Sensitivity** | Cross-validated error; spread of the guided points; best value for other design sizes |
| Predict | **Best Solution**, **Multi-Start**, **Local Refinement** | Best point and prediction there; three seeds; Nelder–Mead polish with up to 100 evaluations |
| Compare | **Compare with Surrogates.jl**, **Budget Sensitivity**, **Compare with Direct Search** | Holdout error against Surrogates.jl; best value for other budgets; random search and Nelder–Mead |
| Interpret | **Solution Summary**, **Model Accuracy**, **Surrogate Guide** | Variables and settings; RMSE and R² on the box and near the best point; how each surrogate is fitted and chooses the next point |

## Further reading

| Topic | Source |
|---|---|
| Sampling plans, surrogates and infill criteria, with MATLAB code | [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) |
| The stochastic process model of deterministic computer codes | [Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a) |
| Kriging, cross-validation and expected improvement | [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) |
| A taxonomy of response-surface methods for global optimisation | [Jones (2001)](#ref-Jon2001a) |
| Candidate points scored by prediction and distance | [Regis and Shoemaker (2007)](#ref-RS2007a) |

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-Jon2001a"></a>Jones, D. R. (2001). A Taxonomy of Global Optimization Methods Based on Response Surfaces. *Journal of Global Optimization* 21(4), 345-383. [doi:10.1023/A:1012771025575](https://doi.org/10.1023/A:1012771025575)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-RS2007a"></a>Regis, R. G., & Shoemaker, C. A. (2007). A Stochastic Radial Basis Function Method for the Global Optimization of Expensive Functions. *INFORMS Journal on Computing* 19(4), 497-509. [doi:10.1287/ijoc.1060.0182](https://doi.org/10.1287/ijoc.1060.0182)

<a id="ref-SWMW1989a"></a>Sacks, J., Welch, W. J., Mitchell, T. J., & Wynn, H. P. (1989). Design and Analysis of Computer Experiments. *Statistical Science* 4(4), 409-423. [doi:10.1214/ss/1177012413](https://doi.org/10.1214/ss/1177012413)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Response Surface Methods](rsm.md) · [Kriging](kriging.md) · [Radial Basis Functions](rbf.md)
