# Specification Curve: Inference Under the Null

How **Inference Under the Null** tests whether the curve as a whole shows an effect, and how to read its table.

## Why Does a Specification Curve Need a Joint Test?

The specifications of a curve share their data, so their estimates are not independent: many significant estimates can come from one chance feature of the sample that every specification sees. Counting the significant specifications says nothing about how many would be significant with no effect at all. [Simonsohn, Simmons and Nelson (2020)](#ref-SSN2020a) give joint inference across all specifications as the third step of specification curve analysis. The test of the page is Pollis's own procedure for that step: it builds data with no effect that keep the dependence between specifications, and asks how often such data give a curve as extreme as the one observed.

## How Does Pollis Make Data With No Effect?

For each specification, `curve.jl` takes the specification's own estimate times `d`, the variable whose effect is estimated, out of the outcome `y`. On the specification's rows, the outcome then carries no effect of `d` of the size estimated, whatever else it carries. Each resample draws the rows with replacement, within the rows with `d` equal to 1 and within those with `d` equal to 0 when `d` takes only those values, so that both groups keep their sizes, and from all rows otherwise. Every specification is estimated again on each resample. The seed and the resample's number set the draw, so specifications on the same rows see the same resample.

## What Are the Three Statistics of the Joint Test?

The statistics are taken on the side of the curve's median estimate, its dominant direction, both for the observed curve and for each resample. **Median estimate** is the median of the estimates. **Share significant, same sign** is the share of specifications whose 95% confidence interval leaves out zero on that side. **Stouffer's Z** sums the specifications' z values, each estimate over its standard error, and divides the sum by the square root of their number, so that it weighs how far each estimate is from zero, not only whether it is significant. A curve can be extreme on one statistic and not on another.

## How to Read the Table of Inference Under the Null

The table has a row for each statistic, with its **Observed** value, its **Median Under the Null** across the resamples, and its **p-Value**: the share of resamples whose statistic is at least the observed one. A small p-value says that data with no effect seldom give a curve as extreme as the observed one. When no resample reaches the observed value, the p-value shows as below one over the number of resamples used, the smallest share the test can tell apart. The line above the table gives the resamples used, which can be fewer than those asked for when a specification fails on some resample.

## How Many Resamples Should the Joint Test Use?

**Resamples** offers 200, 500 or 1,000. More resamples give finer p-values and a smaller chance error in them, and take longer: the test runs every specification once for each resample, on every thread of the computer. 500 tell apart p-values a few thousandths apart; 1,000 are worth it when a p-value lies near a threshold of interest. **Seed** sets the resamples, so the same seed with the same code and data gives the same table, and another seed shows how much the p-values move with the draw.

## References

<a id="ref-SSN2020a"></a>Simonsohn, U., Simmons, J. P. and Nelson, L. D. (2020). Specification Curve Analysis. *Nature Human Behaviour* 4(11), 1208–1214. [doi:10.1038/s41562-020-0912-z](https://doi.org/10.1038/s41562-020-0912-z)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Choosing the Specifications](choosing-specifications.md) · [Reading the Curve](reading-curve.md)
