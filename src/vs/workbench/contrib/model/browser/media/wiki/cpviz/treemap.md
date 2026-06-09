# Treemap

A **treemap** fills a rectangle with tiles whose **area** is proportional to each category's value, optionally nesting tiles to show hierarchy. It is a compact, space-filling view of part-to-whole structure.

## Construction
A true treemap uses a **squarified** layout: at each step a tile is sliced off the shorter side of the remaining free rectangle so tiles stay close to square. This is self-contained with `Shape`:

```julia
using Plots
labels = ["A", "B", "C", "D", "E"]
values = [50, 25, 15, 7, 3]
order  = sortperm(values; rev = true)      # largest first
areas  = values[order] ./ sum(values)

x, y, w, h = 0.0, 0.0, 1.0, 1.0
plt = plot(; legend = false, xlims = (0, 1), ylims = (0, 1), framestyle = :box)
for (k, idx) in enumerate(order)
    frac = areas[k] / (w * h)              # share of the remaining free area
    if w >= h
        tw = w * frac; rect = (x, y, tw, h); x += tw; w -= tw   # vertical slice
    else
        th = h * frac; rect = (x, y, w, th); y += th; h -= th   # horizontal slice
    end
    rx, ry, rw, rh = rect
    plot!(plt, Shape([rx, rx+rw, rx+rw, rx], [ry, ry, ry+rh, ry+rh]); c = k, fillalpha = 0.6)
    annotate!(plt, rx + rw/2, ry + rh/2, text(labels[idx], 9))
end
plt
```

The simplest possible version is a one-directional **slice layout** (full-height strips), but it reads like a stacked bar; the squarified layout above is the recognisable treemap. For nested/hierarchical treemaps, use a Makie-based package.

## Reading It
- **Area = share.** A tile twice as large is twice the value.
- **Nesting = hierarchy**: a parent tile's area equals the sum of its children.
- Look for **concentration** (a few dominant tiles) versus **evenness**.

## Caution
Tiny categories become unreadable slivers — bucket them into "Other". Area is judged approximately, so annotate values where precision matters.

## See Also
- [Mosaic Plot](mosaic.md) · [Decision Guide](decision-guide.md)
