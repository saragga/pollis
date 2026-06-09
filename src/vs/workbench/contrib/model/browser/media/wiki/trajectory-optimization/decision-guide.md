# Decision Guide: Which Trajectory Method?

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| Direct (Collocation) | Long horizons, first-order | Robust NLP solvers, handles inequalities | Grid resolution sensitivity |
| Indirect (iLQR) | Quick local refinement | Fast convergence, low computation | Limited to local optima |
| DDP | Highly nonlinear systems | Second-order accuracy, fast convergence | Requires Hessian computation |
| ALTRO | Constrained problems | State-of-the-art handling of constraints | More complex implementation |

Choose based on horizon length, nonlinearity, constraint type, and computation budget.
