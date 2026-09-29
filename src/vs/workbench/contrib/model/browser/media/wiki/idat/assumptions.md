# Assumptions

## Sorted, Distinct Knots
All methods assume the knots `xs` are **strictly increasing**. Duplicated x values give two y values at one point, which no function can pass through. Sort the data and merge duplicates first:

```julia
p  = sortperm(xs)
xs, ys = xs[p], ys[p]
all(diff(xs) .> 0)                      # true when strictly increasing
```

## Spacing
Linear and Dierckx accept **irregular** knots. Cubic Spline and B-Spline assume a **uniform** grid; the panel code places `length(ys)` evenly spaced knots between the first and last x:

```julia
knots = range(first(xs), last(xs); length=length(ys))
```

If your xs are not evenly spaced, this silently moves the points. Use Linear or Dierckx instead, or resample onto a regular grid first.

## Enough Knots
A spline of degree k needs more than k knots: at least 4 for a cubic. With very few knots, prefer Linear.

## The Function Is Smooth Enough
Smooth interpolants (Cubic, B-Spline, Dierckx with k = 3 or 5) assume the underlying function is smooth between knots. At a genuine jump or corner they overshoot and ring. Linear, or Constant B-Splines, are safer for step-like data.

## Exact Data, or Explicit Smoothing
Exact interpolation (Dierckx with `s = 0`, and every other method) assumes the ys are accurate. Noisy ys produce a wiggly curve that chases the noise; set a positive smoothing factor in Dierckx instead.

## Queries Inside the Range
Interpolation is reliable only between the first and last knot. Outside it, the value comes from the **extrapolation rule** (`Throw()`, `Flat()` or `Line()`), which is a convention, not an estimate. See the **Extrapolation Plot** action.

## See Also
- [Diagnostics](diagnostics.md) · [Linear](linear.md) · [Decision Guide](decision-guide.md)
