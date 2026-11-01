# Trajectory Optimisation — Direct Methods

Direct methods discretise the states and controls first and optimise afterwards, turning the optimal control problem into one finite nonlinear program ([Betts (2010)](#ref-Bet2010a)).

## How Direct Collocation Transcribes a Trajectory Problem

The states and controls at all **Knot Points** become the decision variables, and the dynamics become equality constraints linking neighbouring nodes. The running cost is summed over the grid, each step weighted by its length dt, and the terminal cost is added at the last node. The solver may leave the dynamics violated during its iterations and need only satisfy them at convergence. That freedom is why collocation often succeeds from a rough starting guess where a method that always integrates forward would not.

## What Trapezoidal Collocation Enforces

Between nodes k and k + 1, trapezoidal collocation requires x(k+1) − x(k) = (dt/2) [f(x(k), u(k)) + f(x(k+1), u(k+1))]. This is the implicit trapezoid rule, with an error of second order in dt, and is a simple scheme that works well as a first choice ([Kelly (2017)](#ref-Kel2017a)). A coarse grid can satisfy the constraints exactly and still misrepresent the true motion, which is why **Discretisation Accuracy** and **Dynamics Feasibility** integrate the result separately with RK4.

## How the Direct Methods Tab Solves the Program

The tab builds the program in JuMP.jl and solves it with Ipopt.jl, an interior-point solver. The states start from a straight line between **Initial State** and **Target State**, and the controls are given no starting values of their own. The **Control Bound** input becomes a bound on every control, |u| ≤ umax, and `Inf` removes it. Ipopt exploits the sparsity of the constraints, as each node links only to its neighbours, so a large number of nodes remains practical.

## Strengths and Limits of Direct Methods

Direct methods accept bounds and a wide range of constraints with little effort, and are less sensitive to the starting guess than the indirect tab. Against that, the program grows with the grid, and accuracy is limited by the discretisation. Costates are not computed explicitly, so optimality conditions are not available directly in the tab. The straight-line guess can also lead a nonconvex problem to a poor local optimum: on a swing-up, for example, it says nothing about which way to swing first.

## References

<a id="ref-Bet2010a"></a>Betts, J. T. (2010). *Practical Methods for Optimal Control and Estimation Using Nonlinear Programming*, 2nd edition. SIAM. [doi:10.1137/1.9780898718577](https://doi.org/10.1137/1.9780898718577)

<a id="ref-Kel2017a"></a>Kelly, M. (2017). An introduction to trajectory optimization: how to do your own direct collocation. *SIAM Review* 59(4), 849–904. [doi:10.1137/16M1062569](https://doi.org/10.1137/16M1062569)

## See Also

- [Indirect Methods](indirect.md) · [ALTRO](altro.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
