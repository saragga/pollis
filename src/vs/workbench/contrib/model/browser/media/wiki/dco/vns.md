# VNS

Variable neighbourhood search escapes local optima through controlled jumps. It perturbs the best solution, descends again, and makes the jumps larger when they fail.

## How the Search Loop Works

`search` starts from a nearest-neighbour tour after a descent. Then, at each iteration:

1. Shake the best tour at level s.
2. Descend with `vnd!`.
3. If the result is better, accept it and set s = 1.
4. Otherwise raise s by 1, returning to 1 after **Shaking Levels**.

[Mladenović and Hansen (1997)](#ref-MH1997a) proposed the method, on the principle that a local optimum for one neighbourhood need not be one for another, and that local optima tend to lie close to each other.

## What the Shake Does

Level s applies s random double-bridge moves. A double bridge cuts the tour into four segments, A, B, C and D, and reconnects them as A C B D. It keeps the order inside each segment, which preserves much of the tour's quality, and the 2-opt and or-opt moves cannot easily undo it. [Lourenço, Martin and Stützle (2003)](#ref-LMS2003a) discuss why this move works well for tours.

## How Shaking Strength Should Be Set

**Shaking Levels** sets the largest s. Weak shakes usually fall back to the same local optimum, and strong shakes destroy too much, and approach a random restart. Starting at level 1 and growing only on failure spends most effort near the current best, and widens the search as needed. A default of 3 is modest. Larger values are worth trying on large instances, where a single double bridge changes only a small share of the tour's structure.

## How VNS Differs from Iterated Local Search

Iterated local search also perturbs, descends and accepts. With a fixed perturbation and improving acceptance, the two are very close. The main differences are the systematic change in strength in VNS, and the wider acceptance rules in iterated local search. In practice the names overlap, and results depend more on the details than on the label. [Hansen, Mladenović and Moreno Pérez (2010)](#ref-HMP2010a) survey many variants, including skewed acceptance rules and reduced forms with no descent.

## Why Only Improvements Are Accepted

The tab accepts a new tour only if it is strictly shorter, with a margin of 1e-12. That focuses the search on the best region, and makes it fast. It can also get stuck, as it can never leave a deep local optimum that all shakes return to. Accepting slightly worse tours from time to time, as in skewed VNS, widens the search, and so does restarting from another tour. A long flat stretch on **Convergence Curve** can point to this, although it can also mean that the tour is already near optimal.

## Where VNS Is Strong and Weak

VNS has few parameters, and it keeps the structure of good tours, unlike restarts, so that each iteration costs little after the first. A shake disturbs only some of the tour, so repair needs few moves, although the code's scans still go through all of it. It does depend on a single trajectory, so that seeds matter, and it has no population to protect diversity. Use **Restart Study** to measure this. The method also needs a descent worth repeating, so that weak neighbourhoods weaken it too.

## References

<a id="ref-HMP2010a"></a>Hansen, P., Mladenović, N. and Moreno Pérez, J. A. (2010). Variable neighbourhood search: methods and applications. *Annals of Operations Research* 175(1), 367–407. [doi:10.1007/s10479-009-0657-6](https://doi.org/10.1007/s10479-009-0657-6)

<a id="ref-LMS2003a"></a>Lourenço, H. R., Martin, O. C. and Stützle, T. (2003). Iterated local search. In *Handbook of Metaheuristics*, 320–353. Kluwer. [doi:10.1007/0-306-48056-5_11](https://doi.org/10.1007/0-306-48056-5_11)

<a id="ref-MH1997a"></a>Mladenović, N. and Hansen, P. (1997). Variable neighborhood search. *Computers and Operations Research* 24(11), 1097–1100. [doi:10.1016/S0305-0548(97)00031-2](https://doi.org/10.1016/S0305-0548(97)00031-2)

## See Also

- [Factsheet](factsheet.md) · [GRASP](grasp.md) · [VND](vnd.md) · [Decision Guide](decision-guide.md)
