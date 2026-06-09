# Volume

A **volume plot** visualises a full **3D scalar field** `f(x, y, z)` — either as nested **isosurfaces** or via **direct volume rendering**, which accumulates the field along each viewing ray so dense regions appear brighter or more opaque. It reveals internal structure no surface can.

## Construction
```julia
using GLMakie
r    = LinRange(-1, 1, 80)
cube = [x^2 + y^2 + z^2 for x in r, y in r, z in r]

contour(cube; alpha = 0.5)            # nested isosurfaces as a translucent cloud
# volume(cube; algorithm = :mip)      # or direct (maximum-intensity) volume rendering
```

## Reading It
- **Brighter / more opaque** regions hold higher (or denser) values, depending on the algorithm.
- **Isosurfaces** (`contour`) give crisp shells; **volume** gives a soft cloud — choose precision vs overview.
- Always use **transparency**, or outer material hides the interior.

## Cautions
- 3D arrays grow as the cube — keep resolution modest (~50-100 per axis) for responsiveness.
- **Requires GLMakie** (GPU/display); it does not render as a static notebook image.

## See Also
- [3D Contour](contour3d.md) · [Surface](surface.md) · [Decision Guide](decision-guide.md)
