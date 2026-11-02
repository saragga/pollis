# Interpretation

Results describe the long-run behaviour of one map, at chosen parameters, from a chosen start. Each output supports some claims and not others.

## How to Read the Printed Result

The main code prints whether the orbit is bounded, the ranges of x and y, and the orbit size. Bounded means that the last state is finite, and the ranges give the extent of the set visited after 1000 steps. Since y next = b x, the y range is the x range scaled by b. The orbit size counts stored points, and it is one more than **Iterations (n)**, because the starting point after the transient is stored as well.

## How to Read the Orbit Plot

**Orbit Plot** draws each state as a point in the (x, y) plane. A few isolated points show a cycle, and a curve-like structure with folded layers shows the strange attractor. [Hénon (1976)](#ref-Hen1976a) showed that zooming in reveals further layers, which points to a fractal cross-section. Using the exponents, the Kaplan-Yorke estimate of dimension is 1 + 0.42 / 1.62, about 1.26: more than a curve, and much less than an area. Density along the structure is uneven, so dense parts mark where the orbit spends more time.

## How to Read the Lyapunov Exponent

The exponent gives the average rate of separation per step, on a natural-log scale. At 0.42, a small error grows by about e^0.42, or 1.52 times, per step on average. A positive value in a bounded orbit is the usual numerical sign of chaos. A negative value indicates a stable fixed point or cycle, and a value near zero indicates a point close to a bifurcation. The code labels anything above 0.01 as chaotic, and this cut-off is a working rule, with a small positive number possibly being noise. **Different Maps** gives about 0.49 for the logistic map at r = 3.9.

## How to Read the Predictability Horizon

**Forward Iteration** prints the steps needed for an error of 1e-8 to reach 0.1, as ln(0.1 / 1e-8) / λ. With λ = 0.42, that comes to about 38 steps. Tenfold better starting accuracy adds only about 5.5 steps, since each step costs about 0.18 digits. Thus even a perfect rule gives a short forecast. The horizon is an average, and some stretches of an orbit diverge more quickly than others. The formula has no meaning for a non-positive exponent, where errors do not grow.

## How to Read the State Statistics

**State Statistics** gives mean, standard deviation and range for each coordinate of the long orbit. Treat them as properties of the attractor, not of a process with independent draws. Successive states are strongly linked by the rule. The same numbers from other starts in the basin support the view that the orbit has one long-run distribution. The mean of x usually differs from the fixed points, which do not attract the orbit. A range is sensitive to orbit length, as rare excursions extend it slowly, whereas the mean and standard deviation settle sooner.

## What the Results Do Not Say

A positive exponent from a finite run is not a proof of chaos, because a very long cycle would look the same. A bounded run does not prove that the orbit stays bounded forever. Results at one value of a say little about neighbouring values, since narrow windows exist. Forecast limits say nothing about what the system does on average. Statements about the logistic map do not transfer to other maps, apart from universal features of period doubling.

## References

<a id="ref-Hen1976a"></a>Hénon, M. (1976). A two-dimensional mapping with a strange attractor. *Communications in Mathematical Physics* 50(1), 69–77. [doi:10.1007/BF01608556](https://doi.org/10.1007/BF01608556)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Fixed Points](fixed-points.md) · [Bifurcation](bifurcation.md)
