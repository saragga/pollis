# Decision Guide

| Goal | Plot | Why |
|---|---|---|
| Association between two categorical variables | **Mosaic** ([mosaic](mosaic.md)) | Tile area shows joint frequencies |
| Magnitude across a cyclic axis | **Nightingale Rose** ([nightingale](nightingale.md)) | Sectors wrap a cycle |
| How a start value becomes an end value | **Waterfall** ([waterfall](waterfall.md)) | Floating bars show each step |
| Part-to-whole / hierarchy | **Treemap** ([treemap](treemap.md)) | Area-proportional tiles |
| Quantity flowing between stages | **Sankey** ([sankey](sankey.md)) | Band width is flow |

## Decision Flow
1. **Is it a flow between things?** → Sankey.
2. **Is it a running total of steps?** → Waterfall.
3. **Is it composition of a whole (maybe nested)?** → Treemap (or a mosaic if you have two crossed categoricals).
4. **Are the categories cyclic (months, hours)?** → Nightingale rose.

## Rules of Thumb
- **Bucket small categories into "Other"** before plotting — area encodings drown in slivers.
- **Keep quantities non-negative**; these encodings break for negatives.
- For exact comparison, a plain **bar chart** often beats an area encoding — use these for structure, not precision.
- **Annotate with values** where the reader needs the number, not just the proportion.
