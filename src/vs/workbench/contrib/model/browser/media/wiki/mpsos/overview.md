# Polynomial Programming: Overview

**Polynomial Programming** answers two questions about a polynomial p: is it non-negative everywhere, and how low can it go on a set described by polynomial inequalities? Both are hard in general, and both become semidefinite programs once non-negativity is replaced by a sum of squares.

## Why is non-negativity hard?

[Parrilo (2003)](#ref-Par2003a) recalls that testing whether a polynomial of degree four or more is non-negative everywhere is NP-hard. Unless P = NP, any method guaranteed to answer correctly in every instance must then behave unacceptably on problems with many variables.

Minimising a polynomial over a semialgebraic set, the set where finitely many polynomial inequalities hold, is likewise NP-hard in general, as [Laurent (2009)](#ref-Lau2009a) notes. She observes that minimisation without constraints is already hard for polynomials of degree four, while for degree two it is solvable in polynomial time, and that the constrained problem contains 0/1 linear programming.

## Sums of squares as certificates

A sum of squares of polynomials is non-negative, and checking whether a given polynomial is one is a semidefinite program, through a positive semidefinite Gram matrix Q with p = z' Q z for a vector of monomials z. [Parrilo (2003)](#ref-Par2003a) calls the approach relatively tractable, since the question reduces to semidefinite programs that can be solved efficiently.

The certificate is sufficient but not necessary: Hilbert showed that some non-negative polynomials are not sums of squares. [Sum of Squares Certification](sos.md) gives the details.

## From certificates to bounds

Asking for the largest t such that p − t is a sum of squares gives a lower bound on the minimum of p. On a set K = {x : g_j(x) ≥ 0}, the certificate becomes p − t = s_0 + Σ s_j g_j, with sums of squares s_j of bounded degree.

[Lasserre (2001)](#ref-Las2001a) turns the search for the global minimum into a sequence of convex problems with linear matrix inequalities, a sequence that is often finite. [Lasserre (2015)](#ref-Las2015a) gives a full introduction to this moment approach, and [Blekherman, Parrilo and Thomas (2012)](#ref-BPT2012a) present the wider field, called convex algebraic geometry, that begins with non-negative polynomials, sums of squares and their connection to semidefinite programming.

## Where polynomial programs appear

| Area | Question |
|---|---|
| Control | A Lyapunov function or a barrier certificate, a polynomial that must be non-negative |
| Global optimisation | A certified lower bound on a non-convex polynomial |
| Quadratic programming | Stronger semidefinite relaxations of non-convex quadratic programs |
| Matrix analysis | Sufficient conditions for copositivity |
| Probability | Bounds on probabilities |

[Parrilo (2003)](#ref-Par2003a) applies the method to global bounds, quadratic programming and copositivity, and the tutorials of SumOfSquares.jl, by [Legat, Weisser, Lofberg and Parrilo (2023)](#ref-LWLP2023a), cover Lyapunov function search, barrier certificates for collision avoidance and bounds in probability.

## How the panel is organised

**Sum of Squares Certification** asks whether **Polynomial p(x)**, in **n** variables, is a sum of squares, and keeps a function for lower bounds. **Polynomial Optimisation** bounds the minimum of p on **Domain**, at the order set by **Relaxation Degree**. Both pass their semidefinite program to the conic solver chosen in **Solver**: Clarabel, COSMO or SCS.

The actions fall into five groups: Visualise draws the Gram matrix and the contours of p, Diagnose checks the solver status and the Gram matrix, Predict tightens the relaxation and extracts minimisers, Compare sets solvers and sampling against each other, and Interpret writes out the squares and the dual certificate.

## References

<a id="ref-BPT2012a"></a>Blekherman, G., Parrilo, P. A., & Thomas, R. R. (Eds.) (2012). *Semidefinite Optimization and Convex Algebraic Geometry*. SIAM. [doi:10.1137/1.9781611972290](https://doi.org/10.1137/1.9781611972290)

<a id="ref-Las2001a"></a>Lasserre, J. B. (2001). Global Optimization with Polynomials and the Problem of Moments. *SIAM Journal on Optimization* 11(3), 796-817. [doi:10.1137/S1052623400366802](https://doi.org/10.1137/S1052623400366802)

<a id="ref-Las2015a"></a>Lasserre, J. B. (2015). *An Introduction to Polynomial and Semi-Algebraic Optimization*. Cambridge University Press. [doi:10.1017/CBO9781107447226](https://doi.org/10.1017/CBO9781107447226)

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-LWLP2023a"></a>Legat, B., Weisser, T., Lofberg, J., & Parrilo, P. A. (2023). SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia. [github.com/jump-dev/SumOfSquares.jl](https://github.com/jump-dev/SumOfSquares.jl)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md) · [Duality](duality.md)
