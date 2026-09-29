# Dierckx Spline

**Dierckx Spline** wraps FITPACK, Paul Dierckx's Fortran spline library. `Spline1D` fits a spline of degree 1 to 5 through **irregular** knots, optionally **smoothing** noisy data, and computes exact derivatives and integrals.

## Construction
```julia
using Dierckx
itp = Spline1D(xs, ys; k=3, s=0.0)     # cubic, exact interpolation
itp(2.5)
derivative(itp, 2.5; nu=1)              # exact first derivative
integrate(itp, 1.0, 4.0)                # exact definite integral
```

## Degree
`k` sets the degree: 1 (linear), 3 (cubic, the default) or 5 (quintic). Odd degrees are the usual choice. The number of knots must exceed `k`.

## Smoothing Factor
- `s = 0` passes through every knot exactly.
- `s > 0` fits a smoother least-squares spline whose sum of squared residuals is at most `s`; FITPACK chooses how many internal knots to use.
- A common starting point for noisy data is the number of knots times the noise variance. Larger values give smoother curves; too large, and real features are flattened.

## How It Works
With `s = 0` FITPACK solves for the spline through all the points. With `s > 0` it adds knots one by one until the residual sum of squares drops below `s`, keeping the curve as smooth as the constraint allows.

## Strengths and Limits
- Irregular knots, and a single parameter to move from exact interpolation to smoothing.
- Exact derivatives (`nu` up to `k`) and integrals from the spline itself.
- One dimension here (`Spline2D` exists for gridded or scattered surfaces).
- Choosing `s` takes judgement: check the residuals and the **Derivatives** plot.

## See Also
- [B-Spline](bspline.md) · [Cubic Spline](cubic-spline.md) · [Diagnostics](diagnostics.md)
