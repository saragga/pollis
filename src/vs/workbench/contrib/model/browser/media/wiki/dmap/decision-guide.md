# Decision Guide

The choices here are which action answers the question, how long to iterate, which parameters to scan, and when another map or another tool is needed.

## Which Action Answers Which Question

| Question | Action |
|---|---|
| What does the long-run set look like? | **Orbit Plot** |
| How fast does the orbit settle? | **Time Series** |
| Where are the equilibria, and are they stable? | **Fixed Points of Map** |
| Is the orbit chaotic? | **Lyapunov Exponent**, **Sensitivity to ICs** |
| How far ahead can I predict? | **Forward Iteration** |
| How does behaviour change with a? | **Bifurcation Diagram**, **Parameter Sweep** |
| Does the result depend on the start? | **Multiple Initial Conditions** |

## How Long to Iterate

**Iterations (n)** plays two roles, and the two call for different sizes. As an orbit length, 10000 is plenty for a picture and a stable exponent to two digits. As the transient in the sweeps, 10000 is generous, except close to a bifurcation, where convergence can be very slow. A long orbit serves a precise exponent or a statistic, and it costs little, since each step is cheap. Set the size by raising it until the printed numbers stop moving at the precision needed.

## Which Parameters to Scan

Start from **Bifurcation Diagram**, for the whole picture over a from 0.8 to 1.4. Then use **Parameter Sweep** for counts at a coarse grid. Both fix b at 0.3 and use `a_vals`, so edit `a_vals` and the value of b in the code to look elsewhere. To study a window or a doubling, narrow the range and refine the grid. To explore values below 0.8, widen the range: the fixed-point range ends at 0.3675 for b = 0.3, and period 2 lasts to 0.9125.

## When to Use the Logistic Map or Another Map

Use the logistic map to learn the concepts, since it has a single variable, with exact values such as an exponent of ln 2 at r = 4. Use the Hénon map to see folding in two dimensions. Use a three-variable continuous system if the question concerns flows, in the panels for dynamical systems. For a map from a real problem, replace `henon` and `henon_jac`. Keep the logistic line in **Different Maps** as a known reference when judging a new result.

## When a Map Is the Wrong Tool

A map suits a system that is naturally stepped, or a return map from a continuous system. With noise, the concepts change: a noisy orbit has no exact cycles or sharp windows, and a stochastic model is more honest. With measured data and no known rule, an exponent needs methods built for time series, which this panel does not have. To ask for certainty about a specific chaotic orbit, rigorous computation is needed, which goes beyond floating-point runs. Exact fixed points and short cycles are the exception here, as they can be solved by hand.

## What to Report from a Map Study

Give the map, the parameters, the start, the transient, the orbit length and the software. Report an exponent with the digits that stay stable when the orbit is lengthened, and from more than one start. For a bifurcation diagram, report its grid and the number of points kept. Describe claims of chaos as numerical evidence, and mention the bounded check. Say how close a value of a lies to a known transition, since results near one are less settled, and note whether **Multiple Initial Conditions** found one attractor or more than one.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Fixed Points](fixed-points.md) · [Bifurcation](bifurcation.md)
