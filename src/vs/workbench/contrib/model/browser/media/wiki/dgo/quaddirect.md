# QuadDirect

QuadDIRECT mixes coordinate-wise box splitting with quadratic models. It is built for smooth objectives, where curvature can guide where to evaluate next.

## How the Method Works

The method keeps a tree of boxes, and it splits along one coordinate at a time. A split uses three values along that coordinate. Fitting a parabola through them suggests where the minimum along that line may lie, so a split point can land there and not at a fixed fraction of the box. Promising boxes also receive local refinement through a quadratic model. In the code, `analyze` builds the tree, and `minimum(root)` returns the leaf with the lowest value.

## Where the Idea Comes From

QuadDIRECT borrows its structure from multilevel coordinate search, from [Huyer and Neumaier (1999)](#ref-HN1999a), which also uses coordinate-wise splitting, levels of boxes, and local quadratic models. It keeps the DIRECT idea of balancing large boxes against low values, and it gets away from fixed trisection. Boxes of various sizes are kept alive together, so that global coverage continues while promising leaves are refined. The result sits between a pure space-partition method and a local model-based method.

## How the Code Sets It Up

`splits` gives three positions per coordinate: lower bound, midpoint and upper bound. They set the first evaluations, and a user with prior knowledge can place them to reflect it. `analyze(g, splits, lb, ub; maxevals=maxeval)` runs the search, and `g` records each point. The code always reports `ret = :MAXEVAL_REACHED`, since this package does not return a code the way `NLopt.jl` does. So on this tab `return_code` carries no information, and the printed `evaluations` should be read in its place.

## Why Smoothness Matters Here

Quadratic models pay off where the function really is close to a quadratic, near a smooth minimum. Then a few evaluations reach high precision, whereas DIRECT would keep trisecting. On a noisy or rough function, a parabola through three points can be badly wrong, and it offers little over a fixed split. The panel's table recommends this tab for smooth objectives. The default six-hump camel is a polynomial, and so it is a favourable case, which should be kept in mind when reading a comparison on it.

## How Many Evaluations It Can Save

The bullet in the panel says that it uses fewer evaluations than standard DIRECT. That can be expected on smooth functions, and it is not a general law, so test it on the problem. **Deterministic vs Stochastic** compares it at one budget, and **Budget Study** shows the progress on this tab. Measure accuracy, and not only value, since both methods may find the same basin. Combined with **Local Refinement**, the difference may shrink, since a polish removes DIRECT's slow end phase.

## Where QuadDirect Is Strong and Weak

Strengths are good precision on smooth functions, no need for a starting point, and the ability to take advantage of a user's split points. Weaknesses are a dependence on smoothness, and a budget set through `maxevals`, which may be passed slightly, so read the printed `evaluations`. Results are also tied to one package. High dimensions remain hard, as splits along one coordinate at a time multiply quickly. As with the rest of the family, no finite run proves that a result is global.

## References

<a id="ref-HN1999a"></a>Huyer, W. and Neumaier, A. (1999). Global optimization by multilevel coordinate search. *Journal of Global Optimization* 14(4), 331–355. [doi:10.1023/A:1008382309369](https://doi.org/10.1023/A:1008382309369)

## See Also

- [Factsheet](factsheet.md) · [DIRECT & DIRECT-L](direct.md) · [AGS](ags.md) · [Decision Guide](decision-guide.md)
