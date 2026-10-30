# Gradient Free

Gradient-free methods use **values of f only**. They are the choice when f has no useful derivative: non-smooth, noisy, piecewise, or computed by a black box such as a simulation.

## Nelder-Mead
The **Nelder-Mead** simplex method (Nelder and Mead, 1965) keeps n + 1 points. At each step it replaces the worst by its **reflection** through the centroid of the others, **expands** further if that is much better, **contracts** if it is not, and **shrinks** the whole simplex towards the best point when nothing works. It needs one or two evaluations per step and no derivatives. Optim stops it when the standard deviation of f over the simplex falls below the tolerance. It is reliable in a few dimensions and slows sharply beyond about ten; it has no convergence guarantee in general, and can stall on a non-stationary point.

## Simulated Annealing
**Simulated Annealing** proposes random moves and accepts a worse point with a probability that falls as a **temperature** is lowered, so it can climb out of a local basin early and settle later. It runs to the iteration limit, needs many evaluations, and is best seen as a way to find a good region, to be refined by a local method.

## Particle Swarm
**Particle Swarm** moves a population of points, each pulled towards its own best position and the best of the swarm. It explores more widely than Nelder-Mead and is better at several minima, at the cost of many evaluations; it too runs to the iteration limit.

## Reading the Results
None of these methods gives a gradient-based stopping test, so judge them by the **Convergence Trace** and, if f is smooth enough, by the gradient norm the **Convergence Check** reports. Refining their result with BFGS is a common pattern.

## See Also
- [Gradient Required](gradient-required.md) · [Hessian Required](hessian-required.md) · [Decision Guide](decision-guide.md)
