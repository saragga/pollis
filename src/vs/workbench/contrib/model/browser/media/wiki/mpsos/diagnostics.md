# Polynomial Programming: Diagnostics

How to tell whether a certificate or a bound can be trusted: the solver's status, the Gram matrix, the residual, and two independent checks on the bound.

## Did the solver succeed?

**Feasibility Check** prints the termination status of the semidefinite program and the status of its primal and dual solutions.

| Problem | Status | Reading |
|---|---|---|
| **Sum of Squares Certification** | `OPTIMAL` | A Gram matrix was found, and `certified` is true |
| **Sum of Squares Certification** | `INFEASIBLE` | No sum of squares decomposition exists at this degree; p may still be non-negative |
| **Polynomial Optimisation** | `OPTIMAL` | `lower_bound` is the best bound of this order |
| **Polynomial Optimisation** | `INFEASIBLE` | No t gives a certificate at this degree |
| Either | Another status | The solver stopped for another reason; the values are not yet a solution |

A primal and a dual status of `FEASIBLE_POINT` together confirm that both the certificate and its moment dual are available, which **Extract Minimiser** and **Dual Certificate** need.

## Is the Gram matrix positive semidefinite?

**Gram PSD Check** computes the eigenvalues of the Gram matrix Q and prints `min_eigenvalue`. `psd` is true when the smallest eigenvalue is at least −1e-6, a margin for the accuracy of the solver.

For **Sum of Squares Certification**, the action also expands p − m' Q m and prints `max_residual_coefficient`, the largest absolute coefficient of the difference. A certificate holds when both checks pass: Q positive semidefinite, and m' Q m equal to p up to rounding. In [Parrilo (2003)](#ref-Par2003a)'s formulation the coefficient equations are the linear constraints of the semidefinite program, so the residual measures how far the solver's Q is from satisfying them.

For **Polynomial Optimisation** the check reads the Gram matrix of σ_0 alone; the multipliers of the constraints have Gram matrices of their own.

## Is the bound tight?

**SOS vs Sampling** evaluates p at 100,000 points drawn uniformly in the box [−`box`, `box`]^n, keeps for **Polynomial Optimisation** those that satisfy every inequality of **Domain**, and prints the smallest value. With an equality in **Domain**, the action stops with an error instead. For a domain given by inequalities every kept point lies in K, so `sampled_minimum` is an upper bound on the minimum, and

`sos_lower_bound` ≤ minimum ≤ `sampled_minimum`

A `gap` near zero shows that the bound is close to the minimum. A large `gap` leaves two explanations open: a relaxation that is not tight, or samples that miss the minimiser. Points of the domain outside the box are never sampled.

**Extract Minimiser** offers a sharper check. If the points it returns lie in K and `p_at_minimisers` equals `lower_bound`, then by the criterion of [Laurent (2009)](#ref-Lau2009a) the bound is the minimum and the points are global minimisers.

## Does the bound improve with the degree?

The bounds of the hierarchy can only rise with the order, as [Laurent (2009)](#ref-Lau2009a) shows. **Tighten Relaxation** plots them at four even degrees. A curve that flattens suggests, without proving, that the bound has reached the minimum; a flat curve together with minimisers from **Extract Minimiser** confirms it. A curve that falls at some degree points to a numerical problem, since exact bounds cannot.

## Do the solvers agree?

**Solver Comparison** solves the same model with Clarabel, COSMO and SCS and prints the status, objective and time of each. Clarabel is an interior-point solver, by [Goulart and Chen (2024)](#ref-GC2024a), while COSMO and SCS use operator splitting, by [Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) and [O'Donoghue, Chu, Parikh and Boyd (2016)](#ref-OCPB2016a). Agreement between methods this different is evidence that the value belongs to the problem rather than to one algorithm.

## Common failures and their usual causes

| Symptom | Usual cause |
|---|---|
| `INFEASIBLE` for a polynomial known to be non-negative | p is not a sum of squares, as in Hilbert's cases |
| `INFEASIBLE` for an odd-degree p in certification | A sum of squares has even degree |
| `min_eigenvalue` slightly negative | Floating-point accuracy of the solver |
| `minimisers` is `nothing` | The relaxation is not tight at this degree, or the moment matrix does not correspond to finitely many points |
| `lower_bound` far from `sampled_minimum` at every degree | A domain without the Archimedean property, or a relaxation degree still too low |
| Very slow solves | Large **n** or **Relaxation Degree**, since the matrices of order k grow as C(n + k, k) |

## References

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-OCPB2016a"></a>O'Donoghue, B., Chu, E., Parikh, N., & Boyd, S. (2016). Conic Optimization via Operator Splitting and Homogeneous Self-Dual Embedding. *Journal of Optimization Theory and Applications* 169(3), 1042-1068. [doi:10.1007/s10957-016-0892-3](https://doi.org/10.1007/s10957-016-0892-3)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md) · [Duality](duality.md)
