# Conjugate Gradient

The conjugate gradient method chooses each direction from the new gradient **and** the previous direction:

    d_0     = -grad f(x_0)
    d_k     = -grad f(x_k) + beta_k d_{k-1}
    x_{k+1} = x_k + alpha_k d_k

The scalar beta_k sets how much of the last direction is kept; alpha_k comes from a line search.

## Conjugate Directions
On a quadratic f(x) = x' Q x / 2 - b' x, with exact line searches and the right beta_k, the directions are **conjugate** with respect to Q: d_i' Q d_j = 0 for i not equal to j. Minimising along conjugate directions never spoils the progress made along the earlier ones, so the method reaches the exact minimum in at most n steps, and often far sooner. This is also the classic iterative method for solving the linear system Q x = b.

## On General Functions
On a non-quadratic f the directions are only approximately conjugate, and there are several formulas for beta_k: **Fletcher-Reeves**, **Polak-Ribiere** and **Hager-Zhang**. Optim's ConjugateGradient uses the **Hager-Zhang** formula with its line search, which guarantees that every d_k is a descent direction, so the method never needs a restart to recover from an uphill step.

## The Rate
On a strongly convex function the error shrinks by about (sqrt(kappa) - 1) / (sqrt(kappa) + 1) per iteration, where kappa is the condition number. The square root is the gain over gradient descent: with kappa = 10,000, gradient descent needs about fifty times as many iterations.

## The Cost
One gradient and a line search per iteration, and memory for a few vectors of length n: the same as gradient descent. This is why conjugate gradient is the method of choice for very large problems where a Hessian, or even the BFGS approximation of it, would not fit in memory.

## In Optim.jl

    optimize(f, x0, ConjugateGradient(linesearch = HagerZhang()); autodiff = :forward)

## See Also
- [Gradient Descent](gradient-descent.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
