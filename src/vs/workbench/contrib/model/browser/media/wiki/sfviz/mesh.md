# Mesh

A **mesh** renders an explicit surface from a list of **vertices** and the **faces** that connect them — the general form behind every 3D surface. Pair it with a `wireframe!` overlay to expose the underlying grid.

## Construction
```julia
using GLMakie, GeometryBasics, LinearAlgebra   # CairoMakie also renders a static mesh
r = 0.5f0; n = 30
theta = LinRange(0, pi, n); phi = LinRange(0, 2pi, 2n)
x = [r*cos(p)*sin(t) for t in theta, p in phi]
y = [r*sin(p)*sin(t) for t in theta, p in phi]
z = [r*cos(t)        for t in theta, p in phi]
points  = vec([Point3f(xv, yv, zv) for (xv, yv, zv) in zip(x, y, z)])
faces   = decompose(QuadFace{GLIndex}, Tessellation(Rect(0, 0, 1, 1), size(z)))
gb_mesh = GeometryBasics.Mesh(points, faces; normal = Vec3f.(normalize.(points)))

f, ax, pl = mesh(gb_mesh; color = [v[3] for v in points], colormap = :blues)
wireframe!(ax, gb_mesh; color = (:black, 0.2), linewidth = 1)
f
```

## Reading It
- **Vertices** are points in space; **faces** (triangles or quads) stitch them into a surface.
- **Normals** drive the shading — supply them for a smooth look.
- The **wireframe** overlay shows the topology: how the grid wraps the shape.

## Cautions
- Face **winding/orientation** affects lighting; consistent normals avoid dark patches.
- Colour can be **per-vertex** (length = number of vertices) or applied as a texture via UV coordinates.
- GLMakie lets you rotate it; CairoMakie gives a static view.

## See Also
- [Surface](surface.md) · [Voxels](voxels.md) · [Decision Guide](decision-guide.md)
