# General Convex Programming — Overview

The General Convex Programming panel minimises a convex objective of non-negative variables x under one linear constraint, and states the problem in two Julia packages: **Convex.jl**, which proves the problem convex by the rules of disciplined convex programming and reduces it to cones, and **JuMP**, which passes it to the solver, bridging what the solver does not support. A conic solver then solves it.

## The Two Tabs of General Convex Programming
- **Convex.jl (DCP)**: the objective is built from Convex.jl's atoms, such as `sumsquares`, `norm` or `logsumexp`. Convex.jl ([Udell, Mohan, Zeng, Hong, Diamond and Boyd (2014)](#ref-UMZHD...2014a)) checks the problem before solving it and refuses one it cannot prove convex. See [Disciplined Convex Programming](dcp.md).
- **JuMP**: the objective is a linear or quadratic expression in the JuMP variables x ([Dunning, Huchette and Lubin (2017)](#ref-DHL2017a)). See [Convex Programming](convex.md).

Both tabs share **n**, the **Constraint**, its **Relation** and **Right-Hand Side**, and the **Solver**, so that **Convex.jl and JuMP**, in Compare, can solve the problem of one tab with the other package.

## Solvers of General Convex Programming
The **Solver** is Clarabel, an interior-point method ([Goulart and Chen (2024)](#ref-GC2024a)); COSMO, an operator-splitting method for large sparse problems ([Garstka, Cannon and Goulart (2021)](#ref-GCG2021a)); or SCS, a first-order splitting method, fast but less accurate ([O'Donoghue, Chu, Parikh and Boyd (2016)](#ref-OCPB2016a)). All three accept the cones Convex.jl produces and a quadratic objective. The **Solver Comparison** solves the problem with each and reports the status, the optimal value and the time.

## Common Workflow in General Convex Programming
1. Choose the tab, and enter **n**, the **Objective (minimised)**, the **Constraint** with its **Relation** and **Right-Hand Side**, and the **Solver**.
2. Look at the **Solution Profile**.
3. Check **Status and Feasibility**, and on the Convex.jl (DCP) tab the **Convexity Check** and the **Broken Rule**.
4. Run the **Parametric Sweep** and the **Dual Value Check**.
5. Compare with the **Solver Comparison** and **Convex.jl and JuMP**.
6. Read the **Conic Form**, and on the Convex.jl (DCP) tab the **Expression Graph**.

## References

<a id="ref-UMZHD...2014a"></a>Udell, M., Mohan, K., Zeng, D., Hong, J., Diamond, S. and Boyd, S. (2014). Convex Optimization in Julia. *2014 First Workshop for High Performance Technical Computing in Dynamic Languages*, 18–28. IEEE. [doi:10.1109/HPTCDL.2014.5](https://doi.org/10.1109/HPTCDL.2014.5)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GC2024a"></a>Goulart, P. J. and Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [arXiv:2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-GCG2021a"></a>Garstka, M., Cannon, M. and Goulart, P. (2021). COSMO: A Conic Operator Splitting Method for Convex Conic Problems. *Journal of Optimization Theory and Applications* 190(3), 779–810. [doi:10.1007/s10957-021-01896-x](https://doi.org/10.1007/s10957-021-01896-x)

<a id="ref-OCPB2016a"></a>O'Donoghue, B., Chu, E., Parikh, N. and Boyd, S. (2016). Conic Optimization via Operator Splitting and Homogeneous Self-Dual Embedding. *Journal of Optimization Theory and Applications* 169(3), 1042–1068. [doi:10.1007/s10957-016-0892-3](https://doi.org/10.1007/s10957-016-0892-3)

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Disciplined Convex Programming](dcp.md)
