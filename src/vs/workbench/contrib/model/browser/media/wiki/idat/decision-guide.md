# Decision Guide

| Situation | Method | Why |
|---|---|---|
| Irregular knots, a quick and safe interpolant | **Linear** ([Linear](linear.md)) | Never overshoots; exact at every knot |
| Evenly spaced knots, a smooth curve | **Cubic Spline** ([Cubic Spline](cubic-spline.md)) | Continuous curvature, natural ends |
| Cyclic data (angles, seasons) on a regular grid | **Cubic Spline**, Periodic | Matches value and slope at both ends |
| A regular grid in two or more dimensions | **B-Spline** ([B-Spline](bspline.md)) | N-D grids, degree from constant to cubic |
| Step-like data | **B-Spline**, Constant | Nearest-neighbour values, no ringing |
| Irregular knots, a smooth curve, or exact derivatives and integrals | **Dierckx Spline** ([Dierckx Spline](dierckx.md)) | Irregular knots, `derivative` and `integrate` |
| Noisy data | **Dierckx Spline**, s > 0 | Least-squares smoothing instead of exact fit |

## Decision Flow

1. **Is the data noisy?** Use Dierckx with a positive smoothing factor.
2. **Is the data on a regular grid in more than one dimension?** Use B-Spline.
3. **Are the knots irregular?** Use Linear for safety, Dierckx for smoothness.
4. **Are the knots evenly spaced?** Use Cubic Spline, Periodic for cyclic data.
5. **Do you need derivatives or integrals?** Prefer Dierckx: it computes them exactly.

## Rules of Thumb
- **Start with Linear**: if it already answers the question, a spline adds only assumptions.
- **Plot on a dense grid** before trusting a smooth interpolant.
- **Do not extrapolate far**: beyond the knots every method is guessing.

## See Also
- [Linear](linear.md) · [Cubic Spline](cubic-spline.md) · [B-Spline](bspline.md)
