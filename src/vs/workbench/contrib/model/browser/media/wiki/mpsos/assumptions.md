# Polynomial Programming: Assumptions

What the panel takes for granted about the polynomial, the domain and the relaxation, and what a certificate does and does not establish.

## A polynomial in x

**Polynomial p(x)** must be a polynomial expression in the vector `x` of **n** variables, created by `@polyvar x[1:n]`. Sums, products, powers with integer exponents and broadcasts such as `sum(x .^ 4)` all give polynomials, while functions such as `exp` or `abs` do not. Coefficients are real numbers.

**Polynomial Contours** evaluates p with the first two variables on a grid and the others at zero, and plots p against x1 when **n** is 1.

## Even degree

[Laurent (2009)](#ref-Lau2009a) proves that a sum of squares has even degree, and that the polynomials squared in it have at most half that degree. An odd-degree p can never be certified, since it takes negative values somewhere. For **Polynomial Optimisation** an odd degree is allowed: the polynomial optimisation tutorial of SumOfSquares.jl, by [Legat, Weisser, Lofberg and Parrilo (2023)](#ref-LWLP2023a), minimises a cubic over a polyhedron.

## Sufficient, not necessary

A certificate proves non-negativity, but its absence proves nothing. [Parrilo (2003)](#ref-Par2003a) states Hilbert's result that non-negative forms and sums of squares coincide only for bivariate forms, quadratic forms and ternary quartics, which correspond, for polynomials that are not homogeneous, to one variable, degree two, and quartics in two variables. Outside those cases a non-negative p may have no certificate, and on all of R^n no choice of degree changes that, since the squares can have at most half the degree of p.

## A compact domain

The convergence of the bounds to the minimum of p on K rests on Putinar's theorem, which [Laurent (2009)](#ref-Lau2009a) states for an Archimedean quadratic module. The condition concerns the description of K, not only the set itself, and holds whenever one constraint alone defines a compact set.

The default **Domain**, the ball `sum(x .^ 2) <= 4`, satisfies it. A domain such as `x[1] >= 0 && x[2] >= 0` is not compact, and the convergence result does not apply to it. The tooltip's `sum(x .^ 2) <= 1e6` keeps the description compact while covering a very large region.

## A relaxation degree no lower than the degree of p

**Relaxation Degree** bounds the degree of every term σ_i g_i of the certificate, and the tooltip asks for at least the degree of p. In the notation of [Laurent (2009)](#ref-Lau2009a), the relaxation of order k is defined once 2k is at least the degree of p and of every g_j. The SumOfSquares.jl tutorial on polynomial optimisation also uses an odd `maxdegree`, 3, beside 4.

## Size

A dense polynomial of degree 2d in n variables needs a Gram matrix of size C(n + d, d), as [Parrilo (2003)](#ref-Par2003a) shows. The size grows polynomially in n for a fixed degree, but quickly when both grow, and the relaxation degree of **Polynomial Optimisation** plays the part of 2d. **Tighten Relaxation** solves four relaxations, from the degree of p to six degrees more.

## Numerical tolerances

The solvers return floating-point solutions, and several actions use thresholds:

| Action | Threshold | Use |
|---|---|---|
| **Gram PSD Check** | −1e-6 | Smallest eigenvalue for `psd` to be true |
| **Gram Decomposition** | 1e-8 | Eigenvalues kept as squares |
| **Extract Minimiser** | 1e-4 | Tolerance passed to `atomic_measure` |

A certificate is exact only up to these tolerances: Q is positive semidefinite to the accuracy of the solver, and p − m' Q m is zero to rounding.

## References

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-LWLP2023a"></a>Legat, B., Weisser, T., Lofberg, J., & Parrilo, P. A. (2023). SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia. [github.com/jump-dev/SumOfSquares.jl](https://github.com/jump-dev/SumOfSquares.jl)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md) · [Duality](duality.md)
