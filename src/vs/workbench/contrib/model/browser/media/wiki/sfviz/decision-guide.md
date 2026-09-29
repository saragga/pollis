# Decision Guide

| Goal | Plot | Why |
|---|---|---|
| Exact level curves of f(x, y), in the plane | **Contour** ([contour](contour.md)) | Precise, compact, static (CairoMakie) |
| Intuitive 3D feel of f(x, y) | **Surface** ([surface](surface.md)) | Value as rotatable height (GLMakie) |
| Contours/isosurfaces in 3D | **3D Contour** ([3D contour](contour3d.md)) | Lift f(x, y) or show isosurfaces of f(x, y, z) |
| Internal structure of f(x, y, z) | **Volume** ([volume](volume.md)) | Translucent cloud reveals the interior |

## Decision Flow
1. **Is the field 3-D** (`f(x, y, z)`)? → volume (overall structure) or 3D contour (specific level surfaces).
2. **Is it 2-D** (`f(x, y)`)?
   - Need exact levels / a static figure → contour.
   - Want an intuitive 3-D feel → surface.
   - Want both precision and intuition → contour overlaid on a heatmap, or surface + contour.

## Rules of Thumb
- **2D contour → CairoMakie** (inline, static); **surface / 3D / volume → GLMakie** (interactive, needs GPU).
- **Use `:viridis`** (perceptually uniform); avoid rainbow colormaps that invent banding.
- **Add transparency** to 3D contours and volumes so the interior is visible.
- **Interpolate scattered data onto a grid** before contouring or surfacing.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
