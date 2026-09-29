# Assumptions

These plots are descriptive and impose few formal assumptions, but each expects its input in a particular form.

## Variable Types
- **Scatter** — two **numeric** variables.
- **Bar** — a **categorical** axis and a numeric height (count or aggregate).
- **Histogram, box, violin** — one **numeric** variable (optionally split by a categorical group).

## Sample Size
- **Histograms and violins** need enough observations to estimate shape — with very few points, bin counts and density estimates are unstable and misleading.
- **Box plots** degrade gracefully and remain informative for small samples.

## Binning and Bandwidth
- Histogram appearance depends on **bin width / count**; always try more than one.
- Violin shape depends on the **KDE bandwidth**; an over-smoothed violin hides modes, an under-smoothed one invents them.

## Independence and Ordering
Points are treated as an **unordered sample**. If the data is a time series, use the Time Series Plot instead — a scatter or histogram discards the time ordering.

## No Distributional Assumptions
None of these plots assume normality. They are used precisely to *check* distributional shape before any model relies on it.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
