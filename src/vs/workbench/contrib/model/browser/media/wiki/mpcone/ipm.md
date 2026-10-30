# Interior Point

**Interior-point methods** solve conic programmes by following the **central path**: the solutions of a sequence of barrier problems, in which each cone constraint is replaced by a logarithmic barrier that goes to infinity at the cone's boundary. As the barrier weight goes to zero, the path leads to the optimum.

## Primal-Dual Methods
Modern solvers, Clarabel and ECOS among them, are **primal-dual**: they update the primal and dual variables together with Newton steps on the perturbed optimality conditions, typically with a predictor-corrector scheme (Mehrotra). Each iteration solves one linear system, factored with a sparse LDL' factorisation.

## Homogeneous Embedding
Clarabel, ECOS and SCS embed the problem in a **homogeneous self-dual** problem, which always has a solution: either an optimal pair or a certificate of primal or dual infeasibility. That is why they report infeasibility reliably instead of failing.

## Iterations and Accuracy
Interior-point methods take **10 to 50 iterations** on almost any problem, regardless of its size, and reach high accuracy, 1e-8. Each iteration is expensive, a factorisation, so very large problems become slow or run out of memory. **Solver Statistics** reports the iterations.

## First-Order Alternatives
**SCS** (splitting conic solver) and **COSMO** (ADMM) are **first-order** methods: each iteration needs only a matrix-vector product and a projection onto the cones, with one factorisation cached. They take hundreds or thousands of iterations, reach moderate accuracy, 1e-4 to 1e-6, and scale to much larger problems. **Solver Comparison** shows the difference in time and digits.

## Clarabel
**Clarabel** (Goulart and Chen, 2024), written in Julia and Rust, is an interior-point solver for quadratic objectives and cone constraints, including the exponential and power cones. Handling the quadratic objective directly, rather than through a cone, makes it faster on QPs. It is the panel's default.

## See Also
- [Duality](duality.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
