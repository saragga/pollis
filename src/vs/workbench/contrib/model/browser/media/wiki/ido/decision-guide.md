# Choosing a Transcription for Optimal Control

The decisions here are how to discretise, how finely and with which solver. Each has a sensible default and a clear signal for moving away from it.

## Quick choices by situation

| Situation | Setting | Reason |
|---|---|---|
| Smooth problem, accuracy matters | Orthogonal Collocation (3) or (4) | High order at a small number of supports |
| Bang-bang control or jumps expected | Finite Difference (Backward) with more **Supports** | Robust and non-oscillating around jumps |
| Linear ODE, convex quadratic cost | **Solver** HiGHS | One optimum and fast |
| Nonlinear dynamics or cost | **Solver** Ipopt | Handles general functions, locally |
| First look at a new problem | Defaults, then **Mesh Refinement** | Shows whether the mesh matters |

## Collocation or finite differences

Collocation represents the state by a polynomial in each interval and imposes the ODE at its nodes, so on smooth problems the error falls very fast as the mesh grows ([Biegler (2010)](#ref-Bie2010a)). It pays a price in extra unknowns per interval and in less stable behaviour when the control jumps.

Finite differences are simpler. Backward differences are first order and damped, so they rarely misbehave and suit a first exploration, at the cost of needing many more supports for the same accuracy. Central differences reach second order but can show saw-tooth patterns. Start with collocation, and fall back to backward differences when the control oscillates between supports. **Compare Derivative Methods** runs all four at once.

## How many supports?

Use the smallest number at which the answer stops changing. **Mesh Refinement** gives the data, and the tooltip's range of 20 to 200 covers most small problems.

A smooth problem with collocation can often stop near the bottom of that range. A long horizon, fast dynamics or a control with switches needs more. Remember that unknowns grow in proportion: with 2 states and 1 control, 200 supports give about 600 unknowns before any collocation points, which is still small for a sparse solver. Tens of states over a long horizon are where solve time starts to bite, and that is when to stop refining at the accuracy you need.

## Direct or indirect

Direct methods, as used here, transcribe and then optimise. Indirect methods first derive the necessary conditions of Pontryagin's principle and then solve the resulting boundary-value problem for states and costates ([Betts (2010)](#ref-Bet2010a)).

Direct is the sensible default. It needs no derivations, accepts path constraints easily and is forgiving about the initial guess. Indirect methods can reach very high accuracy, but they need the switching structure in advance and a good guess at the costates. A hybrid is common in practice: use a direct solve to find the structure and the costates, then refine with an indirect one if the accuracy justifies the work.

## Which solver

**Solver** HiGHS suits linear dynamics with a convex quadratic cost, such as the default, where the transcription is a quadratic program with a single optimum. Its answer needs no starting point, and a status of `OPTIMAL` is a true optimum of the discretised problem.

**Solver** Ipopt covers the rest, and it is the only choice once anything nonlinear appears. A successful `Ipopt` status means a local optimum, so try changes of **T** or **Supports** as a cheap test of whether the answer moves to a different solution. When a problem of the HiGHS kind runs on both solvers, the two objectives should agree closely, which is a useful cross-check.

## When to reach for something else

The panel offers one problem form, and other tools fit other questions. A plan that must respond to disturbances needs feedback: linear dynamics with quadratic costs have a closed-form feedback in the linear-quadratic regulator, and in general model predictive control re-solves as measurements arrive.

Free final time, state constraints and integer decisions can all be stated in `InfiniteOpt`, by editing the generated code, with a suitable solver. Random parameters can also be declared as infinite parameters over a distribution. For very high-accuracy needs on long horizons or stiff dynamics, specialised pseudospectral or multiple-shooting tools may do better than the single-mesh approach here.

## References

<a id="ref-Bie2010a"></a>Biegler, L. T. (2010). *Nonlinear Programming: Concepts, Algorithms, and Applications to Chemical Processes*. Society for Industrial and Applied Mathematics. [doi:10.1137/1.9780898719383](https://doi.org/10.1137/1.9780898719383)

<a id="ref-Bet2010a"></a>Betts, J. T. (2010). *Practical Methods for Optimal Control and Estimation Using Nonlinear Programming*. Society for Industrial and Applied Mathematics. [doi:10.1137/1.9780898718577](https://doi.org/10.1137/1.9780898718577)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
