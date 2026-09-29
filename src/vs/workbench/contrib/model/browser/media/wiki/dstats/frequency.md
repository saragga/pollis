# Frequency

The **Frequency** method counts how often each level of a categorical or discrete variable occurs.

## Construction
```julia
using FreqTables, StatsBase
ft = freqtable(x)                       # counts per level, sorted by level
prop(ft)                                # proportions, summing to 1
countmap(x)                             # Dict from level to count
proportionmap(x)                        # Dict from level to proportion
```

## Cross-Tabulation
Two variables give a contingency table of joint counts:

```julia
ft2 = freqtable(sex, smoker)            # rows: sex, columns: smoker
prop(ft2; margins=1)                    # proportions within each row
prop(ft2; margins=2)                    # proportions within each column
```

Row proportions answer "among each sex, what share smokes?"; column proportions answer "among smokers, what share is of each sex?".

## Missing Values
`freqtable` counts `missing` as a level of its own, which is often what you want to see. Pass `skipmissing=true` to leave it out.

## Continuous Variables
Every distinct value of a continuous variable is its own level, so a frequency table is not useful. Bin the values first, for example with a histogram:

```julia
h = fit(Histogram, x; nbins=10)         # StatsBase: counts per bin in h.weights
```

## Strengths and Limits
- Exact, simple and complete for categorical data.
- Reveals **rare levels** and **misspelt labels** ("Lisbon" and "lisbon") before they reach a model.
- Tables with many levels are hard to read: sort by count and group the rare levels.

## See Also
- [Summary Stats](summary-stats.md) · [Correlation](correlation.md) · [Decision Guide](decision-guide.md)
