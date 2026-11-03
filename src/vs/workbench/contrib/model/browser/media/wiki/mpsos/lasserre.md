# Polynomial Programming: Lasserre Hierarchy

A sequence of semidefinite programs, one for each order, whose values are lower bounds on the minimum of a polynomial and approach it as the order grows. **Relaxation Degree** chooses a member of the sequence, and **Tighten Relaxation** climbs it.

## A sequence of relaxations

[Laurent (2009)](#ref-Lau2009a) presents two hierarchies, following [Lasserre (2001)](#ref-Las2001a). The sum of squares relaxation of order k bounds the minimum of p over K by

- the largest ρ with p − ρ = s_0 + s_1 g_1 + ... + s_m g_m
- s_0, ..., s_m sums of squares
- deg(s_0) and every deg(s_j g_j) at most 2k

for every k at least half the degrees of p and of the g_j, rounded up. Writing p_k for its value and p_min for the minimum, Laurent shows that

p_k ≤ p_{k+1} ≤ p_min

so the bounds never get worse as the order rises. Each p_k is a semidefinite program with matrices of size C(n + k, k).

[Lasserre (2015)](#ref-Las2015a) presents the hierarchy as one of the numerical schemes that positivity certificates from real algebraic geometry make possible, with optimal values that converge to the global minimum.

## The order in the panel

The code's `maxdegree` bounds the degree of each σ_i g_i, so **Relaxation Degree** is the 2k of the sum of squares relaxation, and the order is half of it. **Tighten Relaxation** solves the relaxation at `maxdegree(p)`, the degree of p, and at the next three even degrees, `maxdegree(p):2:maxdegree(p) + 6`, and plots the four bounds.

For **Sum of Squares Certification**, the sweep works on the ball of radius `box`, `@set(sum(x .^ 2) <= box^2)`, rather than on all of R^n, so that the bounds belong to a compact set. For **Polynomial Optimisation** it uses **Domain**.

## Convergence

[Laurent (2009)](#ref-Lau2009a) derives the convergence from Putinar's theorem: when the quadratic module of the g_j is Archimedean, p − p_min + ε is positive on K for every ε > 0, hence has a representation at some order, and p_k tends to p_min. [Polynomial Optimisation](polyopt.md) gives the condition.

The convergence can also be finite. Laurent shows that when the description of K includes polynomial equations with finitely many common complex roots, the sum of squares and moment bounds both equal the minimum from some order on; with finitely many real roots, the moment bounds do.

## The moment relaxation

The second hierarchy relaxes the existence of a measure on K. In the form [Laurent (2009)](#ref-Lau2009a) gives, the moment relaxation of order k minimises

p'y

over the vectors y of moments up to order 2k, subject to y_0 = 1, the moment matrix M_k(y) ⪰ 0, and the localising matrices M_{k−d_j}(g_j y) ⪰ 0, with d_j half the degree of g_j rounded up. For a point x in K, the moments of the Dirac measure at x are feasible with value p(x), so the moment bound is at most p_min. [Duality](duality.md) relates the two hierarchies.

## When is the bound exact?

[Laurent (2009)](#ref-Lau2009a) gives two stopping criteria for the moment relaxation. In the first, the point x* formed by the moments of order one lies in K and p(x*) equals the bound; x* is then a global minimiser. In the second, a rank condition holds: the moment matrix of some order s has the same rank as that of order s − d_K, with d_K the largest of the d_j. The bound then equals p_min, and global minimisers can be extracted from the moment matrix.

When the optimal moment matrix has maximum rank among all optimal solutions, the extraction finds all the global minimisers. Laurent notes that primal-dual interior-point methods that follow the central path return a solution in the relative interior of the optimal face, which under certain conditions is one of maximum rank.

## Cost

The matrices grow as C(n + k, k), of order n^k, so for a fixed order each bound is computed in polynomial time. [Parrilo (2003)](#ref-Par2003a) points out that the size of the semidefinite program is polynomial in the number of variables when the degree is fixed, and in the degree when the number of variables is fixed, but not when both grow.

## References

<a id="ref-Las2001a"></a>Lasserre, J. B. (2001). Global Optimization with Polynomials and the Problem of Moments. *SIAM Journal on Optimization* 11(3), 796-817. [doi:10.1137/S1052623400366802](https://doi.org/10.1137/S1052623400366802)

<a id="ref-Las2015a"></a>Lasserre, J. B. (2015). *An Introduction to Polynomial and Semi-Algebraic Optimization*. Cambridge University Press. [doi:10.1017/CBO9781107447226](https://doi.org/10.1017/CBO9781107447226)

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Duality](duality.md)
