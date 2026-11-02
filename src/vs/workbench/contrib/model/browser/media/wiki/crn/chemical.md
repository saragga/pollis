# Chemical

The Michaelis-Menten scheme is the classic model of an enzyme. An enzyme binds its substrate, and the complex either falls apart or makes the product, freeing the enzyme again.

## Which Reactions the Tab Uses

- k1, S + E --> SE (binding)
- k2, SE --> S + E (unbinding)
- kcat, SE --> P + E (catalysis)

In the code, **k1 (forward rate)** and **k2 (reverse/decay rate)** set the first two, and kcat is fixed at 0.5. **u0 (initial amount)** sets S, while E starts at 10. Catalysis is irreversible, so that all substrate ends up as product, and the enzyme ends up free. Each rate follows mass action, so binding runs at k1 S E.

## Which Quantities Stay Constant

Two totals never change:

- E + SE, as an enzyme is either free or bound
- S + SE + P, as a substrate molecule is in one of three states

**Conservation Laws** finds these from the reactions, as rows of a matrix. They reduce the four differential equations to two. They also make steady states isolated: without fixing the totals, any amount of product with no substrate would count as a steady state, giving a continuum. **Steady States** therefore passes `u0` to `hc_steady_states`, so that the totals are fixed.

## How the Classic Rate Law Arises

Suppose that SE quickly reaches balance. [Briggs and Haldane (1925)](#ref-BH1925a) set dSE/dt to zero, which gives the rate of product formation:

- v = Vmax S / (Km + S), with Vmax = kcat E0 and Km = (k2 + kcat) / k1

At low S, the rate is proportional to S. At high S, the enzyme is saturated, and the rate flattens at Vmax. Km is the value of S that gives half the maximum rate. The tab keeps the full mass-action scheme, so it shows the early period in which SE builds up, which the rate law skips.

## When the Quasi-Steady State Holds

The rate law needs SE to adjust much faster than S changes. [Segel and Slemrod (1989)](#ref-SS1989a) give a condition for this: E0 / (S0 + Km) should be small. Typical laboratory settings meet it, with little enzyme and much substrate. Raising E in the code to near S breaks the assumption, and the two descriptions then part. Comparing the full model with the rate law at such settings is a useful exercise, and the full network gives a reference that does not depend on the approximation.

## How to Read the Chemical Tab

The plot shows S falling, P rising, E dropping as complexes form, and SE rising to match. While the enzyme is saturated, S falls almost linearly, as the rate is near Vmax. The fall then curves, as S drops below about Km. E and SE then return to their starting values. **Phase Portrait** plots the first two species, S and E, which traces this story in one curve. Check at the end that S and SE are near zero, or increase **T (time)**.

## Where the Scheme Falls Short

Real enzymes can have several steps, reversible product release, inhibitors and several binding sites. The model assumes a well-mixed solution, with no spatial effects and enough molecules for smooth amounts. At very low copy numbers, as within cells, chance matters, and a stochastic model is more suitable. [Alon (2006)](#ref-Alo2006a) discusses Michaelis-Menten forms as building blocks of cellular circuits. Rate constants have units, so that a real fit must keep units consistent with the amounts.

## References

<a id="ref-Alo2006a"></a>Alon, U. (2006). *An Introduction to Systems Biology: Design Principles of Biological Circuits*. Chapman and Hall/CRC.

<a id="ref-BH1925a"></a>Briggs, G. E. and Haldane, J. B. S. (1925). A note on the kinetics of enzyme action. *Biochemical Journal* 19(2), 338–339. [doi:10.1042/bj0190338](https://doi.org/10.1042/bj0190338)

<a id="ref-SS1989a"></a>Segel, L. A. and Slemrod, M. (1989). The quasi-steady-state assumption: a case study in perturbation. *SIAM Review* 31(3), 446–477. [doi:10.1137/1031091](https://doi.org/10.1137/1031091)

## See Also

- [Factsheet](factsheet.md) · [Genetic](genetic.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
