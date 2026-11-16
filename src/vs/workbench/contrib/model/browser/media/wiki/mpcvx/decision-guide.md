# General Convex Programming — Decision Guide

| Situation | Tab or panel |
|---|---|
| Convexity to be proven before solving | **Convex.jl (DCP)** |
| Norms, absolute values or log-sum-exp in the objective | **Convex.jl (DCP)** |
| A linear or quadratic objective in a large or varied model | **JuMP** |
| Second-order, exponential or power cones written directly | Second-Order, Exponential and Power Cones panel |
| Matrix variables, eigenvalues | Semidefinite Programming panel |
| Integer variables | Mixed-Integer Convex Programming panel |
| Smooth non-convex objective | Local Nonlinear Programming panel |

## Choosing Between Convex.jl and JuMP
Convex.jl ([Udell, Mohan, Zeng, Hong, Diamond and Boyd (2014)](#ref-UMZHD...2014a)) states a problem with atoms whose curvature, sign and monotonicity it knows, proves the problem convex by the rules of disciplined convex programming, and builds the conic form itself, so that a norm or a log-sum-exp can be written as it is. JuMP ([Dunning, Huchette and Lubin (2017)](#ref-DHL2017a)) is a modelling language for many classes of problem: it passes a linear or quadratic objective to the solver as written and bridges each constraint to a form the solver supports, but passes other functions as nonlinear expressions, which conic solvers do not accept.

## Decision Flow for General Convex Programming
1. **Write the objective** with Convex.jl's atoms, and read the **Convexity Check**.
2. **If Convex.jl refuses the problem**, rewrite the failing expression with atoms whose composition the rules cover, as the **Broken Rule** shows.
3. **Solve with Clarabel** first, for accuracy, and check **Status and Feasibility**.
4. **For large sparse problems**, compare COSMO and SCS in the **Solver Comparison**.
5. **To move the problem into a larger JuMP model**, check with **Convex.jl and JuMP** that both packages give the same optimal value.

## References

<a id="ref-UMZHD...2014a"></a>Udell, M., Mohan, K., Zeng, D., Hong, J., Diamond, S. and Boyd, S. (2014). Convex Optimization in Julia. *2014 First Workshop for High Performance Technical Computing in Dynamic Languages*, 18–28. IEEE. [doi:10.1109/HPTCDL.2014.5](https://doi.org/10.1109/HPTCDL.2014.5)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Convex Programming](convex.md)
