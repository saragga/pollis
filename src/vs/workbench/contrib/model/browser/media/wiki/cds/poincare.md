# Poincare Sections

A Poincare section records an orbit only when it crosses a chosen surface. A flow in three dimensions becomes a discrete set of points in two, and structure hidden in a tangle of curves can become plain.

## How a Section Reduces a Flow

Choose a surface that orbits cross transversally, and record each crossing in order. The rule that sends one crossing to the next is called the Poincare map, or the return map. A flow with n variables gives a map with n − 1 variables. Nothing about the long-run type of motion is lost, and much of the clutter is. Periodic orbits of the flow become fixed points of the map, so their stability can be read from the map, as [Strogatz (2015)](#ref-Str2015a) explains.

## How the Panel Sets the Plane

`plane = (1, 0.0)` tells `poincaresos` to use the plane where variable 1 equals 0, so x = 0 here. The tuple form gives a plane of one fixed variable, and a vector of coefficients gives a general plane. The call returns the crossings, and the figure plots y against z. An orbit in the Lorenz system crosses x = 0 only when it switches between its two lobes, so that crossings are irregular in time. A run of T = 100 can contain few points as a result, so a larger **Time span (T)** gives a clearer figure.

## Which Plane to Choose

A useful plane is crossed often, and transversally. For the Lorenz system, the common choice is z = rho − 1, which passes through both non-trivial equilibria, and so is crossed on every loop around either lobe. In the panel's code, that would be `plane = (3, 27.0)` at rho = 28. A plane that the orbit misses gives nothing, and a plane nearly tangent to the flow gives crossings with large numerical error. Try two planes, and trust structure that appears in both.

## Why Direction and Transients Matter

An orbit crosses a plane in both directions, in turn. Counting both mixes two different branches of the map, so `poincaresos` counts one direction, set by its `direction` keyword. Reversing it can show a different picture. The panel's call also records from the start, with no transient removed, so early points may lie off the attractor. Adding `Ttr = 100` removes them, and the same keyword applies as in the other actions. Keeping these choices fixed makes runs comparable.

## How to Read the Points

| Pattern | Motion of the flow |
|---|---|
| One or a few isolated points | Periodic orbit |
| Closed curve | Quasi-periodic motion on a torus |
| Thin curve-like set, with structure at finer scales | Dissipative chaos |
| Area-filling scatter | Conservative chaos, or noise |

Lorenz attractor sections look almost like curves, because strong contraction leaves little width. Finite runs give a sample of the set, so a thin curve should not be taken for a closed loop until its points are read in order, as a periodic motion visits its points in a fixed pattern.

## How Crossings Are Computed

A solver step rarely lands on the plane, so the crossing has to be located. One way is to root-find on the solver's interpolant between the steps before and after a sign change. [Hénon (1982)](#ref-Hen1982a) gave a neat alternative, which swaps the crossing variable with time for one step, so that a single extra integration step lands on the plane exactly. Accuracy then depends on the solver's tolerance as well as on the root-finding tolerance. Tighten both before reading the fine structure of a section.

## What Lorenz Did in Place of a Section

[Lorenz (1963)](#ref-Lor1963a) recorded successive maxima of z, and plotted each against the previous one. The points fell almost on a single tent-shaped curve, so that chaos in three dimensions could be studied through a one-dimensional map. A return map of that kind is simple to make from the output of `trajectory`, and needs no plane. Near-curves of that kind are common in strongly contracting flows, and [Datseris and Parlitz (2022)](#ref-DP2022a) treat sections and return maps together in practical terms.

## References

<a id="ref-DP2022a"></a>Datseris, G. and Parlitz, U. (2022). *Nonlinear Dynamics*. Springer. [doi:10.1007/978-3-030-91032-7](https://doi.org/10.1007/978-3-030-91032-7)

<a id="ref-Hen1982a"></a>Hénon, M. (1982). On the numerical computation of Poincaré maps. *Physica D* 5(2–3), 412–414. [doi:10.1016/0167-2789(82)90034-3](https://doi.org/10.1016/0167-2789(82)90034-3)

<a id="ref-Lor1963a"></a>Lorenz, E. N. (1963). Deterministic nonperiodic flow. *Journal of the Atmospheric Sciences* 20(2), 130–141. [doi:10.1175/1520-0469(1963)020&lt;0130:DNF&gt;2.0.CO;2](https://doi.org/10.1175/1520-0469(1963)020%3C0130:DNF%3E2.0.CO;2)

<a id="ref-Str2015a"></a>Strogatz, S. H. (2015). *Nonlinear Dynamics and Chaos*, 2nd ed. Westview Press.

## See Also

- [Factsheet](factsheet.md) · [Solvers](solvers.md) · [Interpretation](interpretation.md) · [Diagnostics](diagnostics.md)
