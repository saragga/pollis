# Cubic Spline

A **cubic spline** is a chain of cubic polynomials, one per interval, joined so that the value, the slope and the curvature are all continuous at every knot. The result is a smooth curve through every point.

## Construction
```julia
using Interpolations
knots = range(first(xs), last(xs); length=length(ys))   # uniformly spaced knots
itp   = cubic_spline_interpolation(knots, ys; bc=Natural(OnGrid()), extrapolation_bc=Flat())
itp(2.5)
```

`cubic_spline_interpolation` requires a uniform grid (a range). With irregular xs, use Dierckx instead.

## Boundary Conditions
A cubic spline needs one extra condition at each end.

| Condition | Meaning | Use for |
|---|---|---|
| `Natural(OnGrid())` | Zero curvature at the ends | Most data (the common default) |
| `Periodic(OnGrid())` | Value and slope match at both ends | Cyclic data: angles, time of day, seasons |
| `Line(OnGrid())` | Linear at the ends | Equivalent to Natural |

## How It Works
Continuity of value, slope and curvature at every interior knot, plus the two boundary conditions, give a tridiagonal system of equations for the curvatures. Solving it fixes every cubic piece. Among all twice-differentiable curves through the points, the natural cubic spline has the smallest total curvature.

## Strengths and Limits
- Visually smooth, with continuous first and second derivatives.
- Little oscillation compared with a single high-degree polynomial through all the points.
- Needs evenly spaced knots.
- Can overshoot near sharp changes, and passes through every point, noise included.

## See Also
- [Linear](linear.md) · [B-Spline](bspline.md) · [Dierckx Spline](dierckx.md)
