# Polynomial Programming: Interpretation

How to read what the panel returns: the certificate, the Gram matrix and its squares, the lower bound, the minimisers, and the dual side.

## What does `certified` say?

`certified = true` means that the solver found a positive semidefinite Q with p = m' Q m, so p(x) ≥ 0 for every real x. The statement holds for all of R^n at once, not only at the points one could test, and **Gram PSD Check** confirms it to the accuracy of the solver.

`certified = false` is weaker: no sum of squares decomposition exists at the degree of p, and p may still be non-negative. The lower bound from `lower_bound` then tells how far from non-negative the certificate falls; a bound of −1 says that p + 1 is a sum of squares.

## Reading the Gram matrix

**Gram Matrix Heatmap** shows Q with its rows and columns labelled by the monomials of the basis. [Laurent (2009)](#ref-Lau2009a) writes the conditions on Q as one linear equation for each monomial x^α of p:

Σ over β + γ = α of Q_βγ = p_α

the entries whose pair of monomials multiplies to x^α sum to the coefficient of x^α. A diagonal entry Q_ββ is part of the coefficient of x^{2β}, and the diverging colour scale, centred at zero, shows which off-diagonal pairs carry positive and negative weight.

Several matrices Q usually represent the same p, and the solver returns one of them. Two runs with different solvers can return different heat maps, each a valid certificate.

## The squares

**Gram Decomposition** computes the eigendecomposition Q = Σ λ_i v_i v_i' and, for each eigenvalue greater than 1e-8, the polynomial s_i = √λ_i · (v_i' m). Then

p = s_1² + ... + s_r²

for **Sum of Squares Certification**, with r equal to `number_of_squares`. [Parrilo (2003)](#ref-Par2003a) notes that the number of squares can always be taken equal to the rank of Q.

For **Polynomial Optimisation** the squares come from σ_0 alone, so they give p − t = Σ s_i² + Σ σ_j g_j, with the multipliers σ_j still to add.

## The lower bound

`lower_bound` is a certified statement: p(x) ≥ t for every x in K. [Parrilo (2003)](#ref-Par2003a) adds that the bound is often equal to the global minimum, in which case a minimising point can be recovered from the dual solution, but that it can also be strictly lower.

On **Polynomial Contours** for **Polynomial Optimisation**, the white line is the contour p = `lower_bound`. Since the bound holds throughout K, any region enclosed by the line where p is less than the bound must fall outside the domain, in the slice shown.

## The minimisers

**Extract Minimiser** prints `minimisers`, the centres of the atoms of the measure recovered from the moment matrix, and `p_at_minimisers`, the values of p there. When each point lies in K and its value equals `lower_bound`, the bound is the minimum and the points are global minimisers. Several atoms whose values all equal the bound are several global minimisers.

`nothing` means that no atomic measure was found at this degree: the bound may still be the minimum, but the moment matrix does not exhibit the points.

## The dual certificate

**Dual Certificate** prints the moment matrix, the dual of the constraint that σ_0 is a sum of squares, indexed by the same monomials as Q. Its entry in row x^β and column x^γ stands for the moment of x^{β+γ}, and for a single point x* the matrix becomes m(x*) m(x*)'. For **Polynomial Optimisation** the action also prints `multipliers`, one for each inequality of **Domain**, as the SumOfSquares.jl documentation, by [Legat, Weisser, Lofberg and Parrilo (2023)](#ref-LWLP2023a), describes them. [Duality](duality.md) explains the meaning of both.

## References

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-LWLP2023a"></a>Legat, B., Weisser, T., Lofberg, J., & Parrilo, P. A. (2023). SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia. [github.com/jump-dev/SumOfSquares.jl](https://github.com/jump-dev/SumOfSquares.jl)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md) · [Duality](duality.md)
