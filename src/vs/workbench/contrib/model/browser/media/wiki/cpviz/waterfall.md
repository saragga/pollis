# Waterfall Plot

A **waterfall plot** shows how an initial value becomes a final value through a sequence of signed contributions, drawn as **floating bars** that step up (gains) and down (losses).

## Construction
```julia
using Plots
labels  = ["Start", "+Sales", "-Costs", "+Other", "End"]
deltas  = [100, 45, -30, 20]          # signed change at each step
cum     = cumsum(deltas)              # running total after each step
tops    = [cum; cum[end]]             # top of each bar (End = final total)
bottoms = [0; cum[1:end-1]; 0]        # base of each bar
bar(labels, tops; fillto = bottoms, legend = false)
```

Each bar spans `bottoms[i]` to `tops[i]`. The bar's **y-value must be the top coordinate** (the running total), not the delta — passing the signed delta makes a negative step plunge through zero. `fillto` then sets the base, so intermediate bars hang between the running totals before and after their step.

## Reading It
- Bars rising from the previous level are **increases**; bars dropping are **decreases**.
- The first and last bars are usually **anchored to zero** (the start value and the final total).
- The end bar should equal the cumulative sum of all deltas.

## Common Uses
Financial bridges (revenue → profit), inventory changes, headcount movements, any "start → adjustments → end" story.

## See Also
- [Decision Guide](decision-guide.md) · [Nightingale Rose](nightingale.md)
