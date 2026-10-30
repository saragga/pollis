# Assumptions

## Twice Differentiable
f must be **twice continuously differentiable** near the path and the solution. With **Derivatives** = :forward, ForwardDiff.jl differentiates the Julia code of f twice, so f must be written in generic Julia code that accepts dual numbers: no hard-coded Float64 arrays, no calls into C. With :finite, the Hessian is approximated by finite differences of the gradient, which costs more evaluations and loses about half the digits.

## A Positive Definite Hessian at the Minimum
The fast local convergence assumes a **strict local minimum**: the gradient zero and the Hessian positive definite there. If the Hessian is singular at the minimum (a flat valley floor, or redundant parameters), the convergence slows to linear and the minimiser is poorly determined along the flat direction. **Hessian Conditioning** and **Local Curvature** show this.

## Close Enough to Start
Quadratic convergence is a **local** property: it holds only once the iterates are near the minimum. Far from it the Hessian can be indefinite, and the pure Newton step can go uphill or overshoot. The methods' safeguards (line search, trust region) make them converge from further away, but the start still decides which local minimum is found. **Start Robustness** measures how often each method succeeds from random starts.

## Box Constraints for IPNewton
IPNewton needs **x0 strictly inside** the bounds, since the barrier is infinite on the boundary, and lower bounds below the upper ones. Equal bounds, or a start on the boundary, fail.

## Cost
Each Newton iteration needs the n by n Hessian and the solution of an n by n linear system: about n^3 operations, and n forward-mode passes for the Hessian. For n in the thousands this is the bottleneck, and Truncated Newton or a quasi-Newton method is more economical.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
