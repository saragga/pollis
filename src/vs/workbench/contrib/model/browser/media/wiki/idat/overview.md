# Overview

This webview offers four interpolants, from a simple piecewise-linear one to a smoothing spline with exact derivatives. Each one returns an object `itp` that is evaluated like a function:

```julia
yq = itp(xq)                            # value at a query point
yq = itp.(xq_vector)                    # values at many points
```

## Linear
Straight segments joining consecutive knots, with `linear_interpolation` from Interpolations.jl. Works on **irregular knots**; exact at every knot but with a kink at each one. See [Linear](linear.md).

## Cubic Spline
A smooth curve made of cubic pieces that join with matching slope and curvature, with `cubic_spline_interpolation`. Needs **evenly spaced knots**; the boundary condition controls the ends. See [Cubic Spline](cubic-spline.md).

## B-Spline
The general Interpolations.jl interface, `interpolate` with `BSpline(degree)` then `scale` onto the knot positions. Degrees from constant to cubic, on **regular grids in one or more dimensions**. See [B-Spline](bspline.md).

## Dierckx Spline
A FITPACK spline, `Spline1D` from Dierckx.jl, of degree 1 to 5 on **irregular knots**, with an optional **smoothing factor** for noisy data, and exact derivatives and integrals. See [Dierckx Spline](dierckx.md).

## Common Workflow

1. Run the **Condition Check**: the knots must be strictly increasing and not wildly uneven.
2. Pick a method with the [Decision Guide](decision-guide.md) and plot it with **Interpolant Plot**.
3. Run **Residual Check**: an exact interpolant should hit every knot.
4. Compare the candidates with **Method Comparison**.
5. Evaluate what you need: **Dense Grid Evaluation**, **Derivatives** or **Definite Integral**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Linear](linear.md)
