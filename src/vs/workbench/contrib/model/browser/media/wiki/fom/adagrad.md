# AdaGrad

**AdaGrad** (Duchi, Hazan and Singer, 2011) gives each coordinate its own learning rate, from the history of its gradients. It accumulates the squared gradients, G = G + g^2, coordinate by coordinate, and steps x_new = x - lr * g / (sqrt(G) + eps).

## Why It Helps
A coordinate with large gradients gets small steps, and one with small or rare gradients gets large ones. On problems with **sparse features**, where some parameters receive a gradient only occasionally, those parameters still learn at a useful speed. The per-coordinate scaling also removes much of the sensitivity to how the variables are scaled.

## Its Weakness
G only grows, so the effective learning rate **shrinks** like 1 / sqrt(t) for every coordinate. On convex problems that is exactly the decreasing step that guarantees convergence; on long non-convex training it stops progress too early, before a good region is reached. RMSProp and Adam were designed to fix this by forgetting old gradients.

## Learning Rate
Because each step is the gradient divided by its own accumulated scale, AdaGrad's first steps are about lr per coordinate, and later ones smaller. Optimisers.jl uses 0.1 as its default; the panel's 0.01 is conservative.

## See Also
- [RMSProp](rmsprop.md) · [Adam](adam.md) · [Decision Guide](decision-guide.md)
