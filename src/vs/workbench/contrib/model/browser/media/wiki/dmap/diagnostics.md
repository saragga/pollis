# Diagnostics

Checks on a map ask three things: has the orbit reached its long-run set, are the measured numbers settled, and do different routes to the same quantity agree?

## How to Check That the Orbit Stays Bounded

The first printed line tests whether the final state is finite. A false value means that the orbit escaped, which happens quickly once it leaves the basin, since x² grows on each step. Every later figure then means nothing for that start. Near the edge of a parameter range, a bounded result may hold only for the run's length, so try a longer **Iterations (n)**. Compare the printed x and y ranges with **Orbit Plot**, where a range much wider than the visible structure suggests a stray point.

## How to Check the Transient

**Time Series** includes the first steps, and so it shows how quickly the orbit settles. Few steps are needed at the defaults, and many are needed near a bifurcation, where a cycle converges slowly. Blurred lines in **Bifurcation Diagram** at a doubling point are a common sign that the transient was too short for that value of a. Raise **Iterations (n)**, which sets the transient in the sweeps, and see whether the lines sharpen. A diagram that does not change with a longer transient is settled.

## How to Check the Exponent Two Ways

**Lyapunov Exponent** and **Sensitivity to ICs** estimate the same quantity by different routes. The first follows a tangent or nearby orbit with repeated rescaling, the standard approach of [Benettin, Galgani, Giorgilli and Strelcyn (1980)](#ref-BGGS1980a). The second fits a slope to the log distance between two orbits, before the distance reaches 0.1. It starts from one point, so that it varies with that point, and it needs repeats to approach the long-run value. Agreement to about one digit is good for the second route. Run the first with larger **Iterations (n)** to see whether it has settled.

## How to Check the Numbers by Hand

The map itself gives exact relations that a long orbit must satisfy:

| Quantity | Relation |
|---|---|
| Mean of y | b × mean of x |
| Standard deviation of y | b × standard deviation of x |
| Range of y | b × range of x |
| Mean m and standard deviation s of x | (1 − b) m = 1 − a (s² + m²) |
| Sum of the two exponents | ln b, which is −1.204 at the defaults |

Compare the first four with **State Statistics**. Small gaps come from the ends of the finite orbit. A large gap points to an error in the map's code.

## How to Check the Dependence on the Start

**Multiple Initial Conditions** runs four starts on the x axis. The same range and the same exponent suggest the same attractor, and an escape shows a start outside the basin. Different ranges with bounded orbits suggest coexisting attractors. Ranges from different starts differ a little anyway, since a finite orbit reaches the extremes only approximately. Differences of this kind should shrink as **Iterations (n)** grows. Further starts can be added to the list in the code, for a parameter set that seems to be near a transition.

## How to Check the Fixed Points and Cycles

Fixed points can be checked against the formula in [Fixed Points](fixed-points.md), and by evaluating the map at each one, which should return the same state. For **Parameter Sweep**, the rounding to 6 digits matters: an orbit still converging can yield more distinct values than its period, and so a raised count near a doubling can be spurious. Confirm a count with a longer transient. Counts of 64 or more also deserve a look at **Bifurcation Diagram**, since long cycles and narrow chaotic bands are hard to tell apart in 100 steps.

## References

<a id="ref-BGGS1980a"></a>Benettin, G., Galgani, L., Giorgilli, A. and Strelcyn, J.-M. (1980). Lyapunov characteristic exponents for smooth dynamical systems and for Hamiltonian systems; a method for computing all of them. Part 1: Theory. *Meccanica* 15(1), 9–20. [doi:10.1007/BF02128236](https://doi.org/10.1007/BF02128236)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Fixed Points](fixed-points.md) · [Bifurcation](bifurcation.md)
