# Trajectory Optimisation — Indirect Methods

Indirect methods optimise first and discretise afterwards: they derive the conditions an optimal trajectory must satisfy, then solve those conditions numerically ([Betts (1998)](#ref-Bet1998a)).

## What Pontryagin's Principle Requires of an Optimal Trajectory

Pontryagin's principle introduces a costate lambda(t) alongside the state, and the Hamiltonian H = running cost + lambda' f(x, u). Along an optimal trajectory, the state follows the dynamics, the costate follows lambda' = −dH/dx, and the control minimises H at each moment. The boundary conditions are the initial state at one end and the transversality condition lambda(tf) = Qf (x(tf) − xf) at the other, so the problem becomes a two-point boundary value problem.

## How the Indirect Methods Tab Eliminates the Control

The running cost is quadratic in u, so setting dH/du to zero gives the control in closed form, proportional to −R⁻¹ fᵤ' lambda, where fᵤ is the derivative of the dynamics with respect to the control. The closed form replaces u throughout the equations. The result is only exact when the dynamics are control-affine. Without bounds, there is no saturation to handle, and so **Control Bound** does not apply in this tab.

## Why the Tab Uses Multiple Shooting

Integrating state and costate over the whole horizon from a guess is very sensitive: costate equations tend to be unstable forwards in time, and a small error at the start becomes a huge error at the end. Multiple shooting splits the horizon into 5 segments. The unknowns are the costate at the start and the state and costate at each interior node, starting from straight-line states and zero costates. They are found by NLsolve.jl, with derivatives from ForwardDiff.jl, until the segments join up and the boundary conditions hold. **Max Iterations** limits the Newton iterations.

## Strengths and Limits of Indirect Methods

An indirect solution satisfies the optimality conditions, and costates reveal the sensitivity of the cost to the state. Few unknowns are needed compared with collocation. The drawbacks are a small region of convergence and the need for a costate guess, for which physical intuition offers little help. Adding bounds or other constraints requires new optimality conditions. This tab is therefore best kept for smooth, unbounded problems, or for refining a solution from another method.

## References

<a id="ref-Bet1998a"></a>Betts, J. T. (1998). Survey of numerical methods for trajectory optimization. *Journal of Guidance, Control, and Dynamics* 21(2), 193–207. [doi:10.2514/2.4231](https://doi.org/10.2514/2.4231)

## See Also

- [Direct Methods](direct.md) · [DDP](ddp.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
