# AGS

AGS turns a search over a box into a search along one line, by using a space-filling curve. The line search then relies on an estimate of how fast the objective can change.

## How a Curve Reduces the Dimension

A Peano-type curve passes close to every point in a box, as a continuous map from the interval [0, 1]. Minimising f over the box then becomes minimising g(t) = f(curve(t)) over t. Practical versions use a finite approximation of the curve. [Sergeyev, Strongin and Lera (2013)](#ref-SSL2013a) develop the approach. Points close on the curve are close in the box, while the reverse fails: two nearby points in the box may lie far apart on the curve.

## How the One-Dimensional Search Works

Along the curve, g satisfies a Hölder condition, as distance scales like |t1 − t2|^(1/N) in N dimensions. The information algorithm, from [Strongin and Sergeyev (2000)](#ref-SS2000b), gives each interval between sampled t values a characteristic that reflects its width and its end values. The next evaluation goes into the interval with the best characteristic. Wide intervals and low end values both attract samples, which is again a trade-off between coverage and refinement.

## How the Constant Is Estimated

The method estimates the Hölder constant from the sampled data, with the largest observed slope, times a reliability factor above 1. Too low a factor can miss the global minimum, and too high a factor spreads samples evenly and wastes them. The bullet in the panel refers to that adaptive estimate. `NLopt.jl` sets the internal values, and the panel's code does not change them. Unlike DIRECT, this method commits to one estimate at a time, instead of considering all constants at once.

## Why AGS Suits Low Dimensions

Dimension hits this method in two ways. The curve must be very long to pass close to every point, and the exponent 1/N makes a smooth function look very rough along it. The panel's table suggests up to about 5 variables. Inside that range, a low-dimensional Lipschitz function is handled well. Above it, accuracy falls quickly, and the curve's limited precision becomes a limit on the result. **Lower Bounds** sets the dimension, so a problem larger than that deserves another tab.

## What the Curve Does to Search Points

**Search Points** can look structured, as samples follow the path of the curve and not a tree of boxes. Good regions may be approached along separate pieces of the curve, because neighbouring points in the box are not always neighbours along the line. For that reason, some versions use several curves at once. **Candidate Minima** and **Bounds Analysis** show how far the search has covered the box. A poor score there suggests that the budget was too small for the curve's resolution.

## Where AGS Is Strong and Weak

The method is deterministic, it needs few settings, and it has a clear theory: under the assumptions, its samples concentrate on global minimisers. Constraints can be handled through an index scheme, as set out in the same book, although the panel's code uses none. Its weaknesses are dimension, and sensitivity of the search to the reliability factor. Because each step considers all sampled intervals, the internal work per evaluation grows with the number of samples, which matters only when evaluations are cheap.

## References

<a id="ref-SSL2013a"></a>Sergeyev, Y. D., Strongin, R. G. and Lera, D. (2013). *Introduction to Global Optimization Exploiting Space-Filling Curves*. Springer. [doi:10.1007/978-1-4614-8042-6](https://doi.org/10.1007/978-1-4614-8042-6)

<a id="ref-SS2000b"></a>Strongin, R. G. and Sergeyev, Y. D. (2000). *Global Optimization with Non-Convex Constraints: Sequential and Parallel Algorithms*. Springer. [doi:10.1007/978-1-4615-4677-1](https://doi.org/10.1007/978-1-4615-4677-1)

## See Also

- [Factsheet](factsheet.md) · [DIRECT & DIRECT-L](direct.md) · [QuadDirect](quaddirect.md) · [Decision Guide](decision-guide.md)
