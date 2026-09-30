# Partial Differential Equations — Overview

## Three Equations, Three Behaviours

| Equation | Type | Behaviour | Information travels |
|---|---|---|---|
| Heat $u_t = D u_{xx}$ | Parabolic | Smooths out: peaks fall, valleys fill | Instantly, but weakly, everywhere |
| Wave $u_{tt} = c^2 u_{xx}$ | Hyperbolic | Keeps its shape, travels, reflects | At speed $c$ |
| Poisson $-\Delta u = f$ | Elliptic | No time: a balance | Every point depends on every source |

The second derivative $u_{xx}$ measures how far $u$ at a point lies below the average of its neighbours. Heat flows from high to low, so under the heat equation $u$ rises where it is below that average and falls where it is above it.

## Finite Differences

On a grid with spacing $h$,

$$u_{xx}(x_i) \approx \frac{u_{i-1} - 2u_i + u_{i+1}}{h^2}, \qquad \text{error } O(h^2).$$

Stacking the grid values into a vector $u$ turns this into a sparse tridiagonal matrix $A$, so $u_{xx} \approx A u + b$, where $b$ carries the boundary values. In two dimensions, the **five-point Laplacian** is `kron(I, T) + kron(T, I)`.

## The Method of Lines

Discretise space but not time. The heat equation becomes an ODE system with one equation per grid point,

$$u'(t) = D (A u + b) + r(u),$$

which OrdinaryDiffEq solves with its adaptive, error-controlled solvers. The wave equation becomes a system in position and velocity, $u' = v$, $v' = c^2 (A u + b)$.

## Boundary Conditions

| Condition | Meaning | Grid |
|---|---|---|
| Dirichlet | $u$ fixed at the ends | Interior points; the end values enter through $b$ |
| Neumann (no flux) | $u_x = 0$: nothing crosses the ends | Cell centres, mirrored ghost points |
| Periodic | The right end joins the left | Wrap-around entries in the corners of $A$ |

## The Poisson Equation

With no time, the discretised equation is one linear system, $A u = b$. The matrix $A$ is sparse, symmetric and positive definite. A **sparse direct** solver factorises it, which is fast in 2-D for up to about a million unknowns. **Conjugate gradients** only needs products $A v$; its iteration count grows like $1/h$, and it is the method of choice in 3-D, usually with a preconditioner.

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
