# Decision Guide

| Situation | Class and solver |
|---|---|
| Smooth, continuous, convex or a local optimum is enough | **NLP**, Ipopt |
| Large NLP, GPU, or pure Julia wanted | **NLP**, MadNLP |
| On/off decisions or cardinality limits, nonconvex | **MINLP**, SCIP |
| Convex MINLP | **MINLP**, Juniper + Ipopt |
| Nonconvex, global optimum required, pure Julia | **Global NLP**, EAGO |
| Nonconvex, global optimum, with integers or tight cuts | **Global NLP**, SCIP |
| Linear, quadratic or conic | Mathematical Programming: Conic |

## Decision Flow

1. **Solve as NLP with Ipopt** first: it is fast and shows the shape of the problem.
2. **Run Multi-Start**: if every start reaches the same objective, a local solver may be enough.
3. **If the starts disagree** and the best is needed, solve as **Global NLP**, with tight bounds.
4. **If decisions are discrete**, formulate them with binaries and solve as **MINLP**.
5. **Check the Status and Feasibility**, the gap, and the KKT conditions where duals exist.

## Rules of Thumb

- **Tighten the bounds**: it is the most effective way to speed up global and MINLP solvers.
- **Provide a good start** for local solvers; JuMP's start values are the place.
- **Reformulate** nonsmooth terms with auxiliary variables and constraints.
- **Do not trust Juniper's optimality** on nonconvex MINLPs.
- **Report the class of guarantee** with the result: local, global within a gap, or heuristic.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
