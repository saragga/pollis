# B-Spline

**B-Spline** is the general interface of Interpolations.jl: `interpolate` builds a spline of a chosen degree over the **indices** of an array, and `scale` maps those indices onto the real knot positions. It works on regular grids in one or more dimensions.

## Construction
```julia
using Interpolations
knots = range(first(xs), last(xs); length=length(ys))   # B-splines live on a regular grid
itp   = extrapolate(scale(interpolate(ys, BSpline(Cubic(Line(OnGrid())))), knots), Flat())
itp(2.5)
```

## Choosing the Degree

| Degree | Code | Result |
|---|---|---|
| 0 | `BSpline(Constant())` | Nearest neighbour: steps |
| 1 | `BSpline(Linear())` | Straight segments |
| 2 | `BSpline(Quadratic(Line(OnGrid())))` | Continuous slope |
| 3 | `BSpline(Cubic(Line(OnGrid())))` | Continuous slope and curvature |

Quadratic and cubic need a boundary condition, like the cubic spline.

## Several Dimensions
The same calls work on a matrix or higher-dimensional array, with one range per dimension:

```julia
A   = [sin(x) * cos(y) for x in xr, y in yr]           # values on a regular grid
itp = scale(interpolate(A, BSpline(Cubic(Line(OnGrid())))), xr, yr)
itp(0.3, 1.2)
```

## How It Works
`interpolate` solves for the B-spline coefficients that reproduce the values at the grid indices; `scale` rescales the index axis to your knots; `extrapolate` sets what happens outside them. The three steps are separate, which is what makes the interface flexible.

## Strengths and Limits
- One interface for every degree and any number of dimensions.
- Very fast evaluation, suited to large lookup tables.
- Regular grids only: irregular xs are moved to evenly spaced positions (see the Residual Check).

## See Also
- [Cubic Spline](cubic-spline.md) · [Dierckx Spline](dierckx.md) · [Decision Guide](decision-guide.md)
