# Marginal Plot

A **marginal plot** is a joint scatter of two variables with each variable's marginal distribution (histogram or KDE) drawn along its axis. It shows the relationship and both one-dimensional distributions in a single figure.

## Construction
```julia
using StatsPlots
marginalkde(x, y)                 # scatter + KDE margins
marginalhist(x, y; bins = 30)     # scatter + histogram margins
```

## What It Adds
A plain scatter shows the **joint** structure but hides each variable's own shape. The margins fill that gap: you see at once whether the cloud is linear *and* whether either variable is skewed, multimodal, or heavy-tailed.

## Reading It
- **Centre** — correlation and form (linear, curved, clustered).
- **Top margin** — distribution of *x*.
- **Right margin** — distribution of *y*.

## When to Use
Ideal for two continuous variables when you care about both their relationship and their individual distributions — for example, checking a predictor and response together before regression.

## See Also
- [Correlogram](correlogram.md) · [Decision Guide](decision-guide.md)
