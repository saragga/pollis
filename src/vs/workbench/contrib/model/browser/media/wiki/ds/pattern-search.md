# Pattern Search

**Pattern search**, in its simplest form **compass search** (Hooke and Jeeves, 1961; generalised pattern search, Torczon, 1997), polls the points at distance h from the incumbent x along the 2n coordinate directions +/- e_i.

## The Iteration
- **Poll**: evaluate f(x + h d) for each compass direction d in turn. The panel's poll is **opportunistic**: it stops at the first point that improves on f(x), which becomes the new incumbent.
- **Success**: keep h and poll again from the new point.
- **Failure**: if no poll point improves, halve h.
The method stops when h falls below 1e-8 or the iterations reach **Max Iterations**. The **Initial Step** sets the first h.

## Convergence
For continuously differentiable f, the compass directions positively span the space: whatever the gradient, one of them makes an acute angle with -gradient, and is a descent direction. When a poll fails at a small h, the gradient must be small, of order h. As h goes to zero along failed polls, the incumbent converges to a **stationary point**.

## On Non-Smooth Problems
At a kink the argument fails: descent directions may lie strictly between the compass directions, and the method can stop at a non-stationary point. The default problem's kinks lie along the coordinate axes, x1 = 1 and x2 = -0.5, so the compass directions happen to suit it; a rotated version would not. MADS was designed to fix this.

## Cost
Up to 2n evaluations per iteration; with opportunistic polling, fewer after a success. The step halving makes the convergence linear in the number of failed polls, so each digit of accuracy costs a few more iterations.

## In This Panel
The panel's pattern search is written out in the generated code, with the 2n compass directions in a fixed order.

## See Also
- [Generating Set Search](generating-set-search.md) · [MADS](mads.md) · [Decision Guide](decision-guide.md)
