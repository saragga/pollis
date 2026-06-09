# Diagnostics

## Contour / Surface
- **Closely spaced contours** — a steep region (large gradient).
- **Widely spaced contours** — a flat region.
- **Closed loops** — a local maximum or minimum inside.
- **Saddle (crossing/hourglass pattern)** — a pass between two basins.

## 3D Contour / Volume
- **Nested isosurfaces** — concentric shells of constant value; spacing shows how fast the field changes.
- **Hidden interior** — use transparency (`alpha`) so inner structure is visible; opaque isosurfaces hide what's behind.

## Common Pitfalls
- **Aliasing** from too coarse a grid — refine and re-check that features persist.
- **Misleading colour** — an inappropriate colormap (e.g. rainbow) invents banding; prefer perceptually uniform maps (`:viridis`).

## Quick Checklist

| Cue | Implication |
|---|---|
| Tight contours | Steep gradient |
| Closed loop | Local extremum |
| Saddle pattern | Pass between basins |
| Jagged isolines | Grid too coarse |
