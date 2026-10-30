# Quasi-Newton Methods — Overview

The Quasi-Newton Methods panel minimises a smooth function f(x) of several variables with **quasi-Newton** methods. Newton's method steps to the minimum of the local quadratic model built from the gradient and the Hessian, and converges very fast near the solution, but needs the Hessian and a linear solve at every step. Quasi-Newton methods keep Newton's idea and replace the Hessian by an **approximation built from gradients**: each step's change in position, s = x_new - x, and change in gradient, y = g_new - g, show how the gradient varies along s, and the approximation is updated to match (the **secant condition**). The result converges **superlinearly** with only function and gradient evaluations. The fits use Optim.jl, with gradients by automatic differentiation (ForwardDiff.jl) or finite differences, and the step length from a line search (LineSearches.jl).

## BFGS
**BFGS** (Broyden, Fletcher, Goldfarb and Shanno, 1970) keeps a dense n by n approximation of the **inverse** Hessian, starting from the identity, and corrects it by a rank-two update after every step. The search direction is minus the approximation times the gradient: a matrix-vector product, no linear solve. It costs O(n^2) memory and work per iteration, which suits problems up to a few thousand variables.

## L-BFGS
**L-BFGS** (Liu and Nocedal, 1989) stores no matrix: it keeps the last **m** pairs (s, y), set by **Memory m**, and applies the BFGS approximation they imply to the gradient by a two-loop recursion, starting from a scaled identity. Memory and work are O(mn), so it handles problems with millions of variables; it usually needs more iterations than BFGS, each much cheaper.

## Derivatives and Line Search
**Derivatives** chooses exact gradients by forward-mode automatic differentiation, or finite differences. **Line Search** chooses how far to move along each direction: HagerZhang (the Optim default), BackTracking, MoreThuente or StrongWolfe.

## Common Workflow

1. Enter the **Objective f(x)** and the **Initial Guess x0**, choose the method, and run.
2. Follow the iterates of the quasi-Newton method in the **Convergence Trace** and, in two dimensions, the **Contour + Path**.
3. Diagnose with the **Convergence Check** and the **Gradient Check**.
4. **Evaluate at New Point**, and see how far the **Local Quadratic Model** holds.
5. **Compare Methods** and **Compare Line Searches**.
6. Read the **Solution Summary** and the **Local Curvature** at the solution.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
