# Surrogate-Based Optimisation: Radial Basis Functions

The **Radial Basis Functions** tab interpolates the evaluations with cubic radial functions plus a linear tail, and chooses the next point by weighing a low prediction against the distance from the points already evaluated, as in the stochastic RBF method.

## The interpolant

In the unit box, with zᵢ the evaluated points, the surrogate is

f̂(z) = Σᵢ wᵢ ‖z − zᵢ‖³ + v₀ + Σⱼ vⱼ zⱼ,

a cubic radial function centred at every evaluated point plus a linear polynomial. The weights w and the tail v solve the square system

[Φ P; Pᵀ 0] [w; v] = [y; 0],

where Φᵢⱼ = ‖zᵢ − zⱼ‖³ and P has a column of ones and the coordinates of the points. The code solves it with the pseudo-inverse, `pinv(M)`.

## Basis functions

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) describe the thin-plate spline as a linear combination of basis functions that include polynomial terms and terms of the form φ(‖x − xᵢ‖), with φ(t) = t² log t, and show that the DACE predictor can also be written as a combination of basis functions, one per data point, that interpolates the data. The panel's interpolant has the same structure with φ(t) = t³.

They point to the difference between the two: the basis functions of the spline are fixed in advance, while those of the DACE predictor depend on correlation parameters tuned to the data by maximum likelihood. The panel's radial basis surrogate has no parameter to tune, and **Surrogate Guide** lists nothing tuned for it.

## Stochastic response surfaces

[Regis and Shoemaker (2007)](#ref-RS2007a) propose the Stochastic Response Surface method, which uses a response surface model to approximate the expensive function and, at every iteration, picks a promising point for evaluation from a set of randomly generated candidate points. Its Metric variant chooses the best candidate according to two criteria: the value estimated by the response surface and the minimum distance from previously evaluated points.

With a radial basis function model, they call the resulting algorithms Global MSRBF and Multistart Local MSRBF, compare them with six alternatives on 17 multimodal test problems and a 12-dimensional groundwater bioremediation application, and find MSRBF a promising approach for the global optimisation of expensive functions.

## The panel's score

`acquire` draws 1 000 candidates, 500 uniform in the box and 500 Gaussian around the best point with a spread of 0.1 of the box. For each, it computes the surrogate's prediction s and the distance d to the nearest evaluated point in the unit box, rescales both to [0, 1] over the candidates, and scores

score = w · s̃ + (1 − w) · (1 − d̃),

where the tilde marks the rescaled values. The candidate with the lowest score is evaluated next.

The weight w on the prediction cycles through 0.3, 0.5, 0.8 and 0.95 over the iterations. A low w favours candidates far from the evaluated points; a high w favours candidates with a low prediction.

## No uncertainty

The surrogate has no standard error: `sd = x -> 0.0`. Exploration in the score comes from the distance term, the second of the two criteria of [Regis and Shoemaker (2007)](#ref-RS2007a), where **Kriging** draws it from the predictive standard deviation.

**Exploration Check** prints how many of the guided points lie within 0.1 of the best one, the median distance to it and the smallest gap between a new point and an earlier one, which describe the spread of the evaluations.

## In the panel

**Leave-One-Out Error** and **Model Accuracy** check the interpolant away from the evaluated points. **Compare with Surrogates.jl** fits the RadialBasis surrogate of Surrogates.jl, by [SciML Contributors (2026)](#ref-SMLC2026a), with its own defaults, to the same points.

[Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) treat radial basis function models in their chapter on constructing a surrogate, for noise-free and for noisy data, beside polynomial models, Kriging and support vector regression.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

<a id="ref-RS2007a"></a>Regis, R. G., & Shoemaker, C. A. (2007). A Stochastic Radial Basis Function Method for the Global Optimization of Expensive Functions. *INFORMS Journal on Computing* 19(4), 497-509. [doi:10.1287/ijoc.1060.0182](https://doi.org/10.1287/ijoc.1060.0182)

<a id="ref-SMLC2026a"></a>SciML Contributors (2026). Surrogates.jl: Surrogate Modeling and Optimization for Scientific Machine Learning. [doi:10.5281/zenodo.12571718](https://doi.org/10.5281/zenodo.12571718)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Response Surface Methods](rsm.md) · [Kriging](kriging.md)
