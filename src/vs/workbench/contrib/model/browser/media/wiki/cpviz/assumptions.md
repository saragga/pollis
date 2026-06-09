# Assumptions

## Input Form
- **Mosaic** — a two-way **contingency table** of non-negative counts.
- **Nightingale** — one value per **cyclic** category; the categories have a natural order that wraps.
- **Waterfall** — an ordered sequence of **signed deltas** with a defined start.
- **Treemap** — non-negative values (optionally hierarchical) that sum to a meaningful whole.
- **Sankey** — a **flow network**: edges `(source, target, weight)` with non-negative weights.

## Non-Negativity and Conservation
Area- and flow-based encodings assume **non-negative** quantities. Mosaic, treemap, and sankey are meaningless for negative values. Sankey additionally assumes flow is (approximately) **conserved** at each node — inflow equals outflow — or the diagram misleads.

## Area Perception
Readers judge **area** less accurately than length. These plots trade precision for showing structure; when exact comparison matters, pair them with a bar chart or a table.

## Cardinality
All of these degrade with too many categories: mosaics and treemaps become unreadable past ~10–15 tiles, sankeys past a handful of nodes per stage, nightingale roses past ~12 sectors. Aggregate small categories into an "Other" bucket first.
