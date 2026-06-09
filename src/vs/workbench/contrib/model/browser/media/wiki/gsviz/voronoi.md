# Voronoi

A **Voronoi diagram** partitions the plane around a set of **sites**: every location is assigned to its nearest site, carving the plane into one convex **cell** per site. It is the dual of the Delaunay triangulation and underlies nearest-neighbour queries, coverage analysis, and spatial interpolation.

## Construction
With [DelaunayTriangulation.jl](https://github.com/JuliaGeometry/DelaunayTriangulation.jl) and CairoMakie:

```julia
using CairoMakie, DelaunayTriangulation, Random
Random.seed!(1234)
points = rand(2, 50)            # 50 sites as a 2 x n matrix

tri  = triangulate(points)      # Delaunay triangulation
vorn = voronoi(tri)             # its dual Voronoi tessellation
voronoiplot(vorn)
```

## Reading It
- Each **cell** is the region of the plane closest to its site.
- **Cell edges** are equidistant from two sites; **vertices** are equidistant from three.
- Small cells mark **dense** clusters of sites; large cells mark sparse areas.

## Cautions
- Cells on the **boundary** are unbounded — they are clipped to a finite frame for display.
- The tessellation is sensitive to the **exact site positions**; near-duplicate sites give slivers.
- It partitions a **plane**, not a sphere — for geographic sites, project first.

## See Also
- [Choropleth](choropleth.md) · [Network Diagram](network.md) · [Decision Guide](decision-guide.md)
