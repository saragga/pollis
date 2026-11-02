# Interpretation

The panel's views should be read together with their measures. A picture suggests what happened, and a number says how much.

## How to Read the Segregation Index in Plot Titles

Titles print **segregation** and **happy** at the frame's step. The segregation index is the mean share of same-group neighbours over residents with neighbours, so it runs from 0 to 1, with a random start near one half. It records one thing, namely exposure to the other group among neighbours. [Massey and Denton (1988)](#ref-MD1988a) separate segregation into several dimensions, including evenness and clustering, so a single index does not describe a map in full. Happy is the share of residents at or over **Threshold**, or without neighbours.

## How to Read a Before and After Pair of Frames

The step 0 frame shows a random layout, and speckled colours are what random placement looks like. The step T frame shows what the rules did. Solid blocks with clear borders mean strong sorting, and a border is where unhappy residents are most likely to be. A large index gap beside a modest visual change may reflect the small grid, and the reverse can reflect a misleading impression. Note the **Threshold** beside the outcome: the point of the model is that the outcome can far exceed what residents demanded, as [Schelling (1971)](#ref-Sch1971a) showed.

## How to Read the Curves of an Observable Overlay

**Observable Overlay** puts the final grid over two curves: **Same-group neighbours** and **Happy residents**, by step. A steep early rise followed by a plateau means that sorting was quick and then stopped. A share of happy residents reaching 1 marks the point where nobody moves, and the curves are flat from there. Curves that keep moving mean continuing movement, as can happen at a high threshold. The curves come from one run, so small wiggles are not findings.

## How to Read Threshold Scenarios

**Threshold Scenarios** draws the grid at step T for thresholds 0.2, 0.4 and 0.7, all from one seed. The three frames share a start, so differences come from the rule and from the different random choices it leads to. A rise in **segregation** from low to middle thresholds is the usual pattern. At a high threshold, many residents cannot be satisfied and keep moving, so blocks may be less clean, and the share of happy residents gives the reason. One seed per threshold gives only an impression of the trend.

## How to Read Colour Schemes on the Same Grid

**Colour Schemes** draws one final state three ways. By group shows the blocks. By happiness shows who is still unsatisfied, usually along the borders of blocks. By same-group share, on `:viridis`, shows the gradient from deep inside a block to its edge, with black for residents alone. Reading the three together shows that a resident's experience differs from the map's overall look. A colour map changes what looks important, so the [Crameri, Shephard and Heron (2020)](#ref-CSH2020a) advice on uniform colour maps applies to any choice made here.

## How to Read the Excess in Spatial Clustering

**Spatial Clustering** gives an observed share, the share expected if neighbours were drawn at random, sum of k(k − 1) / (n(n − 1)) over groups of size k, and their difference. The excess is the clustering that the dynamics created. It answers a narrower question than a picture does, and an excess from one seed carries no standard error. The expected value ignores the effect of the grid's edges and empty cells, so treat it as a reference line and not as a test.

## References

<a id="ref-CSH2020a"></a>Crameri, F., Shephard, G. E. and Heron, P. J. (2020). The misuse of colour in science communication. *Nature Communications* 11(1), 5444. [doi:10.1038/s41467-020-19160-7](https://doi.org/10.1038/s41467-020-19160-7)

<a id="ref-MD1988a"></a>Massey, D. S. and Denton, N. A. (1988). The dimensions of residential segregation. *Social Forces* 67(2), 281. [doi:10.2307/2579183](https://doi.org/10.2307/2579183)

<a id="ref-Sch1971a"></a>Schelling, T. C. (1971). Dynamic models of segregation. *Journal of Mathematical Sociology* 1(2), 143–186. [doi:10.1080/0022250X.1971.9989794](https://doi.org/10.1080/0022250X.1971.9989794)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
