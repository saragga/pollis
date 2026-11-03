# Policy Gradient Methods: TRPO

**TRPO**, Trust Region Policy Optimisation, by [Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a), maximises a surrogate objective subject to a limit on the mean KL divergence between the old and the new policy, solving the step approximately with conjugate gradients and a line search.

## From theory to a practical algorithm

[Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) describe a method for optimising control policies with guaranteed monotonic improvement. By making several approximations to the theoretically justified scheme, they develop a practical algorithm, TRPO, and report that, despite its approximations that deviate from the theory, TRPO tends to give monotonic improvement, with little tuning of hyperparameters.

The theory justifies optimising a surrogate loss with a penalty on the KL divergence, but the penalty coefficient it recommends leads to very small steps, and a robust coefficient is hard to choose; TRPO uses a hard constraint, with a bound δ on the divergence, instead.

## The trust-region problem

[Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) restate the problem that TRPO solves at each update:

maximise over θ: Êₜ[π_θ(aₜ|sₜ) / π_θold(aₜ|sₜ) · Âₜ]
subject to: Êₜ[KL[π_θold(·|sₜ), π_θ(·|sₜ)]] ≤ δ

The constraint of the theory bounds the KL divergence at every state, which [Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) find impractical because of the number of constraints; they use a heuristic approximation that considers the average divergence over states. In their experiments, the maximum-KL version learned somewhat slower, and the average constraint had a similar effect.

## Conjugate gradient and line search

The problem can be solved approximately with the conjugate gradient algorithm, after a linear approximation of the objective and a quadratic approximation of the constraint, as [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) summarise. [Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) use the conjugate gradient algorithm followed by a line search, altogether only slightly more expensive than computing the gradient itself.

They build the Fisher information matrix by analytically computing the Hessian of the KL divergence, an estimator that integrates over the actions at each state and does not depend on the action sampled. [Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) also show that the natural policy gradient is a special case of their update, with a linear approximation to the objective and a quadratic approximation to the KL constraint, but with the step size as a fixed parameter rather than a constraint enforced at each update.

## In the panel

`update_trpo!` computes the policy gradient g from the batch, then solves F x = g by 10 iterations of conjugate gradient, where F is the Fisher matrix of the softmax policy averaged over the states of the batch, plus **Damping** times the identity. The step is scaled to

step = √(2δ / xᵀF x) · x

with δ = **Max KL**, and a backtracking line search tries the full step and then halves it, up to ten times, accepting the first one whose mean KL divergence stays within δ and whose surrogate objective improves. If none qualifies, the policy is left unchanged. TRPO does not use **Learning Rate**: the size of the step comes from the constraint.

## Inputs

| Input | Role | Default |
|---|---|---|
| **Max KL** | Largest mean KL divergence between the old and new policy for a step | 0.01 |
| **Damping** | Added to the Fisher matrix in the conjugate-gradient solve, for numerical stability | 0.1 |

[Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) used δ = 0.01 for all their experiments, the panel's default for **Max KL**. **KL Divergence** plots the divergence of each update with a dashed line at **Max KL**.

## When to use it

The panel's decision table recommends **TRPO** when the policy should improve steadily, with little tuning of hyperparameters, as the authors report of it. [Schulman, Levine, Moritz, Jordan and Abbeel (2015)](#ref-SLMJA2015a) found, on simulated locomotion tasks, that constraining the KL divergence was a more robust way to choose step sizes, and made faster and more consistent progress, than a fixed penalty.

**REINFORCE vs PPO vs TRPO** shows the three learning curves on the same seed, and **Seed Stability** the learning curves of the selected algorithm for five seeds.

## References

<a id="ref-SLMJA2015a"></a>Schulman, J., Levine, S., Moritz, P., Jordan, M., & Abbeel, P. (2015). Trust Region Policy Optimization. *ICML*. [proceedings.mlr.press](https://proceedings.mlr.press/v37/schulman15.html)

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [REINFORCE](reinforce.md) · [PPO](ppo.md)
