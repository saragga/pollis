# Fractal Dimension

A strange attractor has fine structure at every scale, and its dimension can be a non-integer. The correlation dimension measures it by counting how many pairs of orbit points lie close together.

## What the Correlation Sum Is

The correlation sum C(ε) is the fraction of pairs of points closer than ε. On a set of dimension D, the sum scales as ε^D for small ε:

- C(ε) ∝ ε^D2

For a uniform line segment of length 1, C(ε) is about 2ε, so the slope is 1. For a filled square, the slope is 2. [Grassberger and Procaccia (1983)](#ref-GP1983a) showed that the slope gives a dimension for strange attractors from orbit points alone, and they reported about 2.05 for Lorenz. No grid of boxes is required, which is why it became the common choice.

## How the Code Estimates D2

`trajectory` gives points every 0.01 time units, after a transient of 100. At **Integration time (T)** of 200, that makes about 20000 points. `correlationsum` gives C(ε) at 20 scales from 0.01 to 10, and `grassberger_proccacia_dim` takes the slope in a linear part of the log-log curve. **Correlation Dimension** draws that curve, and it should be inspected, as a single printed number hides how good the fit was.

## How to Read the Scaling Region

| Scale | Curve | Cause |
|---|---|---|
| Very small | Noisy, or too steep | Few pairs, or noise fills space |
| Middle | Straight | True scaling, read the slope here |
| Comparable to the attractor | Flat, near 1 | All pairs count |

A slope should hold over at least a decade of ε. If no straight part exists, then no dimension can be claimed. The Lorenz attractor spans tens of units in z, so ε up to 10 stays below full saturation.

## What Limits the Estimate

Few points set an upper limit on the slope that can be measured. [Eckmann and Ruelle (1992)](#ref-ER1992a) gave a bound of about 2 log10 N, which is about 8.6 for 20000 points and is no concern here, but it matters for high-dimensional systems or short series. Points close in time also create false pairs: consecutive points on a flow look like a line, which pulls the slope towards 1, as [Theiler (1986)](#ref-The1986a) showed. A Theiler window excludes such pairs. Note that the code does not pass one explicitly.

## How Noise Changes the Curve

Noise fills all directions at scales below its size. Below that scale, the slope rises toward the dimension of the space, which is 3 for a Lorenz orbit in its own coordinates, and the embedding dimension for a delay embedding. Above that scale, the true slope can still be read. A rising slope at small ε is therefore a sign of noise. Clean simulated data have little of that, while measured data often have much, and a short scaling region results.

## What a Non-Integer Value Does and Does Not Show

A non-integer D2 suggests fractal geometry, but on its own it does not prove chaos. Strange attractors that are not chaotic exist, and coloured noise can give a false finite dimension in a short series. A value for D2 is a static description, and it says nothing about the timing of motion, so combine it with the exponent. Different dimensions also differ in principle, with D2 at most the information dimension, so D2 and D_KY need not coincide exactly.

## References

<a id="ref-ER1992a"></a>Eckmann, J.-P. and Ruelle, D. (1992). Fundamental limitations for estimating dimensions and Lyapunov exponents in dynamical systems. *Physica D: Nonlinear Phenomena* 56(2–3), 185–187. [doi:10.1016/0167-2789(92)90023-G](https://doi.org/10.1016/0167-2789(92)90023-G)

<a id="ref-GP1983a"></a>Grassberger, P. and Procaccia, I. (1983). Characterization of strange attractors. *Physical Review Letters* 50(5), 346–349. [doi:10.1103/PhysRevLett.50.346](https://doi.org/10.1103/PhysRevLett.50.346)

<a id="ref-The1986a"></a>Theiler, J. (1986). Spurious dimension from correlation algorithms applied to limited time-series data. *Physical Review A* 34(3), 2427–2432. [doi:10.1103/PhysRevA.34.2427](https://doi.org/10.1103/PhysRevA.34.2427)

## See Also

- [Factsheet](factsheet.md) · [Lyapunov Exponents](lyapunov.md) · [Recurrence Analysis](rqa.md) · [Diagnostics](diagnostics.md)
