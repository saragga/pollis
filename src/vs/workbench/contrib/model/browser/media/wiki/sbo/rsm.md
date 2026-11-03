# Surrogate-Based Optimisation: Response Surface Methods

The **Response Surface Methods** tab fits a full quadratic to all the evaluations by least squares and evaluates next the point, near the best one so far, at which the quadratic is lowest.

## The quadratic

```
features(z) = [1.0; z; [z[i] * z[j] for i in eachindex(z) for j in i:length(z)]]
```

In the unit box z, the surrogate is

f̂(z) = β₀ + Σᵢ βᵢ zᵢ + Σᵢ≤ⱼ βᵢⱼ zᵢ zⱼ,

with 1 + n + n(n + 1)/2 coefficients: a constant, the linear terms, the squares and the cross-products. The coefficients solve the least-squares normal equations, with 10⁻⁸ added to the diagonal: β = (FᵀF + 10⁻⁸ I)⁻¹ Fᵀy, where F holds one row of features per evaluated point.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) write the same structure as a linear regression, y = Σₕ βₕ fₕ(x) + ε, in which each fₕ is a linear or nonlinear function of x and the errors are independent with mean zero. [Forrester, Sóbester and Keane (2008)](#ref-FSK2008a) treat polynomial models in their chapter on constructing a surrogate, with examples of aerofoil drag and a multimodal test case, and the k-variable case.

## The next point

`acquire` draws 1 000 points from a normal distribution centred at the best evaluated point, with standard deviation **Region Size** times the width of the box in each variable, clamps them to the box, and returns the one with the lowest predicted value.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) describe the simplest way to use a response surface for optimisation: fit a surface and find its minimum. They show that the process, even when iterated, can lead to a local minimum, because it puts all the emphasis on exploiting the predictor. The Gaussian candidates keep each step near the best point, and the new evaluation changes the fit at the next iteration.

## No uncertainty

The surrogate's standard deviation is 0 by construction: `sd = x -> 0.0`. The quadratic is fitted to the data, not interpolated, so its prediction at an evaluated point can differ from the value there.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) explain that in classical design of experiments, the data come from physical observations subject to random error, and simple linear or quadratic regression models are usually employed, with designs of two or three levels per factor. In a computer experiment, all factors are controllable, run order is irrelevant and the factors often vary over wider ranges.

## Interpretability

**Solution Summary** prints the quadratic coefficients, rounded to four significant digits, in the order of `features`: the constant, the n linear coefficients, then the coefficients of z₁², z₁z₂, … , zₙ². With the variables mapped to [0, 1], the coefficients of different variables are on a common scale.

In a regression, [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) note, the coefficients together with the functional form completely describe what the function is. The panel's decision row recommends the response surface when an interpretable model is wanted, for smooth, low-dimensional objectives.

## The number of points

The quadratic has (n + 1)(n + 2)/2 coefficients: 6 in two dimensions, 10 in three, 21 in five, 66 in ten. **Surrogate Guide** gives the same number as the minimum design; with the default **Initial Samples**, 10, the first fit has enough points for n ≤ 3.

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) note that flexible functional forms have many parameters, so that many function evaluations are needed to estimate them. The count of quadratic terms grows with the square of n.

## Region Size

**Region Size**, 0.2 by default, is the standard deviation of the Gaussian candidates as a fraction of the box. A smaller value keeps the next point closer to the best one; a larger value lets the quadratic's minimum be sought further away.

**Exploration Check** shows the spread of the guided points that results, and **Convergence Trace** shows whether the best value keeps improving.

## References

<a id="ref-FSK2008a"></a>Forrester, A. I. J., Sóbester, A., & Keane, A. J. (2008). *Engineering Design via Surrogate Modelling: A Practical Guide*. Wiley. [doi:10.1002/9780470770801](https://doi.org/10.1002/9780470770801)

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M., & Welch, W. J. (1998). Efficient Global Optimization of Expensive Black-Box Functions. *Journal of Global Optimization* 13(4), 455-492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Kriging](kriging.md) · [Radial Basis Functions](rbf.md)
