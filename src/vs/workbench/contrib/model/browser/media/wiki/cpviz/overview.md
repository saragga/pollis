# Overview

Categorical and proportional plots encode **area, angle, and flow** to communicate structure that bar charts alone handle awkwardly.

## Mosaic Plot
Tiles a rectangle so that each cell's **area** is proportional to the frequency of a cell in a two-way contingency table. Column widths show one variable's marginal; row splits within each column show the conditional distribution of the other. See [Mosaic Plot](mosaic.md).

## Nightingale Rose
A bar chart wrapped onto **polar axes**: equal-angle sectors whose radius (and hence area) encodes magnitude. Designed for cyclic categories such as months. See [Nightingale Rose](nightingale.md).

## Waterfall
A sequence of **floating bars** that start from a baseline and step up or down by signed deltas, ending at a final total. Ideal for showing how a starting value becomes an ending value. See [Waterfall Plot](waterfall.md).

## Treemap
Recursively partitions a rectangle into tiles whose **area** is proportional to value — a space-filling view of part-to-whole and hierarchy. See [Treemap](treemap.md).

## Sankey Diagram
Nodes connected by **bands whose width is proportional to flow**, conserving quantity as it moves between stages, sources, and sinks. See [Sankey Diagram](sankey.md).

## Why It Matters
Composition and flow are everywhere — budgets, cohorts, energy, web funnels. Encoding them as area or band width communicates proportion far more directly than a table of numbers.
