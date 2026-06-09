# Overview

When a quantity is a **function of position** — `f(x, y)` or `f(x, y, z)` — ordinary plots don't fit. This webview offers four ways to see a scalar field.

## Contour Plot
Draws **level curves** (isolines) of a 2D field in the plane: every point on a line shares the same value, like contour lines on a topographic map. Compact and precise. See [Contour Plot](contour.md).

## 3D Contour
Lifts contours onto a **3D axis** — either contours of `f(x, y)` raised by their level, or **isosurfaces** of a 3D field `f(x, y, z)` (surfaces of constant value). See [3D Contour](contour3d.md).

## Surface
Renders `f(x, y)` as a **height map**: the value becomes the z-height, giving a rotatable 3D surface. Great for an intuitive feel of peaks, valleys, and saddles. See [Surface](surface.md).

## Volume
Visualises a full **3D scalar field** `f(x, y, z)` as nested isosurfaces or a **translucent cloud** (direct volume rendering), revealing internal structure. See [Volume](volume.md).

## Why It Matters
Fields are everywhere in science and engineering — potentials, temperatures, densities, terrain, simulation output. These plots turn a grid of numbers into structure the eye can read.
