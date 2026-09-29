# Surfaces and Fields — Factsheet

**Surface and field plots** visualise a **scalar value over a continuous domain** — `f(x, y)` over a plane or `f(x, y, z)` over a volume. They show how a quantity varies across space: terrain, temperature, potential, density.

| | |
|---|---|
| **Purpose** | Visualise scalar fields in 2D and 3D |
| **Input** | A gridded scalar field (a matrix `z[i, j]` or a 3D array) |
| **Core packages** | [Makie.jl](https://github.com/MakieOrg/Makie.jl), [CairoMakie.jl](https://github.com/MakieOrg/Makie.jl) (2D static), [GLMakie.jl](https://github.com/MakieOrg/Makie.jl) (interactive 3D) |
| **Plot types** | Contour, 3D contour, surface, volume |
| **Typical use** | Functions of two variables, simulation output, terrain, density |

## When to Use
- A quantity is defined **over a 2D plane** → contour or surface.
- A quantity is defined **over a 3D region** → 3D contour (isosurfaces) or volume.

## Backend Note
2D **contour** renders statically with **CairoMakie** (works inline in a notebook). **Surface**, **3D contour**, and **volume** want **GLMakie** — interactive OpenGL, needs a display/GPU.

## What It Is Not
These are for *continuous fields*, not discrete points, categories, or networks — for those use the other Visualise webviews.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
