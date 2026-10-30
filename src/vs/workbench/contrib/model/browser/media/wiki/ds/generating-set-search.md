# Generating Set Search

**Generating set search** (GSS; Kolda, Lewis and Torczon, 2003) is the general framework of which compass search is one instance. It polls along a **positive spanning set**: a set of directions such that every vector is a non-negative combination of them, which guarantees that one direction is a descent direction whenever the gradient is not zero.

## The Minimal Set
A positive spanning set needs at least n + 1 directions. The panel uses the **minimal** set e_1, ..., e_n and -(1, ..., 1) / sqrt(n): n + 1 polls per iteration instead of compass search's 2n, which saves evaluations, especially as n grows. The cost is a set less evenly spread, whose worst-case angle to the descent direction is larger.

## Sufficient Decrease
A trial point is accepted only if it improves by a **sufficient** amount, f(y) < f(x) - 1e-4 h^2, rather than by any amount. This forcing function rules out tiny improvements that would let the method creep, and gives convergence without requiring the trial points to lie on a mesh.

## Step Expansion
After a successful poll, the step **doubles**; after a failed one, it halves. Expansion lets the method cover long distances quickly when far from the solution, with a growing stride, and the halving brings it back when it overshoots.

## Convergence
For continuously differentiable f, GSS with sufficient decrease converges to a stationary point, with the step size as an estimate of the gradient's size at failed polls. For non-smooth f, the same limitations as compass search apply.

## In This Panel
The panel's GSS is written out in the generated code: opportunistic polling, the minimal spanning set, sufficient decrease 1e-4 h^2, doubling and halving of the step from the **Initial Step**, and a stop when h falls below 1e-8.

## See Also
- [Pattern Search](pattern-search.md) · [MADS](mads.md) · [Decision Guide](decision-guide.md)
