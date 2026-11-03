# POMDP

A partially observable Markov decision process hides the state and offers noisy observations. **POMDP** works on the Tiger problem, small enough to draw, with QMDP as the default solver and SARSOP and POMCP for comparison.

## What is the Tiger problem?

A tiger is behind one of two doors, and treasure is behind the other. [Kaelbling, Littman and Cassandra (1998)](#ref-KLC1998a) use it as a running example, as it isolates the choice between acting now and gathering information first.

| Element | In the code |
|---|---|
| States | `:tiger_left`, `:tiger_right` |
| Actions | `:open_left`, `:open_right`, `:listen` |
| Observations | `:hear_left`, `:hear_right`, correct with chance **Listening Accuracy** |
| Rewards | −1 to listen, −100 for the tiger's door, +10 for the other |
| After a door opens | The tiger is reshuffled, and the problem continues |

Listening never reveals the state for certain, so the agent has to decide how much evidence is enough.

## How does the belief get updated?

The agent holds b, a probability for each state, and updates by Bayes' rule after action a and observation o:

b'(s') ∝ P(o | s', a) · sum over s of P(s' | s, a) b(s)

`DiscreteUpdater(m)` does this, and [Kaelbling, Littman and Cassandra (1998)](#ref-KLC1998a) show that the belief summarises everything needed from the past. When listening, the state does not change, so with p as the probability of the left door and a as **Listening Accuracy**, a report of `hear_left` gives p' = a p / (a p + (1 − a)(1 − p)). Opening a door gives an uninformative observation and the belief returns to uniform. **Belief Update / Bellman Residual** shows this working through five reports.

## What is the shape of the value function?

The value of a belief is the highest of a set of linear functions of b, each given by an alpha vector, so it is piecewise linear and convex. [Smallwood and Sondik (1973)](#ref-SS1973a) established this for the finite-horizon problem.

Convexity has a clear meaning. A certain belief at either end is worth more than an uncertain one in the middle, because knowing the state lets the agent act well. Each alpha vector corresponds to a plan, and the best plan differs with the belief. **Alpha Vectors / Q-Values** draws the lines for the solver in use, and **Value Function** plots their upper envelope across the belief.

## What does QMDP assume?

QMDP solves the underlying fully observed problem to get Q(s, a), then uses one alpha vector per action: Q(b, a) = sum over s of b(s) Q(s, a). The method was introduced by [Littman, Cassandra and Kaelbling (1995)](#ref-LCK1995a).

The assumption is that all uncertainty disappears after one step. The value is therefore an upper bound on the true optimum, as [Hauskrecht (2000)](#ref-Hau2000a) shows among other approximations. The policy gives no credit to gathering information as such. It can still choose `:listen`, because at an uncertain belief a −100 risk is worse than a small delay, but it does so without weighing what the report would reveal. The `solve` call takes `max_iterations=1000`, and it is quick.

## How do point-based methods improve on that?

Exact methods handle every belief, and the number of alpha vectors can grow very fast. [Pineau, Gordon and Thrun (2003)](#ref-PGT2003a) introduced point-based value iteration, which computes backups only at a chosen set of beliefs and so gives an anytime algorithm.

SARSOP, by [Kurniawati, Hsu and Lee (2008)](#ref-KHL2008a), concentrates those points on beliefs that are reachable under optimal play. **Solver vs Baseline** runs `SARSOPSolver(precision=1e-3, verbose=false)`, and reports `actions` at four beliefs, `value_at_uniform` and `simulated_return`. The value from SARSOP is computed from a policy that can really be followed, unlike the QMDP bound. The same `alphapairs` idea applies to it, and it will usually have more lines than QMDP.

## How does POMCP plan online?

POMCP, from [Silver and Veness (2010)](#ref-SV2010a), combines a Monte Carlo belief update with tree search from the current belief. Only a black-box simulator of the problem is needed, without explicit probability distributions.

**Online Planning / Reward Rate** runs `POMCPSolver(tree_queries=2000, c=10.0)` at beliefs of 0.5, 0.85 and 0.97, next to the choice of QMDP, and **Global vs Online Planning** compares average returns over 30 steps. `c` is the exploration constant, on the scale of the returns. With few `tree_queries`, the action at a given belief varies between calls, and raising the number reduces that variation.

## Reading a POMDP result

`action_at_uniform_belief` should be `:listen` for reasonable parameters, and `action_when_90pct_left` shows whether the evidence is then enough to open a door. `value_at_uniform_belief` is QMDP's value, not a return you can expect to achieve.

In **Monte Carlo Return**, `mean_return` measures what the policy achieves, and `value_function_prediction` is the QMDP figure. The gap is expected, and its size shows how far the assumption of QMDP lies from the problem. Comparing **Listening Accuracy** values shows how the worth of information changes: at 1, one report settles the matter, and at 0.5, reports carry nothing at all.

## References

<a id="ref-Hau2000a"></a>Hauskrecht, M. (2000). Value-Function Approximations for Partially Observable Markov Decision Processes. *Journal of Artificial Intelligence Research* 13, 33-94. [doi:10.1613/jair.678](https://doi.org/10.1613/jair.678)

<a id="ref-KLC1998a"></a>Kaelbling, L. P., Littman, M. L., & Cassandra, A. R. (1998). Planning and Acting in Partially Observable Stochastic Domains. *Artificial Intelligence* 101(1-2), 99-134. [doi:10.1016/S0004-3702(98)00023-X](https://doi.org/10.1016/S0004-3702(98)00023-X)

<a id="ref-KHL2008a"></a>Kurniawati, H., Hsu, D., & Lee, W. S. (2008). SARSOP: Efficient Point-Based POMDP Planning by Approximating Optimally Reachable Belief Spaces. In *Robotics: Science and Systems IV*. [doi:10.15607/RSS.2008.IV.009](https://doi.org/10.15607/RSS.2008.IV.009)

<a id="ref-LCK1995a"></a>Littman, M. L., Cassandra, A. R., & Kaelbling, L. P. (1995). Learning Policies for Partially Observable Environments: Scaling Up. In *Machine Learning Proceedings 1995*, 362-370. [doi:10.1016/B978-1-55860-377-6.50052-9](https://doi.org/10.1016/B978-1-55860-377-6.50052-9)

<a id="ref-PGT2003a"></a>Pineau, J., Gordon, G., & Thrun, S. (2003). Point-Based Value Iteration: An Anytime Algorithm for POMDPs. In *IJCAI*. [Online](https://www.ijcai.org/Proceedings/03/Papers/147.pdf)

<a id="ref-SV2010a"></a>Silver, D., & Veness, J. (2010). Monte-Carlo Planning in Large POMDPs. In *Advances in Neural Information Processing Systems 23*. [Online](https://papers.nips.cc/paper_files/paper/2010/hash/edfbe1afcf9246bb0d40eb4d8027d90f-Abstract.html)

<a id="ref-SS1973a"></a>Smallwood, R. D., & Sondik, E. J. (1973). The Optimal Control of Partially Observable Markov Processes over a Finite Horizon. *Operations Research* 21(5), 1071-1088. [doi:10.1287/opre.21.5.1071](https://doi.org/10.1287/opre.21.5.1071)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MDP](mdp.md) · [Semi-MDP](smdp.md)
