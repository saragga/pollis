# Policy Gradient Methods: PPO

**PPO**, Proximal Policy Optimisation, by [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a), reuses each batch of experience for several epochs of gradient ascent on a surrogate objective whose clipping removes the incentive to move the policy far from the one that collected the data.

## Why not reuse the plain objective

[Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) write the standard policy gradient estimator as the gradient of

L^PG(θ) = Êₜ[log π_θ(aₜ|sₜ) Âₜ]

with Âₜ an estimator of the advantage at step t and Êₜ the average over a finite batch. Performing several steps of optimisation on this loss with the same trajectories is appealing, but not well justified, and empirically it often leads to destructively large policy updates.

Their abstract sets PPO against this: standard policy gradient methods perform one gradient update per data sample, while the PPO objective enables multiple epochs of minibatch updates.

## The clipped surrogate

With the probability ratio rₜ(θ) = π_θ(aₜ|sₜ) / π_θold(aₜ|sₜ), so that rₜ(θold) = 1, [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) propose

L^CLIP(θ) = Êₜ[min(rₜ(θ) Âₜ, clip(rₜ(θ), 1 − ε, 1 + ε) Âₜ)]

The clipped term removes the incentive for moving rₜ outside [1 − ε, 1 + ε], and the minimum makes the objective a lower bound, a pessimistic bound, on the unclipped one: the change in the ratio is ignored when it would make the objective improve, and included when it makes it worse. To first order around θold, L^CLIP equals the unclipped objective.

## The choice of epsilon

[Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) suggest ε = 0.2 as an example value. In their comparison on seven simulated robotics tasks, with scores normalised so that a random policy scores 0 and the best result 1, clipping with ε = 0.1, 0.2 and 0.3 reached average normalised scores of 0.76, 0.82 and 0.70, against −0.39 without clipping or penalty.

They also tried a penalty on the KL divergence, with a fixed or adaptive coefficient, as an alternative to clipping, and found that it performed worse than the clipped surrogate.

## Relation to TRPO

[Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) describe the methods as having some of the benefits of trust region policy optimisation, TRPO, while being much simpler to implement, more general, and of better sample complexity, empirically. Their aim is an algorithm with the data efficiency and reliable performance of TRPO that uses only first-order optimisation.

In the panel, PPO and TRPO start from the same batch, critic and advantages; PPO takes **Epochs** Adam steps, TRPO a single constrained step.

## In the panel

`update_ppo!` stores the probability of each action under the policy that collected the batch, then runs **Epochs** epochs over the whole batch. In each epoch it adds the gradient of rₜ Âₜ for every step whose ratio is not clipped, a step being clipped when Âₜ > 0 and rₜ > 1 + ε, or Âₜ < 0 and rₜ < 1 − ε, averages over the batch and takes one Adam step, by [Kingma and Ba (2015)](#ref-KB2015a), with **Learning Rate**.

[Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) optimise the surrogate with minibatch stochastic gradient descent, or usually Adam for better performance, for K epochs. The panel uses the full batch in each epoch, and reports the gradient norm of the first epoch in **Gradient Norm**.

## Inputs

| Input | Role | Default |
|---|---|---|
| **Clip (epsilon)** | Half-width of the band [1 − ε, 1 + ε] for the ratio | 0.2 |
| **Epochs** | Gradient epochs on each batch | 10 |
| **Learning Rate** | Adam step size | 0.05 |

The panel's decision table suggests PPO for some of the benefits of TRPO at a simpler implementation, as [Schulman, Wolski, Dhariwal, Radford and Klimov (2017)](#ref-SWDRK2017a) describe it, reusing each batch for several epochs. **KL Divergence** shows how far each update moves the policy, and **REINFORCE vs PPO vs TRPO** compares the learning curves of the three algorithms on the same seed.

## References

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-SWDRK2017a"></a>Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal Policy Optimization Algorithms. [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [REINFORCE](reinforce.md) · [TRPO](trpo.md)
