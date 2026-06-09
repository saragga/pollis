# Contour Plot

A **contour plot** draws the **level curves** (isolines) of a 2D scalar field `f(x, y)`: every point on a given line shares the same value, exactly like contour lines on a topographic map.

## Construction
```julia
using CairoMakie
xs = LinRange(0, 10, 100)
ys = LinRange(0, 15, 100)
zs = [cos(x) * sin(y) for x in xs, y in ys]
contour(xs, ys, zs; levels = -1:0.1:1, labels = true, colormap = :viridis)
```
For a custom level set (e.g. logarithmic), pass `levels = 10.0 .^ range(0.3, 3.5; length = 10)`.

## Reading It
- **Line spacing = slope**: close lines mean a steep gradient; far apart means flat.
- **Closed loops** enclose a local maximum or minimum.
- **Labels** (`labels = true`) annotate each line with its value.

## Filled Variant
`contourf(xs, ys, zs; levels = 12)` shades the **bands between levels** — easier to read overall shape, less precise on exact lines. Overlay `contour!` for both.

## Backend
Renders statically with **CairoMakie** and works inline in a notebook.

## See Also
- [Surface](surface.md) · [Decision Guide](decision-guide.md)
