# Specification Curve: Reading the Curve

What the figures, the plot and the table of **The Curve** show, and how to read them.

## What Does the Plot of a Specification Curve Show?

The plot has two parts that share one column for each specification. The upper part shows each specification's estimate as a point, with its 95% confidence interval as a vertical line, from the lowest estimate on the left to the highest on the right; a dashed line marks zero. A filled point is significant at 5%, its interval leaving out zero; a hollow one is not. The lower part, the grid of choices, has one row for each option kept, under its decision's label, and a mark in a column shows the option that specification used. Hovering a cut label shows it whole. With many specifications the intervals are left out and the points shrink, so that the curve stays readable.

## How to Read the Grid of Choices of a Specification Curve

The grid shows where along the curve each option's specifications fall. An option whose marks gather at one end moves the estimate: its specifications give the lowest or the highest estimates whatever the other choices are. An option whose marks spread evenly along the curve matters little. When the marks of a decision's options sort the curve into blocks, that decision explains much of its spread. [Simonsohn, Simmons and Nelson (2020)](#ref-SSN2020a) display the curve so that readers can see which decisions are consequential, which is what the grid is for.

## What Do the Figures of a Specification Curve Mean?

**Median Estimate**, **Interquartile Range (Q1 to Q3)** and **Range** describe the spread of the estimates across specifications, which is the variability that choices add and standard errors do not measure. **Same Sign as the Median** says how many estimates agree on the direction of the effect. **Significant, Same Sign** and **Significant, Opposite Sign** say how many reject zero at 5% on each side. A curve with nearly every estimate significant on one side is robust to the choices kept; one with estimates significant on both sides depends on them. These figures describe the curve and are not a test: **Inference Under the Null** is.

## What Does Which Choices Matter Show?

The table **Which Choices Matter** has a row for each option kept, under its decision, with the number of specifications that use it, their median estimate, and the share of them significant on the side of the curve's median. When no specification failed, the counts within a decision are equal, as each option meets every combination of the other decisions' options. Medians that differ much across the options of one decision mark a choice that moves the estimate; medians alike mark one that does not. The table summarises what the grid shows, and is easier to read when the curve has many specifications.

## What Happens to a Failed Specification?

A specification fails when `specification_data` or `estimate` throws an error, or gives an estimate or a standard error that is not a finite number, or a standard error that is not positive. The coder runs `curve.jl check` until no specification fails, but a curve run later on another computer, or after a change of a package, can still meet one. The figures, the plot and the table leave a failed specification out, and the status line under **Run Every Specification** gives their number and the first error. **Inference Under the Null** runs only when every specification runs.

## References

<a id="ref-SSN2020a"></a>Simonsohn, U., Simmons, J. P. and Nelson, L. D. (2020). Specification Curve Analysis. *Nature Human Behaviour* 4(11), 1208–1214. [doi:10.1038/s41562-020-0912-z](https://doi.org/10.1038/s41562-020-0912-z)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Choosing the Specifications](choosing-specifications.md) · [Inference Under the Null](inference-null.md)
