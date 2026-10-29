# L-BFGS

**L-BFGS** (limited-memory BFGS; Liu and Nocedal, 1989) applies the BFGS idea without ever forming a matrix, so it scales to problems with very many variables.

## Memory
L-BFGS keeps only the last **m** step and gradient-change pairs (s, y). The inverse-Hessian approximation they imply, m BFGS updates applied to a starting matrix, is never stored: its product with the gradient is computed by the **two-loop recursion**, in O(mn) operations. Memory is 2mn numbers instead of n^2. Optim's default is m = 10; the panel's **Memory m** sets it.

## The Starting Matrix
Each recursion starts from a scaled identity, gamma I with gamma = s'y / y'y from the latest pair (Nocedal and Wright, equation 7.20). This scale estimates the curvature along the latest step, and is the main reason L-BFGS takes sensible step lengths from the first iterations.

## Choosing m
- **Small m** (3 to 5): the least memory and work per iteration, and a cruder approximation, so more iterations.
- **Moderate m** (5 to 20): the usual choice; the gains beyond about 20 are small, since old pairs describe curvature at points the iterates have left.
- **Large m** approaches BFGS in iterations without its memory, but the recursion's work grows with m.
**Compare Methods** runs m = 3 and m = 20 beside BFGS.

## Convergence
L-BFGS converges **linearly** in theory, but in practice it is usually close to BFGS in iterations on smooth problems, and much cheaper per iteration when n is large. On badly conditioned problems a preconditioner helps; Optim accepts one.

## Bounds
Optim's Fminbox wraps L-BFGS (or another method) with a barrier for box constraints. L-BFGS-B, a different algorithm that handles bounds by projection, is in other packages.

## See Also
- [BFGS](bfgs.md) · [Overview](overview.md) · [Decision Guide](decision-guide.md)
