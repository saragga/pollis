# Assumptions

## Input Form
- **Contour / surface** — a **2D gridded** field: a matrix `z[i, j]` over coordinate vectors `xs`, `ys`.
- **3D contour / volume** — a **3D array** `z[i, j, k]` over `xs`, `ys`, `zs`.

The field must be sampled on a (usually regular) **grid**. For scattered data, interpolate onto a grid first.

## Resolution
Grid resolution controls smoothness and cost. Too coarse and contours look jagged / isosurfaces blocky; too fine and 3D/volume rendering becomes slow. A few hundred points per axis is typical for 2D; 3D arrays grow as the cube, so keep them modest (~50-100 per axis).

## Backend / Interactivity
- **CairoMakie** produces **static** vector output and is ideal for 2D contour (and renders inline in notebooks).
- **GLMakie** produces **interactive** 3D (rotate/zoom) and is effectively required for **volume**; it needs a display and GPU, and does not render inline as a static image.

## Colour and Levels
- Choose **contour levels** deliberately (linear, log, or custom); the chosen levels shape the story.
- For signed fields use a **diverging** colormap centred at zero; for magnitudes a **sequential** one.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
