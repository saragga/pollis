# Assumptions

A reaction network makes strong assumptions in a compact form. Each line of the list carries a claim about mechanism, mixing and rate, so the assumptions can be read off it.

## What Mass Action Assumes

Mass action sets each rate to a constant times the reactant amounts, as if members met by chance in a well-stirred space. Molecules in dilute solution come close to that. Crowded cells, spatial patches, social contacts and predator search all depart from it. A rate constant then hides real structure. Non-mass-action rates, such as `hillr` in the **Genetic** tab, are summaries of faster hidden steps. [Alon (2006)](#ref-Alo2006a) sets out when such summaries are reasonable.

## What Well-Mixing Assumes

No species has a position, so space plays no role. Every susceptible person can meet every infectious person, and every predator can reach every prey. Spatial patterns, travelling waves and refuges are all absent, although they can change outcomes greatly, even allowing persistence where the mixed model predicts extinction. Spatial structure may be approximated by splitting a species into patches with exchange reactions, at the cost of many more species.

## What the Differential Equations Assume

Equations treat amounts as continuous and ignore chance. By [Kurtz (1972)](#ref-Kur1972a), a stochastic model converges to the differential equations as the system grows, so that the equations describe large systems. They mislead at small numbers. They allow fractions of a predator, and they miss extinction. A tiny number can always recover. Whenever a species can reach low counts, check with a stochastic run. The **Genetic** tab has K = 1 with levels up to about v/d, so its amounts cannot be read as real copy numbers.

## What the Stochastic Simulation Assumes

The Gillespie algorithm assumes well-mixed species and memoryless reactions. Each reaction's waiting time is then exponential given the state. [Gillespie (1977)](#ref-Gil1977a) showed that the algorithm samples exactly from the stochastic model, so its only errors are in the model itself. Real delays are often not exponential, as with an infectious period of fairly fixed length. An exact sample of a wrong model is still wrong. Rates that are combinatorial, such as X + X, also differ slightly from their continuous equivalents.

## What Constant Rates Assume

Rates are constant in time, and do not depend on anything outside the network. Temperature, season, control policies and behaviour can all change them. An epidemic in which people react to case numbers has a transmission rate that depends on I, and it can be modelled through a rate that is a function, as with the Hill rates. Values in the panel were chosen to show behaviour, and they did not come from data. Conclusions about real systems need fitted or measured rates.

## What Structural Results Assume

Deficiency theory by [Feinberg (1987)](#ref-Fei1987a) applies to mass-action rates. **Network Summary** counts its quantities from the list of reactions, and this count knows nothing of what rates are used. A network with Hill rates can meet the structural conditions and still oscillate, so that the theorem's conclusion must not be carried over. **Conservation Laws** does hold for any rates, as they depend only on the net changes per reaction. Check which conclusions need mass action before relying on them.

## References

<a id="ref-Alo2006a"></a>Alon, U. (2006). *An Introduction to Systems Biology: Design Principles of Biological Circuits*. Chapman and Hall/CRC.

<a id="ref-Fei1987a"></a>Feinberg, M. (1987). Chemical reaction network structure and the stability of complex isothermal reactors, I: the deficiency zero and deficiency one theorems. *Chemical Engineering Science* 42(10), 2229–2268. [doi:10.1016/0009-2509(87)80099-4](https://doi.org/10.1016/0009-2509(87)80099-4)

<a id="ref-Gil1977a"></a>Gillespie, D. T. (1977). Exact stochastic simulation of coupled chemical reactions. *The Journal of Physical Chemistry* 81(25), 2340–2361. [doi:10.1021/j100540a008](https://doi.org/10.1021/j100540a008)

<a id="ref-Kur1972a"></a>Kurtz, T. G. (1972). The relationship between stochastic and deterministic models for chemical reactions. *The Journal of Chemical Physics* 57(7), 2976–2978. [doi:10.1063/1.1678692](https://doi.org/10.1063/1.1678692)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
