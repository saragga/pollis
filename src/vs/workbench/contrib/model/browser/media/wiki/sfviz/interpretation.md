# Interpretation

## Contour
Read it like a **topographic map**: each line is a level of constant value, and **line spacing is slope** — close lines mean steep change, far apart means flat. Closed loops enclose a peak or pit; nested loops with increasing labels climb toward a maximum.

## Surface
The value is the **height**, so peaks, valleys, ridges, and saddles are literal. A surface gives the most immediate intuition but can **hide** parts of itself — rotate it (GLMakie), and pair with a contour when you need exact values.

## 3D Contour
An **isosurface** is the set of points where `f(x, y, z)` equals a chosen level — the 3D analogue of a contour line. Nested isosurfaces are shells; their spacing shows how quickly the field changes through the volume. Use transparency to see inside.

## Volume
Direct volume rendering accumulates the field along each viewing ray, so **dense/high-value regions look brighter or more opaque**. It reveals overall internal structure at the cost of precise boundaries — good for "where is the mass?", weaker for exact level surfaces.

## Caveat
All four encode value through **position, colour, or opacity**, which the eye reads approximately. They are excellent for revealing structure (peaks, shells, gradients), weaker for reading exact numbers — annotate or add a colour bar when precision matters.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
