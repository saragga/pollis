# Interpretation

## Mosaic
Read column **widths** as the marginal distribution of the first variable, and the **stacked splits** within each column as the conditional distribution of the second. When the splits look the same across columns, the variables are independent; when they shift, they are associated.

## Nightingale Rose
Each sector spans an equal angle, so **radius** (and area) carries the magnitude. Because area scales with radius squared, a sector with twice the value looks far more than twice as large — interpret with that caution, and prefer it for *pattern across a cycle* rather than precise comparison.

## Waterfall
The **line of bars** tells a story: start, each gain or loss, end. Bars above the connecting level are increases; below, decreases. The final bar should equal the cumulative sum of all deltas — that is the payoff the chart exists to show.

## Treemap
**Area is share.** A tile twice as large represents twice the value. Nesting shows hierarchy: a parent's area equals the sum of its children. Use it to see *concentration* (a few big tiles) versus *evenness* (many similar tiles).

## Sankey
**Band width is quantity.** Follow a band from source to target to see where a flow goes and how it splits or merges. Conservation at each node means the widths in equal those out.

## Caveat
All of these rely on **area or angle** perception, which the eye reads approximately. They are excellent for communicating structure and proportion, weaker for exact values — annotate with numbers when precision matters.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
