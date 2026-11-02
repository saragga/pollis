# Choosing a Neighbourhood Search Method

The choice depends mainly on whether a local descent works on your objective, and then on what you know about the shape of the landscape.

## Quick choices by situation

| Situation | Reasonable tab | Reason |
|---|---|---|
| No usable gradients: kinks, steps, noise | **CRS** or **SA** | Neither uses a descent |
| Smooth objective, descent gets trapped | **ILS** | Simplest kick-and-descend loop |
| Some variables can change while others keep their value | **LNS** | Changes part of the solution |
| Unknown best size of change | **ALNS** | Destroy sizes compete |
| Many nearby minima arranged in a funnel | **BH** | Walks between neighbouring valleys |
| Rugged landscape and very cheap objective | **SA** | One evaluation per move |

## Does a local descent help?

A smooth objective rewards descent-based tabs, because they reach the bottom of each valley exactly. Their price is many evaluations per move, and the count rises with the number of variables.

A test before choosing is cheap: run **Local Polish** from any point and see whether the value falls cleanly. An erratic result or a large gradient at the end points to a surface that the descent cannot handle, so **CRS** or **SA** should come first. Their answers can be polished at the end if the surface is smooth near the optimum.

## Kick, re-sample or walk?

The three descent-based ideas suit different structures. A Gaussian kick moves all variables a little and stays nearby, which suits landscapes where good minima sit close together. A re-sample moves only some variables, but moves them anywhere in the box, which suits problems that come apart into groups of variables.

Keeping only improvements makes **ILS** and **LNS** greedy. They descend quickly but can stall when the next better minimum lies beyond a worse one. **BH** pays for the ability to cross those gaps with some wasted time spent in worse valleys. If **ILS** stalls at different values across seeds, **BH** is the natural next try.

## Choosing the budget

The default 5000 is sized for the two-variable default and is no guide for larger problems. Run with a budget, then double it. If `mean_best` in **Seed Robustness** improves sharply, the first budget was too small and the second may be as well.

Keep `best_first_reached_at` in view when setting it. A run that stops improving well before the end has budget to spare, and that spare budget may be better spent on more seeds, since independent runs guard against a bad start. When only a few evaluations are possible, these methods are weak in general and a model-based alternative deserves a look.

## Settings to try first

Begin with the defaults, then run **Parameter Sensitivity** for the tab in use. If a choice has to be made by reasoning alone:

- **Perturbation Scale**: aim for a kick about one valley wide. A kick smaller than half a valley falls back, and one close to the box width is a random restart.
- **Population**: more points explore more but spend more of the budget before reflecting anything.
- **Temperature**: set it near the typical difference in value between neighbouring minima.
- **Cooling Rate (rt)**: nearer to 1 explores longer, so give it a larger budget.

## When to leave this family

The six tabs work on a continuous box and improve by trial, so other routes can be far better when the problem has more structure. A convex objective needs only a local solver. An expensive objective with few allowed evaluations calls for surrogate-based search.

A population method designed for global exploration, such as differential evolution or CMA-ES, is often stronger in tens of variables, and problems with integer decisions or combinatorial structure need operators designed for them. In those settings, destroy-and-repair remains a fine idea, though the moves must be written for the problem instead of drawn from a box.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
