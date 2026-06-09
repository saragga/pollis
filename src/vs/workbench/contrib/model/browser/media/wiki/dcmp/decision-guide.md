# Decision Guide

| Goal | Plot | Why |
|---|---|---|
| Compare a sample to a theoretical distribution | **ECDF** ([ecdf](ecdf.md)) or **QQ** ([qq](qq.md)) | Whole-distribution, bin-free comparison |
| Assess normality | **QQ plot** ([qq](qq.md)) | Tail and skew departures are obvious |
| Relationship + each variable's distribution | **Marginal plot** ([marginal](marginal.md)) | Joint and marginals in one figure |
| Survey many variables at once | **Correlogram** ([correlogram](correlogram.md)) | All pairwise relationships and marginals |

## Decision Flow
1. **One sample vs a theory?**
   - Emphasis on tails/skew → QQ.
   - Emphasis on overall fit / a KS-style gap → ECDF.
2. **Two variables?** → marginal plot.
3. **Many variables?** → correlogram, then drill into interesting pairs.

## Rules of Thumb
- **Standardise** before comparing to a standard normal.
- Pair a QQ plot with a **formal test** (KS, Anderson–Darling) — the plot shows *how* it deviates, the test shows *whether* it does.
- For tied/discrete data, prefer the ECDF (it handles ties honestly) over a QQ plot.
