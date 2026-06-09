# Choropleth

A **choropleth** shades geographic **regions** by a value using a colour scale — election margins, population density, regional sales. It maps a quantity onto place.

## Construction
With [GeoMakie.jl](https://github.com/MakieOrg/GeoMakie.jl) and region polygons (e.g. from `NaturalEarth.jl`):

```julia
using GeoMakie, CairoMakie, NaturalEarth
countries = naturalearth("admin_0_countries", 110)   # GeoTable of polygons
values = rand(length(countries.geometry))            # your value per region

fig = Figure(); ga = GeoAxis(fig[1, 1])
poly!(ga, countries.geometry; color = values, colormap = :viridis, strokewidth = 0.25)
Colorbar(fig[1, 2]; colormap = :viridis, label = "Value")
fig
```

## Reading It
- **Colour = value** — always consult the colour bar.
- Look for **clusters** of similar colour (spatial autocorrelation) and **outlier** regions.

## Cautions
- **Area distorts perception**: big regions dominate regardless of value; normalise to **rates / per-capita**, and consider a cartogram or [bubble map](network.md) for point data.
- The **classification** (quantile vs equal-interval) changes the pattern — state which you used.
- Use a sensible **map projection**; an unprojected lat/long grid badly distorts area.

## See Also
- [Decision Guide](decision-guide.md) · [Network Diagram](network.md)
