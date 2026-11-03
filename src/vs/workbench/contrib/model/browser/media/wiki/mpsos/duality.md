# Polynomial Programming: Duality

Every sum of squares program has a dual in which moments of a measure take the place of the polynomial's coefficients. The dual explains when no certificate exists, when the bounds of the two hierarchies agree, and how **Extract Minimiser** finds points from the solution.

## Sums of squares and moments

[Laurent (2009)](#ref-Lau2009a) states that the sum of squares relaxation and the moment relaxation of the same order are dual semidefinite programs, as [Lasserre (2001)](#ref-Las2001a) showed. Weak duality then gives

p_k^sos ≤ p_k^mom ≤ p_min

for every order k: the bound from sums of squares never exceeds the bound from moments.

[Parrilo (2003)](#ref-Par2003a) explains the dual of the sum of squares cone as the linear functionals that are non-negative on it, which depend only on the coefficients of the polynomial and not on the Gram matrix chosen. He notes two readings of these functionals, one of them as truncated moment sequences, after [Lasserre (2001)](#ref-Las2001a).

## The dual of one certificate

For a single polynomial, [Parrilo (2003)](#ref-Par2003a) replaces the rank-one matrix z z' of monomials by a positive semidefinite matrix W with the same repeated entries. Whenever x^α x^β = x^γ x^δ, W must have equal entries in those two positions. The value trace(W Q) is then the same for every Q that represents p, so a W with trace(W Q) < 0 proves that p is not a sum of squares.

The same object answers the opposite question. If W has rank one and its factor satisfies the relations among the monomials, Parrilo shows that a point x* can be read directly from the entries of W, at which the relaxation is exact.

## When do the two bounds agree?

[Laurent (2009)](#ref-Lau2009a) proves that if K has a non-empty interior, the sum of squares and moment bounds are equal at every order, and the sum of squares program attains its supremum whenever it is feasible. When the ball constraint R² − x_1² − ... − x_n² ≥ 0 is part of the description of K, the feasible set of the moment relaxation is bounded and its infimum is attained.

Without an interior the gap can be infinite. Laurent's example minimises x_1 x_2 over the segment [−1, 1] × {0}: the moment bound of order one is 0, the minimum, while the sum of squares relaxation of that order is infeasible. A **Domain** with an equality constraint has no interior, so the guarantee of the previous paragraph does not cover it.

## What the panel reads

The SumOfSquares.jl documentation distinguishes three duals of a constraint written as p = s_0 + s_1 q_1 + ... with sums of squares s_i:

| Function | What it returns |
|---|---|
| `dual(cref)` | The moments of the monomials of p |
| `moments(cref)` | The dual of the equality between p and the certificate, possibly with more monomials |
| `moment_matrix(cref)` | The dual of the constraint that s_0 is a sum of squares, the matrix of moments |

**Dual Certificate** prints `moment_matrix(c)`, and for **Polynomial Optimisation** also `lagrangian_multipliers(c)`, which the documentation describes as one multiplier for each inequality of the domain and none for the equalities. SumOfSquares.jl is the work of [Legat, Weisser, Lofberg and Parrilo (2023)](#ref-LWLP2023a).

## From moments to points

**Extract Minimiser** calls `atomic_measure` on the moment matrix with a tolerance of `1e-4`. In the documentation's words, the function checks whether some atomic measure, a sum of Dirac measures, has the moments of the matrix. It turns the moment matrix into a system of polynomial equations, through its singular value decomposition and without the equations of the smallest singular values, and the solutions of the system are the atoms. When the system has infinitely many solutions, the function concludes that the measure is not atomic and returns `nothing`.

[Laurent (2009)](#ref-Lau2009a) describes the same step under the rank condition of [Lasserre Hierarchy](lasserre.md): the atoms are the global minimisers, found as eigenvalues of multiplication matrices built from the moment matrix.

## References

<a id="ref-Las2001a"></a>Lasserre, J. B. (2001). Global Optimization with Polynomials and the Problem of Moments. *SIAM Journal on Optimization* 11(3), 796-817. [doi:10.1137/S1052623400366802](https://doi.org/10.1137/S1052623400366802)

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-LWLP2023a"></a>Legat, B., Weisser, T., Lofberg, J., & Parrilo, P. A. (2023). SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia. [github.com/jump-dev/SumOfSquares.jl](https://github.com/jump-dev/SumOfSquares.jl)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md)
