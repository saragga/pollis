# Phase Portrait

A **phase portrait** shows the flow of a 2D **dynamical system** `dx/dt = f(x)`. `streamplot` integrates trajectories through the vector field, so fixed points, spirals, saddles, and limit cycles become visible at a glance.

## Construction
```julia
using CairoMakie                       # or GLMakie for an interactive window
# damped pendulum: state x = (theta, omega)
field(x) = Point2f(x[2], -sin(x[1]) - 0.2 * x[2])

streamplot(field, -2pi .. 2pi, -4 .. 4; colormap = :plasma, gridsize = (32, 32))
```

## Reading It
- **Streamlines** follow the flow; the **arrows** give its direction.
- **Fixed points** are where the field vanishes — spirals (damped), centres (closed orbits), saddles (in along one axis, out along another).
- **Colour** encodes the local speed `|f(x)|`.

## Cautions
- `field` must map a point to a `Point2f` velocity, not a scalar.
- Choose the **domain** to bracket the interesting dynamics; `gridsize` sets the seed density.
- A static image hides the direction of time — the arrows are essential.

## See Also
- [Surface](surface.md) · [Contour](contour.md) · [Decision Guide](decision-guide.md)
