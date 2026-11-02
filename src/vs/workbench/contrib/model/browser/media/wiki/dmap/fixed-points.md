# Fixed Points

A fixed point is a state that the map leaves unchanged. Its position and its stability explain much of what orbits do, even when no orbit ever settles on it.

## Where the Hénon Fixed Points Lie

Setting x next = x and y next = y gives y = b x and a quadratic in x:

- a x² + (1 − b) x − 1 = 0

Its roots are x = [−(1 − b) ± √((1 − b)² + 4a)] / (2a), and real fixed points need (1 − b)² + 4a ≥ 0. At the defaults a = 1.4, b = 0.3, the square root is √6.09, about 2.468. The two fixed points are about (0.6314, 0.1894) and (−1.1314, −0.3394), which is a useful check on the output of **Fixed Points of Map**.

## How Stability Is Decided

Near a fixed point, the map acts like its Jacobian matrix:

- J = [−2a x, 1; b, 0]

Small errors shrink along a direction if the eigenvalue there has size below 1, and grow if it has size above 1. A fixed point is stable when all eigenvalues have size below 1. [Alligood, Sauer and Yorke (1996)](#ref-ASY1996a) set out the theory. The determinant is −b, so every step multiplies areas by |b|, here 0.3, and the map contracts areas everywhere.

## What the Default Values Give

The eigenvalues solve λ² + 2a x λ − b = 0, at each fixed point:

| Fixed point | Eigenvalues | Type |
|---|---|---|
| (0.6314, 0.1894) | About 0.156 and −1.924 | Saddle |
| (−1.1314, −0.3394) | About 3.260 and −0.092 | Saddle |

Each has one direction that grows and one that shrinks, so an orbit passes near a saddle and leaves again. Neither fixed point attracts anything at the defaults, and so the long-run orbit must do something else. The products are both −0.3, which is the determinant, and give a quick check.

## How the Panel Finds Them

**Fixed Points of Map** calls `fixedpoints`, with the box x from −2 to 2 and y from −1 to 1, and with `henon_jac` as the Jacobian. Interval arithmetic works with ranges of values, and it can rule out whole regions that hold no root, so the search looks across the box and needs no starting guess. A fixed point outside the fixed box is not reported, so change the box when other parameters move them. The printed `|eigenvalues|` are sizes, and they do not show signs.

## How Cycles Relate to Fixed Points

A cycle of period p consists of fixed points of the map applied p times, so that the same test applies to the product of the Jacobians around the cycle. For the Hénon map, the period-2 orbit's matrix has trace 4((1 − b)² − a) + 2b and determinant b². Cycles are often unstable and embedded in a chaotic attractor. To find them, compose the map p times in `henon` and run the same action, with the Jacobian adjusted to match.

## How Saddles Shape the Attractor

Each saddle has an unstable set, along which orbits leave, and a stable set, along which orbits arrive. Following the unstable set of a saddle draws a long curve, folded many times by the map. In pictures, [Hénon (1976)](#ref-Hen1976a) found a set made of many close curves, and such curves give the attractor its layered look. The stable set can also separate starts that stay bounded from those that escape. Fixed points thus matter here as organising structures, and not as resting places.

## References

<a id="ref-ASY1996a"></a>Alligood, K. T., Sauer, T. D. and Yorke, J. A. (1996). *Chaos: An Introduction to Dynamical Systems*. Springer. [doi:10.1007/b97589](https://doi.org/10.1007/b97589)

<a id="ref-Hen1976a"></a>Hénon, M. (1976). A two-dimensional mapping with a strange attractor. *Communications in Mathematical Physics* 50(1), 69–77. [doi:10.1007/BF01608556](https://doi.org/10.1007/BF01608556)

## See Also

- [Overview](overview.md) · [Bifurcation](bifurcation.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
