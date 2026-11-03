# Mathematical Programming with Equilibrium Constraints: Overview

A mathematical program with equilibrium constraints (MPEC) has one decision-maker who optimises while an equilibrium responds to the decision. [Luo, Pang and Ralph (1996)](#ref-LPR1996a) present MPECs as extensions of bilevel optimisation, with source problems in engineering design, economics and game equilibria, and transportation planning.

## What is an equilibrium constraint?

An equilibrium constraint ties a vector y to the decision x through a condition that y must satisfy, rather than a quantity that y must optimise. The panel writes it as a complementarity condition: y ≥ 0, f(x, y) ≥ 0, and y_i f_i(x, y) = 0 for every component.

Each component is then in one of two states. Either y_i is positive and f_i is zero, or y_i is zero and f_i may be positive. In a market, y_i is a quantity and f_i a marginal condition: a firm produces only where marginal revenue meets marginal cost.

[Ferris and Pang (1997)](#ref-FP1997a) document applications of nonlinear complementarity problems in engineering and equilibrium modelling. Variational inequalities, the subject of [Facchinei and Pang (2003)](#ref-FP2003a) with complementarity problems, give the more general form of an equilibrium.

## Leader and followers

The default example is a market with one leader and two followers. The leader chooses its output first. The followers, seeing it, choose theirs as Cournot competitors, each producing to maximise its own profit given the others.

The leader's problem is an MPEC: its profit depends on the followers' outputs, which are fixed by their equilibrium for each output of the leader. [Sherali, Soyster and Murphy (1983)](#ref-SSM1983a) study this market, called a Stackelberg-Nash-Cournot equilibrium, with one leader and N followers, its existence and uniqueness, and an algorithm for it.

The same structure appears whenever a planner anticipates a response: the panel's examples are a regulator facing traffic user equilibrium, a grid operator facing market-clearing prices, and a network designer facing Wardrop flow conditions.

## Why is the problem hard?

An MPEC looks like a nonlinear program, but the complementarity constraint takes away the regularity that nonlinear programming relies on. [Hu and Ralph (2004)](#ref-HR2004a) note that the Mangasarian-Fromovitz constraint qualification fails for these problems, so that much of nonlinear programming theory cannot be applied directly, and algorithms that linearise the constraints may behave unstably.

A second difficulty is combinatorial. Every pair can sit on the branch y_i = 0 or on the branch f_i = 0, so the feasible set is a union of many pieces, and the same authors point out that it can have exponentially many branches.

## Three ways round the difficulty

| Approach | Idea |
|---|---|
| **Regularisation** | Relax y_i f_i = 0 to y_i f_i ≤ t and drive t to zero |
| **Penalty** | Keep y ≥ 0 and f ≥ 0, and charge mu y'f in the objective |
| **Implicit (PATH)** | Solve the equilibrium for each x, and optimise over x alone |

The first two replace the MPEC with a sequence of ordinary nonlinear programs. [Scholtes (2001)](#ref-Sch2001a) studies the convergence of the relaxation, and [Hu and Ralph (2004)](#ref-HR2004a) show that a penalty framework shares similar convergence properties. The third treats y as a function y*(x); [Luo, Pang and Ralph (1996)](#ref-LPR1996a) describe an implicit programming algorithm among the methods of their book.

## How the panel is organised

The panel solves one MPEC with the method chosen, and the actions examine the answer from several sides.

1. **Implicit Objective** and **Equilibrium Response** show the problem as a function of x.
2. **Complementarity Check** and **Stationarity Check** test the solution.
3. **Solution Path** follows the sequence of subproblems.
4. **Method Comparison** sets the three methods side by side.
5. **Relaxed Bound**, **Value of Commitment** and **Parametric MPEC** read the answer economically.

The [MPEC](mpec.md) page gives the formulation and the methods in detail.

## References

<a id="ref-FP2003a"></a>Facchinei, F., & Pang, J.-S. (2003). *Finite-Dimensional Variational Inequalities and Complementarity Problems*. Springer.

<a id="ref-FP1997a"></a>Ferris, M. C., & Pang, J.-S. (1997). Engineering and Economic Applications of Complementarity Problems. *SIAM Review* 39(4), 669-713. [doi:10.1137/S0036144595285963](https://doi.org/10.1137/S0036144595285963)

<a id="ref-HR2004a"></a>Hu, X. M., & Ralph, D. (2004). Convergence of a Penalty Method for Mathematical Programming with Complementarity Constraints. *Journal of Optimization Theory and Applications* 123(2), 365-390. [doi:10.1007/s10957-004-5154-0](https://doi.org/10.1007/s10957-004-5154-0)

<a id="ref-LPR1996a"></a>Luo, Z.-Q., Pang, J.-S., & Ralph, D. (1996). *Mathematical Programs with Equilibrium Constraints*. Cambridge University Press. [doi:10.1017/CBO9780511983658](https://doi.org/10.1017/CBO9780511983658)

<a id="ref-Sch2001a"></a>Scholtes, S. (2001). Convergence Properties of a Regularization Scheme for Mathematical Programs with Complementarity Constraints. *SIAM Journal on Optimization* 11(4), 918-936. [doi:10.1137/S1052623499361233](https://doi.org/10.1137/S1052623499361233)

<a id="ref-SSM1983a"></a>Sherali, H. D., Soyster, A. L., & Murphy, F. H. (1983). Stackelberg-Nash-Cournot Equilibria: Characterizations and Computations. *Operations Research* 31(2), 253-276. [doi:10.1287/opre.31.2.253](https://doi.org/10.1287/opre.31.2.253)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MPEC](mpec.md)
