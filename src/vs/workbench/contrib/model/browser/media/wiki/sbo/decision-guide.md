# Surrogate-Based Optimisation: Decision Guide

When to use a surrogate, which of the panel's three to choose, and how to split the evaluations between the design and the search.

## Surrogate or direct search

| Situation | Approach | Source |
|---|---|---|
| The number of evaluations is severely limited by time or cost | Surrogate-based optimisation | [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) |
| Deterministic computer code, a cheaper predictor of its output wanted | A surrogate fitted to a designed set of runs | [Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a) |
| Many follow-up questions to answer from the same runs, such as trade-offs and sweeps | A surrogate built once and queried many times | [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) |
| Multimodal function, derivatives unavailable | Stochastic response surface with candidate points | [Regis and Shoemaker (2007)](#ref-RS2007a) |

**Compare with Direct Search** sets the surrogate search beside random search and Nelder–Mead on the same number of evaluations of the current objective.

## Choosing a surrogate

| Surrogate | Panel's guidance | Covered in |
|---|---|---|
| **Response Surface Methods** | Smooth, low-dimensional objectives, when an interpretable model is wanted | [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a), polynomial models |
| **Kriging** | Expensive black boxes with few evaluations, where uncertainty should guide sampling | [Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a), [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) |
| **Radial Basis Functions** | Expensive multimodal objectives without derivatives, including higher-dimensional ones | [Regis and Shoemaker (2007)](#ref-RS2007a) |

[Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) give a section to the question of which surrogate to use for which purpose. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) compare, on the Branin function with 21 points, a DACE surface, a general quadratic and a thin-plate spline, and find the DACE surface the closest to the true contours.

## Uncertainty or not

Only **Kriging** gives a predictive standard deviation, and with it the expected improvement. [Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a) note that modelling the output as a stochastic process makes estimates of the uncertainty of predictions available, and [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) build the balance between local and global search on that uncertainty.

**Response Surface Methods** and **Radial Basis Functions** have no uncertainty estimate. The response surface searches among Gaussian candidates around the best point, with standard deviation **Candidate Spread**; the radial basis surrogate uses the distance from the evaluated points in place of an uncertainty, as [Regis and Shoemaker (2007)](#ref-RS2007a) propose.

## Design and budget

| Setting | Default | Guidance | Source |
|---|---|---|---|
| **Initial Samples** | 10 | About 10k points in k dimensions for the initial Kriging design | [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) |
| **Initial Samples**, quadratic | 10 | At least (n + 1)(n + 2)/2, the number of quadratic coefficients | The panel's code |
| **Evaluations** | 40 | Until the expected improvement drops under 1% of the best value, in EGO | [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) |
| **Candidate Spread** | 0.2 | Standard deviation of the quadratic's candidates around the best point, as a fraction of the box | The panel's code |

**Sample Size Sensitivity** and **Budget Sensitivity** show, for the current objective, how the best value changes with the design size at a fixed total and with the number of guided evaluations.

## Checking before trusting

| Question | Action |
|---|---|
| Does the surrogate predict points it has not seen? | **Leave-One-Out Error**, **Predicted vs Actual**, **Model Accuracy** |
| Is the search still exploring, or only refining? | **Exploration Check** |
| Is the result stable across designs? | **Multi-Start** |
| Can a local search improve the result? | **Local Refinement** |
| Is another surrogate more accurate on the same points? | **Compare with Surrogates.jl**, and the other tabs |

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) accept a Kriging model when its standardised cross-validated residuals lie within about 3 in magnitude, and otherwise try a transformation of the response first.

## Further reading

[Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) is a practical guide, with MATLAB code, to sampling plans, polynomial, radial basis and Kriging surrogates, infill criteria, constraints, noisy data, gradients, multiple fidelities and multiple objectives. [Sacks, Welch, Mitchell and Wynn (1989)](#ref-SWMW1989a) review the design and analysis of computer experiments. [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) introduce the EGO algorithm. [Jones (2001)](#ref-Jon2001a) gives a taxonomy of response-surface methods for global optimisation, and [Regis and Shoemaker (2007)](#ref-RS2007a) the stochastic radial basis function method.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-Jon2001a"></a>Jones, D. R. (2001). A Taxonomy of Global Optimization Methods Based on Response Surfaces. *Journal of Global Optimization* 21(4), 345-383. [doi:10.1023/A:1012771025575](https://doi.org/10.1023/A:1012771025575)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-RS2007a"></a>Regis, R. G., & Shoemaker, C. A. (2007). A Stochastic Radial Basis Function Method for the Global Optimization of Expensive Functions. *INFORMS Journal on Computing* 19(4), 497-509. [doi:10.1287/ijoc.1060.0182](https://doi.org/10.1287/ijoc.1060.0182)

<a id="ref-SWMW1989a"></a>Sacks, J., Welch, W. J., Mitchell, T. J., & Wynn, H. P. (1989). Design and Analysis of Computer Experiments. *Statistical Science* 4(4), 409-423. [doi:10.1214/ss/1177012413](https://doi.org/10.1214/ss/1177012413)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [Response Surface Methods](rsm.md) · [Kriging](kriging.md) · [Radial Basis Functions](rbf.md)
