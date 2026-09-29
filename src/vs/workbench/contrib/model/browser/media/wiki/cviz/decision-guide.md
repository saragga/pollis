# Decision Guide

| Goal | Plot | Why |
|---|---|---|
| Relationship between two numeric variables | **Scatter** ([scatter](scatter.md)) | Shows correlation, form, outliers |
| Compare a value across categories | **Bar** ([bar](bar.md)) | Direct height comparison |
| Shape of one distribution | **Histogram** ([histogram](histogram.md)) | Modality, skew, spread |
| Compare location/spread across groups | **Box** ([box](box.md)) | Robust five-number summary |
| Compare full distribution shape across groups | **Violin** ([violin](violin.md)) | Density reveals multimodality |

## Decision Flow

1. **One variable or two?**
   - Two numeric → scatter.
   - One numeric → histogram / box / violin.
   - One categorical + a value → bar.

2. **One variable: summary or full shape?**
   - Just location and spread → box.
   - Full shape, possible multiple modes → violin.
   - Single sample, fine detail → histogram.

3. **Comparing groups?** Box and violin are built for side-by-side group comparison; prefer them over overlaid histograms.

## Rules of Thumb
- **Anchor bar charts at zero.**
- **Try several histogram bin widths** before trusting a feature.
- **Use violins when shape matters**, boxes when it does not.
- For very small groups, prefer a box plot (or show the raw points) over a violin.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
