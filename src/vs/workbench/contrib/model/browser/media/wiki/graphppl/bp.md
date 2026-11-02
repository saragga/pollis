# Belief Propagation

Belief propagation computes marginals by passing local messages. On a tree of conjugate factors, a single sweep gives the exact posterior, and the Gaussian mean model shows that clearly.

## How Sum-Product Messages Work

[Pearl (1982)](#ref-Pea1982a) described inference as a distributed exchange of messages on tree-structured networks. In the factor-graph form, a variable sends the product of the messages it has received from its other neighbours. A factor sends its own function, multiplied by incoming messages, and sums or integrates out all variables but one. A marginal is the product of all messages arriving at a variable. Each message depends only on the part of the tree behind it, so that nothing is counted twice.

## What the Default Model Gives by Hand

With a Normal prior of variance 10 and n observations of known variance s2, each observation sends one Gaussian message to mu, and precisions add:

- precision = 1 / 10 + n / s2
- mean = (Σ y / s2) / precision

With n = 30 and s2 = 1, the precision is 30.1 and the variance 0.0332. The prior barely matters, as it shrinks the sample mean by a factor of only 30 / 30.1. The code computes this form as `m_exact` and `v_exact`, and it prints both for comparison with `q_mu`.

## Why the Free Energy Equals the Evidence on a Tree

On a tree, the Bethe free energy equals −log p(y) exactly, as [Yedidia, Freeman and Weiss (2005)](#ref-YFW2005a) discuss. The **Free Energy** action checks that, using the marginal distribution of y. After integrating out mu, y is multivariate normal, with covariance s2 I + 10 × 1 1ᵀ, and the code evaluates its log density directly. A match shows the message rules at work, and in turn gives you log evidence for model comparison.

## Why One Sweep Is Enough

A tree has an order in which each message depends only on messages that have been sent earlier. One pass from the leaves and one back complete the work, so that **Convergence Check** and **Iteration Sensitivity** have nothing to report on this tab. Longer chains work the same way: on a linear-Gaussian state-space model, the sweeps reproduce the Kalman filter and smoother, as [Loeliger, Dauwels, Hu, Korl, Ping and Kschischang (2007)](#ref-LDHKP...2007a) show.

## What Happens with Loops

If the graph has cycles, messages circle back, and evidence is counted repeatedly. Running the rules anyway is loopy belief propagation. It can work well, as in error-correcting codes, but it has no general guarantee of convergence or accuracy. For Gaussian models, [Weiss and Freeman (2001)](#ref-WF2001a) show that the means are right if the method converges, whereas the variances are generally wrong. In `RxInfer.jl`, a loopy graph needs `@initialization` to start the messages, and more than one iteration.

## When Conjugacy Fails

Exact closed-form messages exist only for special pairs of factors, such as Gaussian with Gaussian. A Gaussian prior on mu combined with an unknown precision breaks that, because the message over the pair has no simple form. The other two tabs handle that: **Variational Message Passing** by factorising the posterior, and **Expectation Propagation** by projecting onto a Gaussian. Exact inference on a general graph is also possible by clustering nodes, at a cost exponential in the size of the largest cluster, as [Koller and Friedman (2009)](#ref-KF2009a) explain.

## References

<a id="ref-KF2009a"></a>Koller, D. and Friedman, N. (2009). *Probabilistic Graphical Models: Principles and Techniques*. MIT Press. [mitpress.mit.edu](https://mitpress.mit.edu/9780262013192/probabilistic-graphical-models/)

<a id="ref-LDHKP...2007a"></a>Loeliger, H.-A., Dauwels, J., Hu, J., Korl, S., Ping, L. and Kschischang, F. R. (2007). The factor graph approach to model-based signal processing. *Proceedings of the IEEE* 95(6), 1295–1322. [doi:10.1109/JPROC.2007.896497](https://doi.org/10.1109/JPROC.2007.896497)

<a id="ref-Pea1982a"></a>Pearl, J. (1982). Reverend Bayes on inference engines: a distributed hierarchical approach. In *Proceedings of the National Conference on Artificial Intelligence (AAAI)*.

<a id="ref-WF2001a"></a>Weiss, Y. and Freeman, W. T. (2001). Correctness of belief propagation in Gaussian graphical models of arbitrary topology. *Neural Computation* 13(10), 2173–2200. [doi:10.1162/089976601750541769](https://doi.org/10.1162/089976601750541769)

<a id="ref-YFW2005a"></a>Yedidia, J. S., Freeman, W. T. and Weiss, Y. (2005). Constructing free-energy approximations and generalized belief propagation algorithms. *IEEE Transactions on Information Theory* 51(7), 2282–2312. [doi:10.1109/TIT.2005.850085](https://doi.org/10.1109/TIT.2005.850085)

## See Also

- [Factsheet](factsheet.md) · [Variational Message Passing](vmp.md) · [Expectation Propagation](ep.md) · [Diagnostics](diagnostics.md)
