# Descriptive Statistics — Factsheet

**Descriptive statistics** summarise what a data set looks like: where its values sit, how widely they spread, what shape their distribution has, how often each category occurs, and how variables move together. They are the first step of every analysis and make no claim beyond the data at hand.

| | |
|---|---|
| **Purpose** | Describe one variable, or the association between several, before modelling |
| **Input** | A numeric vector (Summary), a categorical or discrete vector (Frequency), or a numeric matrix with observations in rows (Correlation) |
| **Core packages** | [StatsBase.jl](https://github.com/JuliaStats/StatsBase.jl), [FreqTables.jl](https://github.com/nalimilan/FreqTables.jl), [Statistics.jl](https://github.com/JuliaStats/Statistics.jl) |
| **Methods** | Summary, Frequency, Correlation (Pearson or Spearman) |
| **Output** | Numbers and tables printed in the Julia REPL: moments, quantiles, counts, proportions, correlation and covariance matrices |
| **Key choice** | Mean and standard deviation or median and IQR; Pearson or Spearman |

## When to Use

- **Before any model**, to learn the scale, centre and spread of each variable and to catch data errors early.
- To **report** a sample: the classic "Table 1" of a study is a set of descriptive statistics.
- To **choose a method** later on: skewness, outliers and correlations decide whether a transformation, a robust estimator or a different model is needed.

## What It Is Not

Descriptive statistics describe the sample; they do not test hypotheses or give confidence intervals. A correlation of 0.3 says nothing on its own about whether the association would appear in another sample, or about cause and effect. For inference, move on to statistical tests and models.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Summary Stats](summary-stats.md)
