# Differentiation — Assumptions

## Mathematical

- **Differentiability at the point.** $f$ must be differentiable at $x_0$. At a kink ($|x|$ at 0, $\max(x, 0)$ at 0) AD returns one of the one-sided slopes without warning; finite differences return something in between.
- **Twice differentiable for second derivatives.** Hessians and curvature need $f''$ to exist; piecewise-linear functions have zero second derivative almost everywhere.
- **Domain.** $x_0$ and the plotted window must be inside the domain: $\log(x)$ and $x^{0.3}$ need $x > 0$, and a Cobb-Douglas gradient is infinite at $x_i = 0$.

## Computational

- **Automatic differentiation differentiates the program, not the mathematics.** `if x > 0 ... else ... end` is differentiated branch by branch; an iterative solver is differentiated through its iterations.
- **ForwardDiff** needs code that accepts generic number types: avoid annotating arguments as `Float64` or preallocating `Float64` arrays inside $f$.
- **Enzyme** works on compiled LLVM code and supports mutation, but can fail on type-unstable code or unsupported foreign calls.
- **Mooncake** works on Julia's intermediate representation; it supports mutation and most of Base, and its first call is slow while rules are compiled.
- **FiniteDiff** assumes $f$ is smooth on the scale of the step $h$; noisy functions (simulations, solvers with loose tolerance) give meaningless difference quotients.
- **Symbolics** traces $f$ with symbolic variables, so loops and `if` statements that depend on the value of $x$ cannot be traced.
- **Complex step** (in the Step-Size Error action) needs $f$ to be real-analytic and to accept complex arguments; `abs`, `max` and comparisons break it.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
