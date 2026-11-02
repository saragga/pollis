# Interpretation

The output is the best point found and its value. Read it as the best seen in one run, and judge its quality from the behaviour around it.

## How to Read the Printed Result

The tab prints `best_point`, `best_value` and `evaluations`. For Rastrigin, the true minimum is known, 0 at the origin, so that the gap to it can be read directly. On a real problem it is unknown, and `best_value` is only an upper limit on the minimum. `evaluations` equals `NP * (gens + 1)` in the code, and it is the fair measure of effort. **Solution Summary** adds the spread, and **Algorithm Info** names the variant and its settings.

## How to Read Rastrigin Results

Local minima of Rastrigin lie close to integer points, with values rising with the distance from the origin. A result near 1 usually means that one coordinate sits at the next local minimum, about ±1. Near 2 means two such coordinates, and near 4 means four of them, or one coordinate near ±2. Inspect `best_point` to see which coordinate went astray. The structure makes it easy to read a failure, which most real functions do not allow. Raising **Dimension (n)** adds many more local minima, about 11^n in the box.

## How to Read the Curves

A log scale shows whether progress is steady. A straight falling line indicates a steady rate, and a plateau shows a stall. A late fall after a plateau means that a member found a better basin, which is a reason not to stop too soon. **Convergence Curve** shows a shift when values may be zero or negative, so the axis label "best f − shift" should not be read as the value of f. **Population Diversity** falling smoothly to tiny values is normal on success.

## How to Read the Adapted Parameters

**Parameter History** shows means of F and CR by generation, flat on **DE** and **epsilonDE**, whose settings are fixed. On **SHADE** and **Adaptive DE**, a low mean CR suggests that changes along single coordinates succeed, and a high value that coordinates need to change together. Changing F over time reflects the search stage. Means hide the distribution, which can be spread widely. As [Tanabe and Fukunaga (2013)](#ref-TF2013a) note for SHADE, several memory slots can hold different useful values at once.

## How to Read Dimension and Bound Results

**Dimension Scaling** runs dimensions 2 to 20, with the population at 10 times the dimension and the same number of generations. A rising best value with dimension is normal, since the problem grows much harder while evaluations grow only in proportion. **Bounds Sensitivity** reruns with changed boxes. A small move in value means a robust optimum, and a large one may mean that the optimum depends on the box, or that the runs differ by chance. Comparing against the multi-start spread separates those two.

## What the Results Do Not Say

A low value does not prove that the point is a global minimum, and repeated convergence to one point is evidence, not proof. Comparison on one function does not rank methods in general. Success on a smooth test function also does not show value on a noisy real objective. For further discussion of testing evolutionary algorithms, see [Eiben and Smith (2015)](#ref-ES2015a). Report the evaluations, seeds and settings with any value, so that others can judge what it took.

## References

<a id="ref-ES2015a"></a>Eiben, A. E. and Smith, J. E. (2015). *Introduction to Evolutionary Computing*. Springer. [doi:10.1007/978-3-662-44874-8](https://doi.org/10.1007/978-3-662-44874-8)

<a id="ref-TF2013a"></a>Tanabe, R. and Fukunaga, A. (2013). Success-history based parameter adaptation for differential evolution. *IEEE Congress on Evolutionary Computation*, 71–78. [doi:10.1109/CEC.2013.6557555](https://doi.org/10.1109/CEC.2013.6557555)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
