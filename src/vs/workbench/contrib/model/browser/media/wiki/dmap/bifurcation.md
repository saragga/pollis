# Bifurcation

A bifurcation is a qualitative change in long-run behaviour as a parameter moves. The panel sweeps a in the Hénon map to show a stable cycle doubling its period and then giving way to chaos.

## How the Diagram Is Built

For each a, **Bifurcation Diagram** iterates for a transient of **Iterations (n)** steps, keeps the next 100 values of x, and plots them above a. One point at an a means a fixed point, two points a period-2 cycle, and a smeared band a chaotic orbit. The grid has 200 values from 0.8 to 1.4, with b fixed at 0.3 and **Parameters (p)** unused. Orbits that escape to infinity are skipped, and leave a gap at that a.

## Where the Period Doubles

For b = 0.3, the first two doublings can be derived by hand:

| Change | Formula for a | a at b = 0.3 |
|---|---|---|
| Fixed point to period 2 | 3(1 − b)² / 4 | 0.3675 |
| Period 2 to period 4 | (1 − b)² + (1 + b)² / 4 | 0.9125 |

Each comes from an eigenvalue passing through −1. The diagram starts at 0.8, in the period-2 range, and it shows the second doubling at about 0.9125. Further doublings come quicker, and they accumulate near a = 1.06, where chaos begins.

## Why the Spacing Is Universal

[Feigenbaum (1978)](#ref-Fei1978a) found that the gaps between successive doublings shrink by a ratio tending to about 4.669, for a broad class of maps. The value does not depend on the details of the rule, which is why the Hénon and logistic diagrams look so alike. The logistic map x next = r x (1 − x) makes a clear reference:

| Change | r |
|---|---|
| Fixed point to period 2 | 3 |
| Period 2 to period 4 | 1 + √6, about 3.449 |
| Accumulation point | About 3.570 |

## What the Windows in the Chaotic Range Are

Past the accumulation point, the bands are interrupted by narrow windows of stable cycles, and each has its own smaller doubling cascade. For the logistic map, the period-3 window opens at r = 1 + √8, about 3.828. The title of [Li and Yorke (1975)](#ref-LY1975a) records a related result: for continuous maps of an interval, a cycle of period 3 implies cycles of all periods and irregular orbits. A fine grid can skip a window. Chaos at one value of a therefore says little about a value right next to it.

## What Happens at the Edge of the Range

Chaotic attractors can change suddenly, in what [Grebogi, Ott and Yorke (1982)](#ref-GOY1982a) named a crisis. A crisis can make the attractor jump in size or vanish, for instance when it touches its basin boundary. For b = 0.3, the attractor is lost not far above a = 1.4, and orbits then escape. Just past such a point, an orbit may wander chaotically for a long time and only then escape, so that a short run looks bounded. The sweep's top end of 1.4 stays on the safe side at b = 0.3.

## How to Read the Parameter Sweep

**Parameter Sweep** prints, for each of 20 values of a from 1.0 to 1.4, the number of distinct x values in 100 steps, rounded to 6 digits. A count of 4 means a period-4 cycle, and a count of 100 means no period within those steps. Since the grid starts at a = 1.0, where the cycle already has period 4, counts of 1 and 2 cannot appear at b = 0.3. A cycle longer than 100 steps looks like chaos, and an orbit still converging can inflate a count.

## References

<a id="ref-Fei1978a"></a>Feigenbaum, M. J. (1978). Quantitative universality for a class of nonlinear transformations. *Journal of Statistical Physics* 19(1), 25–52. [doi:10.1007/BF01020332](https://doi.org/10.1007/BF01020332)

<a id="ref-GOY1982a"></a>Grebogi, C., Ott, E. and Yorke, J. A. (1982). Chaotic attractors in crisis. *Physical Review Letters* 48(22), 1507–1510. [doi:10.1103/PhysRevLett.48.1507](https://doi.org/10.1103/PhysRevLett.48.1507)

<a id="ref-LY1975a"></a>Li, T.-Y. and Yorke, J. A. (1975). Period three implies chaos. *The American Mathematical Monthly* 82(10), 985–992. [doi:10.1080/00029890.1975.11994008](https://doi.org/10.1080/00029890.1975.11994008)

## See Also

- [Overview](overview.md) · [Fixed Points](fixed-points.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
