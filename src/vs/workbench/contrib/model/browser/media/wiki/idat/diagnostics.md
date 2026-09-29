# Diagnostics

## Condition Check
The **Condition Check** action verifies that the knots are strictly increasing and reports the ratio of the largest gap to the smallest. A ratio above 10 means very uneven spacing: splines can oscillate in the wide gaps, and the uniform-grid methods (Cubic Spline, B-Spline) will misplace points.

## Residual Check
The **Residual Check** evaluates the interpolant at the knots and reports the largest absolute residual:

```julia
res = itp.(xs) .- ys
maximum(abs.(res))                      # near zero for exact interpolation
```

For Linear and Dierckx with `s = 0` it should be at rounding level. For Cubic Spline and B-Spline on irregular xs it will not be, because the knots were moved to a uniform grid: a large value is the warning. For Dierckx with `s > 0`, the residuals are the price of smoothing and their sum of squares stays at most `s`.

## Overshoot and Oscillation
Plot the interpolant on a dense grid (**Interpolant Plot**, **Dense Grid Evaluation**) and look between the knots. A smooth spline can swing above the highest point or below the lowest, or ripple near sharp changes. If it does, try Linear, a lower degree, or a Dierckx smoothing factor.

## Derivatives
The **Derivatives** action plots the first and second derivatives. Jumps in the first derivative reveal the kinks of Linear; jumps in the second, those of Quadratic. Wild second derivatives point to overfitting noise.

## Extrapolation
The **Extrapolation Plot** shows the interpolant beyond the knots. Check that the chosen rule (`Flat()`, `Line()`) behaves sensibly there, or use `Throw()` to make out-of-range queries fail loudly.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Condition Check | Strictly increasing, gap ratio below 10 | Unsorted knots, or gap ratio above 10 |
| Residual Check | Near zero (exact methods) | Large residuals on a uniform-grid method |
| Dense plot | Smooth, stays near the data | Overshoot or ripples between knots |
| Second derivative | Moderate | Spiky, sign changes at every knot |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Cubic Spline](cubic-spline.md)
