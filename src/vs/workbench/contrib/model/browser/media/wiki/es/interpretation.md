# Interpretation

A run returns the lowest value found within the budget under one seed. Reading it well means separating the value, the point and the method's progress from what can be concluded in general.

## How to Read the Printed Result

`best_point` is the point with the lowest value seen, and `best_value` is an upper limit on the true minimum. `evaluations` counts recorded calls, which may be somewhat below **Budget**, as generations are whole numbers and some methods stop early. On **GCMAES**, gradient calls are left out. `status` needs reading with its package in mind. For Rastrigin, the distance from 0 can be read directly: a value near a small whole number usually means that some coordinates sit in the ripple next to the origin.

## How to Read the Rastrigin Values

Each coordinate near an integer k adds about k² to f at the small dips, so that near (1, 0, 0, 0, 0), f is about 1, and near (1, 1, 0, 0, 0) about 2. **Population Spread** and **Solution Summary** show where the point lies. A value near 1 with one coordinate near ±1 means that the search found the bowl's floor area but missed the central dip by one step. That is a good result from a poor start, and it is still the wrong basin.

## How to Read the Search Traces

Early scattered evaluations in **Convergence Curve** and **Population Spread** show exploration, and later tight clusters show exploitation. The lines of points in **Population Spread** can reveal shape learning, as an adapted Gaussian stretches along a valley. Only x1 and x2 appear, and contours hold the others at the best point, so that a picture in many dimensions shows just one slice. Use it to spot obvious problems, not to confirm a result.

## How to Read the Method Comparisons

**Compare Strategies** gives mean and worst best across 3 seeds, plus time. **ES vs DE** does the same for the selected tab over 5 seeds. With so few seeds, close gaps are not meaningful, and large gaps can reverse on another function. The time per run includes the cost of the objective and internal cost. Times from the first call also include compilation in Julia, so that the first method listed may look slower than it is. Rerun before reading seconds.

## How to Read Scaling with Dimension

**Dimension Scaling** raises d with a budget proportional to d. Best values usually worsen as d rises, because the landscape needs more than linear budget, and Rastrigin at higher d has exponentially more local minima. Time grows too, through objective cost and the method's internal cost. The objective must accept any length of x, and the bounds use the first entries of **Lower Bounds** and **Upper Bounds**, so that non-uniform boxes do not carry over.

## What the Results Do Not Say

A run says nothing certain about the global minimum, and agreement among seeds is evidence, not proof. Ranking of methods applies to this function, box, budget and setting. Time-to-target, rather than value at a budget, can lead to another order. A value on a test function does not predict one on the real problem. Report seeds and budgets alongside any claim, and treat a single impressive number with suspicion.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [CMA-ES](cmaes.md) · [Decision Guide](decision-guide.md)
