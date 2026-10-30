# Chambolle-Pock

The **Chambolle-Pock** algorithm (Chambolle and Pock, 2011), also called the **primal-dual hybrid gradient** method, solves problems of the form min g(x) + h(K x), with g and h convex and K linear, through the saddle-point problem min over x, max over y of g(x) + y'(K x) - h*(y), where h* is the convex conjugate of h.

## The Iteration
Each iteration takes:
1. a **dual step**: y = prox of sigma h* at y + sigma K xbar;
2. a **primal step**: x_new = prox of tau g at x - tau K' y;
3. an **extrapolation**: xbar = 2 x_new - x.
Only products with K and K' and the two proximal maps are needed; no linear system is solved.

## In This Panel
The problem is split as g = lambda penalty, K = A, and h(z) = 0.5 ||z - b||^2, whose conjugate has the prox (y + sigma z - sigma b) / (1 + sigma) in closed form. The steps are tau = **Step Size** and sigma = 0.99 / (tau L), with L = ||A||^2, so that **tau sigma ||A||^2 < 1**, the condition for convergence.

## Convergence
The primal-dual gap decreases at rate **O(1 / k)** for the ergodic averages; with strong convexity, accelerated variants reach O(1 / k^2) or linear rates. The iterates are not monotone in F, which the **Descent Check** shows. The balance between tau and sigma changes the speed, and **Step Size Sensitivity** explores it.

## Where It Shines
Chambolle-Pock was developed for **imaging**: total-variation denoising, where K is a discrete gradient and h a norm, deblurring and tomography, where K is a large operator applied by fast transforms. Its iterations are cheap and parallel.

## Dual Variables
The final y estimates the dual solution, here the scaled residual A x - b, which the panel keeps in res.dual.

## See Also
- [Douglas-Rachford](douglas-rachford.md) · [Proximal Point](proximal-point.md) · [Decision Guide](decision-guide.md)
