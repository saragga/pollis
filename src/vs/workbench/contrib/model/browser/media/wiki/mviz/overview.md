# Overview

When data has three or more variables, pairwise plots tell only part of the story. This webview offers four ways to see multivariate structure.

## Corner Plot
A triangular matrix of pairwise scatters with marginal densities on the diagonal — the standard view for **posterior samples** and any moderate set of variables. See [Corner Plot](corner.md).

## Parallel Coordinates
Each variable is a vertical axis; each observation is a **line** crossing all axes. Reveals clusters and multivariate patterns, especially when lines are coloured by group. See [Parallel Coordinates](parallel.md).

## Bubble Chart
A scatter that encodes a **third dimension as marker size** and optionally a **fourth as colour** — four variables in one plane. See [Bubble Chart](bubble.md).

## Heatmap
A matrix of values shown as a colour grid — ideal for **correlation matrices**, confusion matrices, and any 2-D array. See [Heatmap](heatmap.md).

## Why It Matters
Real problems are rarely two-dimensional. These plots let the eye find clusters, gradients, and correlations that no pair of axes could show alone.
