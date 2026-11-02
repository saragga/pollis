# Overview

Many planning problems ask for the best arrangement among an enormous number of discrete options. The panel shows three metaheuristics that find good arrangements quickly, without any guarantee of the best one.

## What Makes Combinatorial Problems Hard

A travelling-salesman tour of n cities has (n − 1)! / 2 possible orders in the symmetric case, so that listing them is hopeless beyond small n. The problem is NP-hard, and no fast exact method is known for the worst case. A metaheuristic gives up the proof of optimality, and aims for a good answer within a time budget. [Talbi (2009)](#ref-Tal2009a) describes the family and how such methods are designed.

## Which Problem the Panel Solves

The code builds a random symmetric travelling-salesman instance:

- **Cities (n)** points in the unit square, with seed 1
- `D`, the matrix of Euclidean distances
- `tourlen(t)`, the length of a closed tour

The aim is to minimise `tourlen`. The three methods are written directly in the generated code, so that each step can be read and changed. Any problem with a tour-like encoding can reuse their structure.

## How the Three Tabs Differ

| Tab | How it explores | Starting points |
|---|---|---|
| **GRASP** | Randomised greedy starts, each improved | New for each iteration |
| **VND** | Several neighbourhoods in order | Nearest neighbour, then random |
| **VNS** | Shakes the best tour, then descends | Always the best so far |

All three call the same `vnd!` descent, so they differ in where each descent starts from. **Neighbourhoods** sets which moves that descent uses.

## What a Neighbourhood Is

A neighbourhood is the set of solutions one move away from the current one. The panel has three:

| Name | Move |
|---|---|
| 2-opt | Reverse a segment |
| or-opt | Move a short segment, of 1 to 3 cities, elsewhere |
| swap | Exchange two cities |

A local optimum is a solution with no better neighbour. A local optimum for one neighbourhood is often not one for another, and that is the idea on which the panel's methods are built.

## A Common Workflow for a Heuristic

1. Run a tab, then look at **Tour Plot** and **Convergence Curve**.
2. Confirm the tour with **Solution**.
3. Test seeds with **Restart Study**, and budget with **Budget Impact**.
4. Judge quality with **Compare with 2-opt Baseline**, **Compare with Library** and **Objective Gap**.
5. Find which moves work with **Neighbourhood Usage** and **Neighbourhood Analysis**.

Repeat on other values of **Cities (n)** before drawing a general conclusion.

## References

<a id="ref-Tal2009a"></a>Talbi, E.-G. (2009). *Metaheuristics: From Design to Implementation*. Wiley. [doi:10.1002/9780470496916](https://doi.org/10.1002/9780470496916)

## See Also

- [Factsheet](factsheet.md) · [GRASP](grasp.md) · [VND](vnd.md) · [VNS](vns.md)
