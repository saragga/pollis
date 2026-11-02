# Grid Space

The tab runs the segregation model of Schelling on a square grid. It shows how mild individual preferences can add up to a strongly divided map.

## What the Schelling Segregation Model Computes

Residents of two equal groups occupy cells on a grid of **Grid Side** by **Grid Side**, with at most one per cell. A resident is happy when the share of neighbours from the same group is at least **Threshold**, and unhappy residents move to a random empty cell. [Schelling (1971)](#ref-Sch1971a) used moves of this kind to show that aggregate segregation can far exceed what any individual asks for. The tab records `segregation`, the mean same-group share over residents, and `share_happy`, and prints each at step 0 and at the last step.

## What Rules Define the Grid Space Model

- Neighbours: the agents in the 8 surrounding cells, or fewer at an edge or a corner
- Same-group share of a resident: s = same-group neighbours / all neighbours
- Happy: s >= **Threshold**, and a resident with no neighbours counts as happy
- Move: an unhappy resident goes to a random empty cell, with `move_agent_single!`, whether or not that cell suits them better
- Number of residents: round(**Density** × **Grid Side**²), split into two equal groups on random cells

A random start gives a same-group share near one half, the level against which segregation is read.

## Which Inputs the Grid Space Tab Uses

**Grid Side** sets the size of the map, and with it how many clusters can form. **Density** sets the share of occupied cells, and so how many empty cells remain to move to. **Threshold** is the preference of every resident, between 0 and 1, the same for both groups. **Steps (T)** sets the length of the run, and **Seed** the layout and the moves. The space is `GridSpaceSingle` with `periodic = false`, so a cell on the edge has fewer neighbours than one in the middle.

## Where the Schelling Model on a Grid Is Strong

The model isolates one mechanism with very few parts. Its central finding is a gap between motive and outcome: residents who would accept being a minority among their neighbours still end up surrounded by their own group. That gap is easy to see in **Snapshots** and easy to state as a number in **Summary**. The state where everybody is happy is absorbing, so the end of a run is clear, and **Convergence** can find it. Those features make the model a good first test of an agent-based workflow.

## Where the Schelling Model on a Grid Misleads

The model shows that preferences are sufficient for segregation, not that they are its cause in any actual city. Housing prices, discrimination and institutions are all absent. Residents here move at random, while Schelling's own residents looked for a place that would satisfy them, so sorting can differ in speed and in form. All residents share one threshold and the groups are of equal size, both strong simplifications. Hard edges affect small grids, as corner cells have only three neighbours. A high **Threshold** can prevent any settled state, which turns the printed share into a snapshot of continuing movement.

## What to Compare the Grid Space Model With

**Parameter Sweep** sets the outcome against **Threshold** and draws what residents ask for as a dashed line, so the gap is direct. **Structure** does the same for **Density**. **Scenario** lowers the threshold after sorting, to test whether the map mixes again. [Epstein and Axtell (1996)](#ref-EA1996a) offer a richer social model of the same bottom-up kind, in which agents also gather resources. Changing the move rule in `schelling_step!` to a search for a satisfying cell is a useful exercise on how far the result depends on it.

## References

<a id="ref-EA1996a"></a>Epstein, J. M. and Axtell, R. (1996). *Growing Artificial Societies: Social Science from the Bottom Up*. MIT Press.

<a id="ref-Sch1971a"></a>Schelling, T. C. (1971). Dynamic models of segregation. *Journal of Mathematical Sociology* 1(2), 143–186. [doi:10.1080/0022250X.1971.9989794](https://doi.org/10.1080/0022250X.1971.9989794)

## See Also

- [Factsheet](factsheet.md) · [Continuous Space](continuous-space.md) · [Graph Space](graph-space.md) · [Interpretation](interpretation.md)
