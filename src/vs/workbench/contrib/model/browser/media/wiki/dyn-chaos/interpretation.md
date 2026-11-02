# Interpretation

Each measure says something narrow. A claim of chaos is strongest when several measures agree and when a test against a null has been passed.

## How to Read the Lyapunov Output

`lambda_max` is a rate per unit of time, so its size depends on the time unit: rescaling time rescales it. `spectrum` lists all the exponents, in descending order. A positive first exponent, along with a bounded orbit, indicates chaos. For maps, exponents are per step. For Lorenz, a value near 0.906 means that errors grow by about 2.5 times per time unit, and so they double about every 0.77 time units. The most negative exponent shows how quickly the orbit falls back to the attractor.

## How to Read the Classification

| Largest exponents | **Chaos Classification** says | Meaning |
|---|---|---|
| λ1 > 0.01 | Chaotic | Sensitive dependence |
| λ1 ≈ 0 and λ2 ≈ 0 | Quasiperiodic | Motion on a torus |
| λ1 ≈ 0 only | Periodic | Limit cycle |
| All below zero | Stable fixed point | Motion stops |

The categories apply to flows, and the tolerance of 0.01 is a working choice. A value just above it needs a longer T before it counts. Maps have no zero exponent from the flow, so the middle rows do not apply to them.

## How to Read the Dimension

D2 near 2.05 means a set slightly more complex than a surface, as the Lorenz attractor looks like two wings with many thin layers. D2 is low relative to the three-dimensional state. A low value in measured data suggests that a few variables may describe the system, which is the main reason for computing it. As [Grassberger and Procaccia (1983)](#ref-GP1983a) noted, D2 gives a lower bound on the fractal dimension. Comparing it with D_KY tests whether geometry and dynamics agree.

## How to Read the Recurrence Quantifiers

**RQA Summary** prints RR, DET, LAM, L and TT with short notes. Values are relative: compare them among series, or over time, at matched settings. High DET with long L suggests regular or weakly chaotic motion, and low L with moderate DET suggests stronger chaos. High LAM suggests that the system lingers in some states. The note in the code calling DET near 1 predictable applies only with care, as a smooth or oversampled series gives high DET regardless of its dynamics.

## How to Read the Predictability Horizon

`T_pred` is an order-of-magnitude figure, and not a guarantee. It uses the mean exponent, whereas local rates vary along the attractor: some parts of the Lorenz attractor let errors grow faster than others. The horizon grows only with the logarithm of accuracy, so that heavy investment in better measurement yields modest gains. The tolerance Δ must make sense against the attractor's size. Forecast skill beyond the horizon can still exist in statistical form, because the attractor limits where the system can be.

## What the Results Do Not Say

A positive exponent from a finite series does not prove chaos, as noise can give one. A non-integer dimension does not prove it either, and high determinism does not prove it. None of these show what mechanism is at work, or whether a model is right. Quantifiers from different thresholds, embeddings or lengths are not comparable. Report the claim as evidence, with each test named, and keep in mind that for measured systems, a nonlinear stochastic process may fit as well as chaos.

## References

<a id="ref-GP1983a"></a>Grassberger, P. and Procaccia, I. (1983). Characterization of strange attractors. *Physical Review Letters* 50(5), 346–349. [doi:10.1103/PhysRevLett.50.346](https://doi.org/10.1103/PhysRevLett.50.346)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Lyapunov Exponents](lyapunov.md) · [Recurrence Analysis](rqa.md)
