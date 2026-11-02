# Adaptive Large Neighbourhood Search

Adaptive large neighbourhood search keeps several destroy operators and lets past success decide which is used next. The search learns the right size of move while it runs, so that the size need not be chosen in advance.

## Operators that compete

The original method was built for pickup and delivery routing, with several destroy and repair heuristics and weights updated from their success during the search ([Stefan Ropke and David Pisinger (2006)](#ref-RP2006a)). That paper rewards an operator by tiers, for a new best solution, a better one and an accepted one, updates weights after a segment of iterations, and accepts moves with a simulated-annealing rule.

The panel keeps the central idea in a compact form. Three destroy fractions compete, `FRACS = [0.25, 0.5, 0.75]`, with a single repair, and the update runs after every move. A move is accepted only when it improves the best value.

## The weight update by hand

An operator is chosen by a roulette wheel with probability proportional to its weight, and all three start at 1. After the move, `w = (1 - r) * w + r * score`, with a score of 3.0 for an improvement of the best value and 0.5 otherwise.

At the default **Reaction Factor** of 0.2, a success lifts a weight from 1 to 0.8 + 0.6 = 1.4, and a failure lowers it to 0.8 + 0.1 = 0.9. After one success and two failures on separate operators, the weights 1.4, 0.9 and 0.9 give the first a chance of 1.4 / 3.2 ≈ 44%. A setting of 0 keeps all weights equal, which makes the method plain **LNS** with mixed sizes. A setting of 1 uses only the latest score.

## Why the final weights mislead

Improvements of the best value become rare late in a run. Each failure pulls a weight towards 0.5, and only 0.8¹⁰ ≈ 0.11 of any earlier gain survives ten straight failures at the default. By the end all weights tend to sink towards the same level, even if one operator did all the early work.

`final_weights` thus often reads as nearly equal and says little about which size was useful. `times_used` keeps the longer memory, since an operator that earned a high weight early will have been chosen more often. Read the usage counts first when asking what the search learned, and treat the final weights as a statement about recent failures.

## Small problems leave little to learn

Sizes round to whole variables with `max(1, round(Int, frac * n))`. With two variables, fractions of 0.25 and 0.5 both re-sample one variable and 0.75 re-samples both, so two of the three operators are the same move. With ten variables, the three give 2, 5 and 8, and the competition becomes real.

Adaptation also needs successes to learn from. A budget that funds a few dozen descents gives few of them, and the weights hardly leave their starting values. **ALNS** earns its extra machinery when the problem has enough variables and enough budget, and **LNS** with one reasonable fraction is the honest baseline to compare it with.

## References

<a id="ref-RP2006a"></a>Ropke, S., & Pisinger, D. (2006). An Adaptive Large Neighborhood Search Heuristic for the Pickup and Delivery Problem with Time Windows. *Transportation Science* 40(4), 455-472. [doi:10.1287/trsc.1050.0135](https://doi.org/10.1287/trsc.1050.0135)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
