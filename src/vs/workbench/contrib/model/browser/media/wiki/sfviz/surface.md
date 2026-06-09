# Surface

A **surface plot** renders `f(x, y)` as a **height map**: the field value becomes the z-coordinate, producing a rotatable 3D surface. It gives the most immediate intuition for peaks, valleys, ridges, and saddles.

## Construction
```julia
using GLMakie
xs = LinRange(0, 10, 100)
ys = LinRange(0, 15, 100)
zs = [cos(x) * sin(y) for x in xs, y in ys]
surface(xs, ys, zs; axis = (type = Axis3,), colormap = :viridis)
```

## Reading It
- **Height is value** — peaks and pits are literal.
- **Colour** usually doubles the height encoding (same colormap) to reinforce it.
- The surface can **occlude** parts of itself; **rotate** it (GLMakie) and, when you need exact values, pair with a [contour](contour.md).

## Backend
Best with **GLMakie** for interactivity. CairoMakie can render a static `Axis3` surface, but you lose rotation.

## See Also
- [Contour Plot](contour.md) · [3D Contour](contour3d.md) · [Decision Guide](decision-guide.md)
