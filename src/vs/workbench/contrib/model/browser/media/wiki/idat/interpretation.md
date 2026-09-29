# Interpretation

## Values Between the Knots
An interpolated value is the method's **guess** under its smoothness assumption, not a measurement. Different methods agree at the knots and differ between them; **Method Comparison** shows how much. Where they diverge, the data do not pin the value down.

## Smoothness
The methods differ in how many derivatives are continuous:

| Method | Continuous | Looks like |
|---|---|---|
| Linear, B-Spline Linear | Value | Straight segments with corners |
| B-Spline Quadratic | Value, slope | Smooth, with jumps in curvature |
| Cubic Spline, B-Spline Cubic, Dierckx k = 3 | Value, slope, curvature | Visually smooth |
| Dierckx k = 5 | Up to the fourth derivative | Very smooth |

The **Smoothness Measure** action reports the roughness, the integral of the squared second derivative. Among all curves through the same points, the natural cubic spline has the smallest roughness, which is why it looks the most "relaxed".

## Derivatives
The first derivative is the local **rate of change**, in units of y per unit of x; the second is the **curvature**. For the Interpolations.jl methods the panel estimates them by central differences; Dierckx computes them exactly from the spline with `derivative(itp, x; nu=1)`. Derivatives amplify noise: the second derivative of an exact interpolant of noisy data is rarely meaningful.

## Definite Integral
The **Definite Integral** action gives the area under the interpolant between two points, by the trapezoidal rule on a dense grid, or exactly with `integrate(itp, lo, hi)` for Dierckx. In units of y times x: a rate integrated over time gives a total.

## Smoothing Factor
With Dierckx `s > 0` the curve no longer passes through the knots. The residuals are then an estimate of the noise, and the curve an estimate of the underlying trend: interpret it like a regression fit.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
