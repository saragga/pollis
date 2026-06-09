# 3D Contour

A **3D contour** lifts contours onto a three-dimensional axis. Two flavours: contours of a 2D field raised by their level (`contour3d`), and **isosurfaces** of a 3D field `f(x, y, z)` — surfaces of constant value, the 3D analogue of a contour line.

## Construction
```julia
using GLMakie
r      = range(-pi, pi; length = 41)
data2d = [cos(x) + cos(y)            for x in r, y in r]
data3d = [cos(x) + cos(y) + cos(z)   for x in r, y in r, z in r]

fig = Figure(size = (800, 400))
contour(fig[1, 1], -pi .. pi, -pi .. pi, -pi .. pi, data3d; axis = (type = Axis3,))   # isosurfaces
contour3d(fig[1, 2], r, r, data2d; levels = 10, linewidth = 3, axis = (type = Axis3,)) # lifted contours
fig
```

## Reading It
- **Isosurfaces** are shells of constant value; their spacing shows how fast the field changes through space.
- Use **transparency** (`alpha`) so inner shells are visible behind outer ones.

## Backend
Needs **GLMakie** (interactive 3D; rotate to disambiguate depth). Not a static-notebook plot.

## See Also
- [Volume](volume.md) · [Contour Plot](contour.md) · [Decision Guide](decision-guide.md)
