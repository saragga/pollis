# Policy Gradient Methods: REINFORCE

**REINFORCE**, the Monte Carlo policy gradient of [Williams (1992)](#ref-Wil1992a), moves the policy parameters along the gradient of the log-probability of each action taken, weighted by how much better than expected the return that followed it was.

## The REINFORCE class

[Williams (1992)](#ref-Wil1992a) introduces REINFORCE algorithms as a class of associative reinforcement learning algorithms for networks of stochastic units, which adjust weights in a direction that lies along the gradient of expected reinforcement, without explicitly computing gradient estimates. The name is an acronym for "REward Increment = Nonnegative Factor × Offset Reinforcement × Characteristic Eligibility", which describes the form of the update:

Δwᵢⱼ = αᵢⱼ (r − bᵢⱼ) eᵢⱼ

with a learning rate αᵢⱼ, a reinforcement baseline bᵢⱼ and the characteristic eligibility eᵢⱼ = ∂ ln gᵢ / ∂wᵢⱼ. For any such algorithm, (r − bᵢⱼ) ∂ ln gᵢ / ∂wᵢⱼ is an unbiased estimate of the gradient of expected reinforcement.

## The update in episodic form

[Sutton and Barto (2018)](#ref-SB2018a) derive REINFORCE from the policy gradient theorem. Since the expected return from a state and action is their action value, the return Gₜ can stand in for it, and the update becomes

θₜ₊₁ = θₜ + α Gₜ ∇ln π(Aₜ|Sₜ, θₜ)

The vector ∇ln π, which they call the eligibility vector, is the direction in parameter space that most increases the probability of repeating Aₜ in Sₜ. The update moves along it in proportion to the return, and the division by the action probability implicit in ∇ln π keeps frequently selected actions from winning out only because they are updated more often.

The text treats the undiscounted case; the boxed algorithm, written for the general discounted case, includes a factor γᵗ:

θ ← θ + α γᵗ G ∇ln π(Aₜ|Sₜ, θ)

and REINFORCE with baseline replaces G by G − v̂(Sₜ, w). Because REINFORCE uses the complete return up to the end of the episode, it is a Monte Carlo method, well defined for episodic tasks with updates made after each episode is completed.

## Variance and the baseline

[Sutton and Barto (2018)](#ref-SB2018a) write that REINFORCE, as a stochastic gradient method, has good theoretical convergence properties: the expected update over an episode points in the direction of the performance gradient. As a Monte Carlo method, however, it may have high variance and so learn slowly.

Subtracting a baseline b(s) from the return leaves the expected update unchanged, as long as the baseline does not vary with the action, but can have a large effect on its variance. One natural choice is an estimate of the state value, v̂(Sₜ, w). [Williams (1992)](#ref-Wil1992a) notes that a reinforcement baseline estimated from past experience is consistent with the REINFORCE formulation, and that it is generally believed to give better performance.

## In the panel

The policy is a softmax of linear action preferences, π(·|s) = softmax(W [s; 1]), the parameterisation that [Sutton and Barto (2018)](#ref-SB2018a) call soft-max in action preferences; the code computes the eligibility vector as (𝟙ₐ − π(·|s)) [s; 1]ᵀ. W starts at zero, a uniform policy.

Each update collects **Episodes per Update** episodes, fits the critic V(s) = φ(s)ᵀw by least squares on the discounted returns of the batch, takes the advantage Gₜ − V(Sₜ), normalised to mean 0 and sd 1 over the batch, and averages γᵗ × advantage × ∇log π over all steps, with t = 0 at the first step of each episode. The resulting gradient is followed by one step of Adam, by [Kingma and Ba (2015)](#ref-KB2015a), with **Learning Rate**.

## Inputs and settings

| Input | Role |
|---|---|
| **Policy Updates** | Number of batches and updates, 60 by default |
| **Episodes per Update** | Episodes per batch, 10 |
| **Discount (gamma)** | Discount of the returns Gₜ, 0.99 |
| **Learning Rate** | Adam step size, 0.05 |
| **Max Episode Length** | Cap on an episode, 500 steps |

The panel's decision table recommends **REINFORCE** as the simplest policy gradient, for teaching, small problems and as a baseline. **KL Divergence** shows how far each update moves the policy, which REINFORCE does not control.

## Reading the result

**Learning Curve** shows the mean return of each batch; with the default settings the ceiling is 500. **Batch Size Study** compares 2, 5, 10 and 20 episodes per update at the same total number of episodes, and so many small batches against few large ones.

[Sutton and Barto (2018)](#ref-SB2018a) illustrate on a small gridworld that adding a baseline to REINFORCE can make it learn much faster, and that the step size of the policy parameters is harder to set than the step size of the value estimates.

## References

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-Wil1992a"></a>Williams, R. J. (1992). Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning. *Machine Learning* 8(3-4), 229-256. [doi:10.1007/BF00992696](https://doi.org/10.1007/BF00992696)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PPO](ppo.md) · [TRPO](trpo.md)
