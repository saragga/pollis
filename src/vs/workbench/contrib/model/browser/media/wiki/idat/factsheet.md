# Interpolate Data — Factsheet

**Interpolation** builds a continuous function that passes through a set of known points (the **knots**), so that values can be read off **between** them. With smoothing, the function passes close to the points instead of through them.

| | |
|---|---|
| **Purpose** | Evaluate a function known only at discrete points anywhere in its range, and differentiate or integrate it |
| **Input** | Sorted knot positions `xs`, values `ys` of the same length, and query points `xq` |
| **Core packages** | [Interpolations.jl](https://github.com/JuliaMath/Interpolations.jl), [Dierckx.jl](https://github.com/JuliaMath/Dierckx.jl) |
| **Methods** | Linear, Cubic Spline, B-Spline, Dierckx Spline |
| **Output** | An interpolant `itp` that is called like a function, `itp(xq)`, plus plots, derivatives and integrals |
| **Key parameter** | The method; then the extrapolation rule, boundary condition, degree or smoothing factor |

## When to Use

- **Resampling**: put irregular measurements on a regular grid, or align two series observed at different points.
- **Filling in** a smooth quantity between measurements: a yield curve between maturities, a calibration curve, a lookup table.
- **Derivatives and integrals** of tabulated data: rates of change, areas under a curve.

## What It Is Not

Interpolation is not regression. An exact interpolant reproduces every knot, noise included; it does not estimate an underlying relation or give uncertainty bands. For noisy data use the Dierckx smoothing factor, or a regression model. And interpolants are unreliable outside the range of the knots; see [Assumptions](assumptions.md).

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Cubic Spline](cubic-spline.md)
