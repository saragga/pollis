# Polynomial Programming: Factsheet

A quick reference for **Polynomial Programming**: the two problems, the inputs, the solvers, and what each action computes. SumOfSquares.jl turns each problem into a semidefinite program, and one of three conic solvers solves it.

## The two problems side by side

| Problem | Question | Certificate | Output |
|---|---|---|---|
| **Sum of Squares Certification** | Is p a sum of squares? | p = m' Q m with Q ⪰ 0 | `status`, `certified` |
| **Polynomial Optimisation** | How low can p go on **Domain**? | p − t = σ_0 + Σ σ_i g_i, each σ_i a sum of squares | `status`, `lower_bound` |

m is a vector of monomials and g_i are the inequalities of **Domain**, written g_i(x) ≥ 0. The first problem is the Gram matrix method that [Parrilo (2003)](#ref-Par2003a) presents, and the second a member of the hierarchy of [Lasserre (2001)](#ref-Las2001a).

## Inputs

| Input | Default | Used by | Meaning |
|---|---|---|---|
| **n** | 2 | Both | Number of variables x[1], ..., x[n] |
| **Polynomial p(x)** | `sum(x .^ 4) - sum(x .^ 2) + 1` | Both | Any polynomial expression in the vector x |
| **Domain** | `sum(x .^ 2) <= 4` | **Polynomial Optimisation** | The set K, in the `@set` syntax |
| **Relaxation Degree** | 4 | **Polynomial Optimisation** | `maxdegree`, the largest degree of each σ_i g_i |
| **Solver** | Clarabel | Both | Clarabel, COSMO or SCS |

The variables are created with `@polyvar x[1:n]` from DynamicPolynomials.

## Solvers

| Solver | Method | Source |
|---|---|---|
| Clarabel | Interior point, with a homogeneous embedding | [Goulart and Chen (2024)](#ref-GC2024a) |
| COSMO | Operator splitting, with chordal decomposition for sparse SDPs | [Garstka, Cannon and Goulart (2021)](#ref-GCG2021a) |
| SCS | Operator splitting, with a homogeneous self-dual embedding | [O'Donoghue, Chu, Parikh and Boyd (2016)](#ref-OCPB2016a) |

The solver is passed to `SOSModel`, and changing **Solver** changes nothing else in the model.

## Visualise, Diagnose and Predict actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Gram Matrix Heatmap** | Q as a heat map, rows and columns labelled by monomials |
| Visualise | **Polynomial Contours** | p on the (x1, x2) plane within ±`box`, the other variables at 0, or against x1 when **n** is 1, with the level p = `lower_bound` for **Polynomial Optimisation** |
| Diagnose | **Feasibility Check** | Termination, primal and dual status |
| Diagnose | **Gram PSD Check** | `min_eigenvalue`, `psd`, and for certification `max_residual_coefficient` |
| Predict | **Tighten Relaxation** | Lower bounds at four even degrees, from the degree of p up |
| Predict | **Extract Minimiser** | `lower_bound`, `minimisers` and `p_at_minimisers` |

`box` is 2.0 in both programs.

## Compare and Interpret actions

| Group | Action | Output |
|---|---|---|
| Compare | **Solver Comparison** | Status, objective and time for the three solvers |
| Compare | **SOS vs Sampling** | `sos_lower_bound`, `sampled_minimum` over 100,000 random points, `gap` |
| Interpret | **Gram Decomposition** | `number_of_squares` and the `squares` from the eigendecomposition of Q |
| Interpret | **Dual Certificate** | `moment_matrix`, and for **Polynomial Optimisation** the `multipliers` |

## Packages and textbooks

SumOfSquares.jl, by [Legat, Weisser, Lofberg and Parrilo (2023)](#ref-LWLP2023a), adds sum of squares constraints to JuMP, which [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a) describe. DynamicPolynomials provides the polynomial variables, `LinearAlgebra` the eigenvalues, and `Plots` the charts.

[Blekherman, Parrilo and Thomas (2012)](#ref-BPT2012a) introduce sums of squares and their link to semidefinite programming, and [Lasserre (2015)](#ref-Las2015a) the moment approach to polynomial optimisation. [Laurent (2009)](#ref-Lau2009a) surveys the hierarchies of semidefinite relaxations and their convergence, optimality certificates and extraction of minimisers.

## References

<a id="ref-BPT2012a"></a>Blekherman, G., Parrilo, P. A., & Thomas, R. R. (Eds.) (2012). *Semidefinite Optimization and Convex Algebraic Geometry*. SIAM. [doi:10.1137/1.9781611972290](https://doi.org/10.1137/1.9781611972290)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M., & Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779-810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-Las2001a"></a>Lasserre, J. B. (2001). Global Optimization with Polynomials and the Problem of Moments. *SIAM Journal on Optimization* 11(3), 796-817. [doi:10.1137/S1052623400366802](https://doi.org/10.1137/S1052623400366802)

<a id="ref-Las2015a"></a>Lasserre, J. B. (2015). *An Introduction to Polynomial and Semi-Algebraic Optimization*. Cambridge University Press. [doi:10.1017/CBO9781107447226](https://doi.org/10.1017/CBO9781107447226)

<a id="ref-Lau2009a"></a>Laurent, M. (2009). Sums of Squares, Moment Matrices and Optimization over Polynomials. In *Emerging Applications of Algebraic Geometry*, ed. M. Putinar and S. Sullivant, 157-270. Springer. [doi:10.1007/978-0-387-09686-5_7](https://doi.org/10.1007/978-0-387-09686-5_7)

<a id="ref-LWLP2023a"></a>Legat, B., Weisser, T., Lofberg, J., & Parrilo, P. A. (2023). SumOfSquares.jl: Polynomial Sum-of-Squares Optimization in Julia. [github.com/jump-dev/SumOfSquares.jl](https://github.com/jump-dev/SumOfSquares.jl)

<a id="ref-OCPB2016a"></a>O'Donoghue, B., Chu, E., Parikh, N., & Boyd, S. (2016). Conic Optimization via Operator Splitting and Homogeneous Self-Dual Embedding. *Journal of Optimization Theory and Applications* 169(3), 1042-1068. [doi:10.1007/s10957-016-0892-3](https://doi.org/10.1007/s10957-016-0892-3)

<a id="ref-Par2003a"></a>Parrilo, P. A. (2003). Semidefinite Programming Relaxations for Semialgebraic Problems. *Mathematical Programming* 96(2), 293-320. [doi:10.1007/s10107-003-0387-5](https://doi.org/10.1007/s10107-003-0387-5)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Sum of Squares Certification](sos.md) · [Polynomial Optimisation](polyopt.md) · [Lasserre Hierarchy](lasserre.md) · [Duality](duality.md)
