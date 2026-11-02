# Infinite-Dimensional Optimisation

Some decisions are whole functions rather than lists of numbers, such as a control signal over time. Infinite-dimensional optimisation states such a problem in its continuous form and then solves a finite approximation.

## When the decision is a function

An ordinary optimiser chooses a vector. Here the unknown is a trajectory, such as a thrust u(t) at every moment on an interval, so there are infinitely many values to choose. Time is the usual infinite domain, though space or an uncertain parameter can play the same role.

Writing the model on its natural domain has practical value. The integral objective and the differential equations stay visible as such, separately from how they are later discretised. [Pulsipher, Zhang, Hongisto and Zavala (2022)](#ref-PZHZ2022a) set out this abstraction, and it underlies the package used in the panel, `InfiniteOpt`, which works alongside the JuMP modelling language.

## The problem this panel solves

The one tab, **Optimal Control**, minimises the integral of a running cost subject to an ODE:

- Minimise the integral of f(x, u, t) from t0 to T.
- Subject to dx/dt = g(x, u, t) on the whole horizon.
- With x(t0) and x(T) both fixed.
- With −umax ≤ u(t) ≤ umax for every control at every time.

**Dynamics dx/dt** and **Running Cost f(x, u, t)** take any Julia expression in `x`, `u` and `t`. States are found by integrating the dynamics, so they respond to the control and are not free. **States** and **Controls** set the lengths of `x` and `u`.

## From the continuous problem to a finite one

The solver cannot handle a function directly. **Supports** picks points in time, and **Derivative Method** states how the derivative between them is approximated. The dynamics become algebraic constraints linking neighbouring values, and the integral becomes a weighted sum.

That route, discretising first and then optimising, is called direct transcription ([Betts (1998)](#ref-Bet1998a)). A model with 2 states, 1 control and 50 supports becomes a sparse problem in about 150 unknowns, before any added collocation points. The accuracy of the answer now rests on the mesh as well as the solver, which is why **Mesh Refinement** matters.

## A default with an answer on paper

The default is a double integrator: x₁' = x₂, x₂' = u, moving from (1, 0) to (0, 0) in T = 2 with least control energy, the integral of u². Calculus of variations solves it exactly:

- Optimal control: u(t) = −1.5(1 − t), a straight line from −1.5 to 1.5.
- Optimal cost: 12 / T³ = 1.5.
- Largest control: 6 / T² = 1.5, well inside the default bound of 5.

The panel should reproduce those numbers, which makes the default a good test of a setting. A new problem usually has no such check, so [Diagnostics](diagnostics.md) gives other ways to gain confidence.

## References

<a id="ref-Bet1998a"></a>Betts, J. T. (1998). Survey of Numerical Methods for Trajectory Optimization. *Journal of Guidance, Control, and Dynamics* 21(2), 193-207. [doi:10.2514/2.4231](https://doi.org/10.2514/2.4231)

<a id="ref-PZHZ2022a"></a>Pulsipher, J. A., Zhang, W., Hongisto, T. J., & Zavala, V. M. (2022). A Unifying Modeling Abstraction for Infinite-Dimensional Optimization. *Computers & Chemical Engineering* 156, 107567. [doi:10.1016/j.compchemeng.2021.107567](https://doi.org/10.1016/j.compchemeng.2021.107567)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
