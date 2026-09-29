# Linear

**Linear interpolation** joins consecutive knots with straight segments. Between knots x_i and x_(i+1), the value is a weighted average of y_i and y_(i+1), weighted by how close the query point is to each.

## Construction
```julia
using Interpolations
itp = linear_interpolation(xs, ys; extrapolation_bc=Throw())
itp(2.5)                                # value at x = 2.5
```

The knots may be irregularly spaced.

## Extrapolation

| Rule | Outside the knots |
|---|---|
| `Throw()` | Raises a BoundsError (the default; safest) |
| `Flat()` | Repeats the first or last value |
| `Line()` | Continues the first or last segment |

## How It Works
The interpolant finds the segment containing the query point and evaluates the line through its two knots. It is exact at every knot and never goes above the highest or below the lowest value in a segment, so it cannot overshoot.

## Strengths and Limits
- Fast, simple, and robust on any sorted knots.
- No oscillation, no boundary conditions to choose.
- A **kink** at each knot: the first derivative jumps and the second is zero between knots, so derivative-based quantities are crude.
- Underestimates peaks and overestimates troughs of curved functions between knots.

## See Also
- [Cubic Spline](cubic-spline.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
