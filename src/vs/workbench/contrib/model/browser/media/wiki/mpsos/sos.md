# Polynomial Programming: Sum of Squares Certification

The **Sum of Squares Certification** problem of the panel: how a sum of squares proves that a polynomial is non-negative, how a semidefinite program finds one, and what it means when none is found.

## Squares as a proof

A polynomial written as p = u_1² + ... + u_m², with polynomials u_j, takes no negative value anywhere. [Laurent (2009)](#ref-Lau2009a) shows that such a p must have even degree, and that each u_j has degree at most half the degree of p. A polynomial of odd degree therefore has no decomposition, as the tooltip of **Polynomial p(x)** warns, and the squares need only the monomials up to half its degree.

[Parrilo (2003)](#ref-Par2003a) recalls that testing whether a polynomial is non-negative everywhere is NP-hard once the degree is at least four. A sum of squares decomposition is a sufficient condition that can be tested efficiently, and the panel looks for one.

## The Gram matrix

[Parrilo (2003)](#ref-Par2003a) writes a polynomial of degree 2d as a quadratic form

p(x) = z' Q z

in the vector z of all monomials of degree at most d, whose length is C(n + d, d). Since the entries of z are not algebraically independent, Q is not unique: matching the coefficients of both sides gives linear equations, and the matrices Q that satisfy them form an affine subspace. If that subspace meets the cone of positive semidefinite matrices, p is a sum of squares. A factorisation Q = T' D T, with D diagonal and non-negative, gives

p(x) = Σ d_i (T z)_i²

with as many squares as the rank of Q. Deciding whether p is a sum of squares is therefore a semidefinite feasibility problem, with a matrix of size C(n + d, d).

## How SumOfSquares.jl writes it

The code builds the model with `SOSModel`, which, in the words of the SumOfSquares.jl documentation, makes non-negativity constraints between polynomials be interpreted as sum of squares constraints. The single line

`c = @constraint(model, p >= 0)`

then asks for a positive semidefinite Gram matrix of p. The model has no objective, so the solver only searches for a feasible Q, and `certified` is true when the termination status is `OPTIMAL`.

`gram_matrix(c)` returns the Gram matrix Q together with the basis of polynomials that indexes it, which **Gram Matrix Heatmap**, **Gram PSD Check** and **Gram Decomposition** read. The documentation also shows that a Newton polytope step can remove monomials before the semidefinite program is built, so the basis may be shorter than z. The package is by [Legat, Weisser, Lofberg and Parrilo (2023)](#ref-LWLP2023a).

## Non-negative but not a sum of squares

Hilbert's theorem, as [Laurent (2009)](#ref-Lau2009a) states it, says that every non-negative polynomial in n variables of degree d is a sum of squares exactly when n = 1, or d = 2, or n = 2 and d = 4. Outside those cases there are non-negative polynomials with no decomposition. The classic example is the Motzkin polynomial

x_1² x_2² (x_1² + x_2² − 3) + 1

which the arithmetic-geometric mean inequality shows to be non-negative on the plane, though it is not a sum of squares. The SumOfSquares.jl documentation shows that it can still be certified non-negative through a rational sum of squares decomposition.

For such a polynomial **Feasibility Check** reports that no certificate was found, although p ≥ 0 holds. An infeasible status says that no sum of squares decomposition exists at the degree tried, and nothing about the sign of p.

## A proof that no certificate exists

[Parrilo (2003)](#ref-Par2003a) describes the other side. Take a positive semidefinite matrix W that satisfies the same dependencies among its entries as z z'. The pairing trace(W Q) is then the same for every Q that represents p, and a negative value proves that p is not a sum of squares, since a positive semidefinite Q would make the trace non-negative. [Duality](duality.md) follows the idea further.

## From a certificate to a bound

The function `lower_bound` in the code maximises t subject to p − t being a sum of squares, with `maxdegree = d` and, unless told otherwise, the domain `FullSpace()`, all of R^n. [Parrilo (2003)](#ref-Par2003a) observes that the condition is affine in t, so a single semidefinite program finds the largest t, and every feasible t is a lower bound on the global minimum. **Tighten Relaxation**, **Extract Minimiser** and **SOS vs Sampling** call it, the first on the ball of radius `box`.

## References

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-LWLP2023a"></a>Legat, B., Weisser, T., Lofberg, J., & Parrilo, P. A. (2023). SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia. [github.com/jump-dev/SumOfSquares.jl](https://github.com/jump-dev/SumOfSquares.jl)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md) · [Duality](duality.md)
