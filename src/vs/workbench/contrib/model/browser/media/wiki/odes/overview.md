# Ordinary Differential Equations — Overview

## Initial Value Problems

An initial value problem asks for a function $y(t)$ with

$$y'(t) = f(t, y(t)), \qquad y(t_0) = y_0.$$

The right-hand side $f$ gives a **slope field**: at every point $(t, y)$ it says which way the solution heads. A solution is a curve that follows the arrows. For a system $u' = F(t, u)$ the arrows live in **phase space**, the space of all states, and a solution traces a **trajectory** through it.

A few equations have formula solutions. Exponential growth $y' = ry$ gives $y = y_0 e^{rt}$. Logistic growth $y' = ry(1 - y/K)$ gives an S-curve. Linear systems $u' = Au$ give $u(t) = e^{At}u_0$. Almost everything else is solved numerically.

## Higher Order Becomes First Order

A second-order equation $y'' = g(t, y, y')$ becomes a system by naming the velocity $v = y'$:

$$y' = v, \qquad v' = g(t, y, v).$$

Any order reduces this way, which is why solvers only need to handle first-order systems.

## Time Stepping

Every numerical method advances from $t_n$ to $t_{n+1} = t_n + h$ using slopes evaluated nearby.

| Method | Step | Global error |
|---|---|---|
| Euler | $y_{n+1} = y_n + h f(t_n, y_n)$ | $O(h)$ |
| Heun (improved Euler) | Average the slopes at the start and at an Euler guess | $O(h^2)$ |
| Classical RK4 | Weighted average of four slopes | $O(h^4)$ |
| Tsit5, Dormand-Prince | Five-stage pairs of orders 5 and 4 | $O(h^5)$ |
| Vern9 | Verner's order-9 pair | $O(h^9)$ |

Halving $h$ halves Euler's error but divides RK4's by 16.

## Adaptive Step Size

An **embedded pair** computes two answers of different order from the same slopes; their difference estimates the error of the step. If that estimate exceeds `abstol + reltol * |y|`, the step is rejected and retried smaller; otherwise it is accepted and the next step is enlarged. The solver takes long strides where the solution is smooth and short ones where it changes fast.

## Stiffness

An equation is **stiff** when it contains processes on very different time scales, and the fast ones have died out. Explicit methods stay stable only if $h\,|\lambda| \lesssim 3$ for every eigenvalue $\lambda$ of the Jacobian $\partial f / \partial y$, so a fast rate of 1000 forces tiny steps even when the solution is barely moving. **Implicit** methods (Rodas5P, FBDF) solve an equation at each step and remain stable with large steps. Stiffness is common in chemistry, in circuits, in any model mixing fast and slow adjustment, and in PDE discretisations.

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
