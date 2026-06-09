# Nightingale Rose

A **nightingale rose** (polar area / coxcomb chart) is equal-angle sectors whose radius encodes magnitude. Named for Florence Nightingale, who used it to show causes of mortality by month.

## Construction
Plots.jl has no built-in coxcomb recipe — `proj = :polar` with `seriestype = :bar` does *not* render sectors. Draw filled wedges with `Shape` in Cartesian coordinates instead:

```julia
using Plots
labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
values = [12, 19, 9, 25, 17, 22]
n = length(values)

plt = plot(; aspect_ratio = :equal, legend = false, framestyle = :none)
for i in 1:n
    a0, a1 = 2pi * (i - 1) / n, 2pi * i / n     # equal angular slice
    ts = range(a0, a1; length = 24)             # sample the arc
    xs = [0.0; values[i] .* cos.(ts); 0.0]      # wedge: centre -> arc -> centre
    ys = [0.0; values[i] .* sin.(ts); 0.0]
    plot!(plt, Shape(xs, ys); c = i, fillalpha = 0.7, linecolor = :white)
end
plt
```

Each sector spans an equal angle; its radius encodes the value.

## When to Use
Best for **cyclic** categories — months, hours of the day, compass directions — where wrapping the axis into a circle reflects the data's natural periodicity.

## Caution
The eye reads **area**, and area grows with the *square* of the radius. A sector with twice the value looks much more than twice as large. Use the rose for *seeing a cyclic pattern*, not for precise magnitude comparison — a bar chart is more honest for the latter.

## See Also
- [Decision Guide](decision-guide.md) · [Waterfall Plot](waterfall.md)
