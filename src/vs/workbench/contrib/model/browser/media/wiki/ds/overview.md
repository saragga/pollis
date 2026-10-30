# Direct Search Methods — Overview

The Direct Search Methods panel minimises f(x) with four direct search methods. Every evaluation the solver makes goes through a recording wrapper, so the panel keeps each evaluated point and its value, and plots progress against the number of **evaluations**, the true cost of a derivative-free method.

## Two Families
- **Simplex methods**: **Nelder-Mead** keeps n + 1 points and reflects, expands, contracts or shrinks the simplex. See [Nelder-Mead](nelder-mead.md).
- **Directional (poll) methods**: around the current best point, the **incumbent**, they evaluate trial points at distance h along a set of directions; an improving point becomes the incumbent, and when none improves, h shrinks.
  - **Pattern Search** polls the 2n compass directions. See [Pattern Search](pattern-search.md).
  - **GSS** polls a minimal positive spanning set of n + 1 directions, with sufficient decrease and step expansion. See [Generating Set Search](generating-set-search.md).
  - **MADS** polls directions on a mesh that become dense in the limit. See [MADS](mads.md).
Poll methods have a convergence theory: as h goes to zero, the poll points certify that no direction improves to first order.

## Common Workflow

1. Enter the **Objective f(x)** and **Initial Guess x0**, the **Max Iterations** and, for Pattern Search and GSS, the **Initial Step**; choose a method and run.
2. Look at the **Convergence Trace** and the **Contour + Path**.
3. Run the **Convergence Check** and the **Restart Sensitivity**.
4. Try the **Noisy Objective** and **Evaluate at New Point**.
5. **Compare Methods** and compare **vs Gradient-Based**.
6. Read the **Solution Summary** and the **Evaluation Budget**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
