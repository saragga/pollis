# Voxels

A **voxel plot** draws each cell of a **3D integer/array grid** as a small cube, coloured by its value — the volumetric analogue of a heatmap. It suits **discrete** occupancy or label data rather than a smooth field.

## Construction
```julia
using GLMakie
chunk = reshape(collect(1:27), 3, 3, 3)   # a 3x3x3 grid of labelled cells
voxels(chunk; gap = 0.33)                 # gap shrinks each cube to show separation
```

## Reading It
- **One cube per cell**; its colour encodes the cell value.
- **`gap`** separates the cubes so you can pick out individual cells.
- Rotate to inspect interior cells hidden behind the outer shell.

## Cautions
- **Requires GLMakie** (GPU/display); it does not render as a static notebook image.
- Best for **discrete** grids; for a smooth scalar field use a [volume](volume.md) plot.
- A dense cube hides its interior — use `gap`, transparency, or slice the array.

## See Also
- [Volume](volume.md) · [Mesh](mesh.md) · [Decision Guide](decision-guide.md)
