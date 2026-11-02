# Interpretation

A run yields a good point, not a proven optimum. Reading the output means asking what the value shows, how far it can be trusted, and what settings shaped it.

## How to Read the Printed Result

`best_point` and `best_value` give the lowest point evaluated, and for the default function, the distance from 0 can be read directly. `generations` and `evaluations` state what the run used. On the compact tabs, they may fall short of what was asked, as the run stops once all bits are fixed. On Rastrigin at n = 5, a value near 1 means that one coordinate sits near ±1, and values near 2 mean that two sit there.

## How to Read the Solution Summary

**Solution Summary** gives each variable, its bounds and its relative position from 0 to 1. A position near 0 or 1 points to a limit, and **Bounds Feasibility** confirms it. For the default box, the optimum is at 0.5 for every variable, and any position differing by about 0.098 is the next ripple. On a real problem, positions show which variables the solution pushes to their limits, which may matter more than the value itself.

## How to Read the Fitness Landscape

**Fitness Landscape** draws f over x1 and x2 with the other variables fixed at the best point, and it marks the best. If the star sits at a dark spot, then the run is at a minimum in that slice. Other dark spots are alternative basins. A picture with many variables shows just one slice through the space, so that it can hide much, and it cannot prove that a point is a global minimum.

## How to Read the Operator Statistics

**Operator Statistics** states the settings and costs of the run, and on the compact tabs, the number of undecided bits. Undecided bits at the end show that the run stopped before the model had settled, and more generations could help. A large share of fixed bits long before the budget is used suggests that the virtual population is too small. On **GA** and **BRKGA**, the table gives a record for a report, and offers no direct evidence of quality.

## How to Read the Comparisons

**Compare with DE** and **Compare with CMA-ES** give mean and worst best values, with time per run, across 5 seeds. Both rivals get the evaluations of the main run, which may be low if a compact tab stopped early. Few seeds mean that close gaps are not evidence. **Population Size Study** holds evaluations about equal, and it shows how size trades against generations. A comparison on a separable function favours per-gene operators and can reverse when the coordinates are rotated.

## What the Results Do Not Say

A low value does not show that a run found the global minimum, and agreement across seeds is evidence only. Winning on one test function does not extend to other functions, which is the warning behind the no-free-lunch results. A GA does not explain why a solution is good. It offers no gradient, no sensitivity measure of any formal kind, and no bound on the distance to the optimum. Treat a result as a candidate, and verify it with a local check.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Classic GA](ga.md) · [BRKGA](brkga.md)
