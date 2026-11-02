# dxNES

The distance-weighted xNES changes how fitness is converted into weights and how fast the distribution adapts. The goal is to stop the search from shrinking while it should still be travelling.

## What Problem It Addresses

On a plateau or a long valley, a small population gives no strong signal about direction. If the distribution contracts before it has reached a good region, then the search stalls, and no number of evaluations will rescue it. The contraction is not a coding fault: selection tends to shrink the spread by itself. The panel's table lists multimodal and plateau-rich landscapes as the reason to prefer this tab over **xNES**.

## What Changes from xNES

[Fukushima, Nagata, Kobayashi and Ono (2011)](#ref-FNKO2011a) made two changes:

| Change | Purpose |
|---|---|
| Weights that also depend on distance from the centre | Favour candidates that are both good and far |
| Learning rates that respond to movement | Keep the distribution wide while the centre travels |

While the centre keeps moving, the method holds or widens the distribution, and it shrinks the distribution once movement dies down. It thus separates a travelling phase from a settling phase, in a way that resembles the role of the step-size path in CMA-ES.

## What to Expect on Rastrigin

The bowl under the ripples offers a broad pull towards the origin, so that a method that stays wide should see it. **Search Radius History** is the best evidence: a dxNES run should hold a large radius for longer than **xNES**, before its decline. **Compare Strategies** shows the effect on value at a shared budget. Staying wide costs evaluations, so a small budget can leave the method unfinished: check that the radius has dropped by the end, and otherwise give it more.

## What the Code Does

The code calls `bboptimize` from `BlackBoxOptim.jl`, with `Method=:dxnes`. Everything else matches the **xNES** tab: the same box, budget, seed and recording. The two tabs can thus be compared directly, with no other difference to explain a gap. **Initial Step Size** does not apply. Implementation details belong to the package and need not agree exactly with the paper, so a comparison with published results should be read loosely.

## Where dxNES Is Strong and Weak

Its strength is the ability to keep searching when simple shrinking would stop. Its weakness is the slower end phase on a simple smooth problem, where **xNES** or **CMA-ES** waste less. Full-matrix cost also limits the dimension. Because the method depends on detecting movement, a noisy objective may confuse that signal. Treat a good result on Rastrigin as evidence for broad, regular landscapes, and test separately on a function with deceptive structure.

## References

<a id="ref-FNKO2011a"></a>Fukushima, N., Nagata, Y., Kobayashi, S. and Ono, I. (2011). Proposal of distance-weighted exponential natural evolution strategies. In *2011 IEEE Congress of Evolutionary Computation*. [doi:10.1109/CEC.2011.5949614](https://doi.org/10.1109/CEC.2011.5949614)

## See Also

- [Factsheet](factsheet.md) · [xNES](xnes.md) · [CMA-ES](cmaes.md) · [Decision Guide](decision-guide.md)
