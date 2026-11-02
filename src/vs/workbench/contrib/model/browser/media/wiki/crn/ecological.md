# Ecological

Lotka-Volterra is the simplest predator-prey model, and it can be written as three reactions. Its cycles are neutral, which makes them a useful warning as well as a good teaching case.

## Which Reactions the Tab Uses

- a, X --> 2X (prey reproduce)
- b, X + Y --> 2Y (a predator eats a prey and reproduces)
- c, Y --> 0 (predators die)

In equations, dX/dt = aX − bXY, and dY/dt = bXY − cY. **k1 (forward rate)** sets a, **k2 (reverse/decay rate)** sets c, and b is fixed at 0.05. **u0 (initial amount)** sets the prey, and Y starts at 10. Writing predation as a reaction fixes the gain per prey eaten at exactly one predator. [Volterra (1926)](#ref-Vol1926a) proposed the model to explain fluctuations in fish catches.

## Where the Equilibrium Lies

The system has two balance points:

- (0, 0), where both species are extinct, a saddle
- (c/b, a/b), where both persist

The prey level at balance depends only on c and b, and the predator level only on a and b. Raising prey growth raises the predator level, with no change in the balance level of prey. That counter-intuitive result is a classic of the model. The linearised motion near (c/b, a/b) oscillates with period about 2 pi / sqrt(a c).

## Why the Cycles Are Neutral

The system has a conserved quantity:

- V = b X − c log X + b Y − a log Y

Each orbit keeps V fixed, so that it is a closed loop, and each start has its own loop. That is a neutral cycle, unlike a limit cycle, which attracts nearby orbits. A disturbance moves the system to another loop, and it stays there. [Murray (2002)](#ref-Mur2002a) explains that this makes the model structurally unstable: small changes to the equations destroy the family of loops.

## How Small Additions Change the Result

| Addition | Effect |
|---|---|
| Limit on prey growth | Damped spiral to a balance point |
| Predator satiation at high prey | Limit cycle becomes possible |
| Chance, with small numbers | Eventual extinction of a species |

Each is easy to add as a new reaction or a new rate. The first turns X --> 2X into a pair with a crowding reaction, 2X --> X. That illustrates what a reaction notation is good for, as a change of mechanism is a change of a line.

## How to Read the Ecological Tab

The plot shows prey peaking first, then predators, with prey falling as predators rise, and so on in repeating form. **Phase Portrait** draws a closed loop in the (X, Y) plane. The default start is far from balance, so the loop is wide, with long periods of very small numbers. A continuous model happily recovers from a tiny fraction of an animal, which no real population can do. **Rate Sweep** records peak predators as a varies, and that peak depends on the start and on **T (time)**.

## How Numerical Drift Can Mislead

Numerical solvers do not exactly conserve V, so that a long run can spiral outward or inward slowly. A growing amplitude in a long run may then be error, and not dynamics. Compute V along the solution, and it should stay nearly constant. Tighter tolerances reduce the drift, and a method designed to keep invariants does better. The default `solve(prob, Tsit5())` is suited to short runs. Wide loops are harder, as the rates change quickly during the sharp peaks.

## References

<a id="ref-Mur2002a"></a>Murray, J. D. (2002). *Mathematical Biology I: An Introduction*, 3rd ed. Springer.

<a id="ref-Vol1926a"></a>Volterra, V. (1926). Fluctuations in the abundance of a species considered mathematically. *Nature* 118(2972), 558–560. [doi:10.1038/118558a0](https://doi.org/10.1038/118558a0)

## See Also

- [Factsheet](factsheet.md) · [Epidemic](epidemic.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
