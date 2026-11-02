# Genetic

The repressilator is a ring of three genes in which each protein represses the next. A ring like this with an odd number of repressions has no way of settling down if the repression is sharp enough, and so it can oscillate.

## Which Reactions the Tab Uses

- hillr(Pz, v, K, 3), 0 --> Px
- hillr(Px, v, K, 3), 0 --> Py
- hillr(Py, v, K, 3), 0 --> Pz
- d, Px --> 0, and the same for Py and Pz

Each protein is made at a rate that falls with its repressor, and it decays at rate d. **k1 (forward rate)** sets v, **k2 (reverse/decay rate)** sets d, and K is fixed at 1. **u0 (initial amount)** sets the starting Px, and Py and Pz begin at zero.

## How a Hill Function Models Repression

hillr(P, v, K, n) = v K^n / (K^n + P^n). The rate is v when P is near zero, v/2 at P = K, and falls towards zero as P grows. The exponent n sets how sharp the switch is. Cooperative binding gives n above 1. Such a form is not mass action, as it summarises fast binding at the promoter in a single rate. [Alon (2006)](#ref-Alo2006a) derives such input functions and discusses their role in circuits.

## Why the Ring Oscillates

Odd rings have a single balance point where all three levels agree. Near it, a small rise in one protein passes around the ring and returns with its sign reversed, after a delay. If the signal returns strong enough, the balance point is unstable, and the levels chase each other around a cycle. For three identical steps, the loop gain must exceed 8, or a gain above 2 per step. A Hill coefficient of 2 cannot reach that in this protein-only model, and 3 can, given a large enough v/d.

## How the Tab Differs from the Original Circuit

[Elowitz and Leibler (2000)](#ref-EL2000a) built the circuit in bacteria, with a model that has mRNA and protein stages. The extra stages add delay, so that oscillations can occur at lower Hill coefficients. The tab drops mRNA, which is why it needs n = 3. It is a simplified version of the same idea. The tooltip for **u0 (initial amount)** speaks of mRNA, while the code's first species is the protein Px, and that difference matters if the model is extended.

## What Sets the Period and Amplitude

The time scale is set mainly by the degradation rate: with smaller d, each protein takes longer to clear, and the period grows. The ratio v/d sets the highest level a protein can reach, which sets amplitude. Below a critical v/d, the oscillation stops, and the levels settle, in a Hopf bifurcation. Start values matter little for the eventual cycle, because a limit cycle attracts nearby orbits, and three equal starts stay on the balance line. The code's start is asymmetric for that reason.

## What the Oscillation Does Not Show

In cells, proteins are few and noise is strong. Real repressilators can lose synchrony and vary in period. Growth, dilution and competition for cell resources are not in the model. The tab has a single set of rates for all three genes, whereas real genes differ. Deficiency theory also cannot speak here, as its conclusions need mass action, as explained in [Diagnostics](diagnostics.md). Read the result as a design principle, and not as a forecast of any real cell.

## References

<a id="ref-Alo2006a"></a>Alon, U. (2006). *An Introduction to Systems Biology: Design Principles of Biological Circuits*. Chapman and Hall/CRC.

<a id="ref-EL2000a"></a>Elowitz, M. B. and Leibler, S. (2000). A synthetic oscillatory network of transcriptional regulators. *Nature* 403(6767), 335–338. [doi:10.1038/35002125](https://doi.org/10.1038/35002125)

## See Also

- [Factsheet](factsheet.md) · [Chemical](chemical.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
