# Overview

Watching an agent-based model often reveals what a summary number hides. The panel draws one model in three ways, as still frames, as a video and as a live dashboard, and connects each picture to the numbers behind it.

## Why Visualise an Agent-Based Model

An aggregate curve says how much something changed, and a picture of the agents says where and how. Clusters, fronts and bands are spatial facts that a mean can miss, and two very different layouts can share the same mean. Pictures also catch mistakes quickly, since an agent stuck in a corner or a colour that never appears shows up at a glance. [Wilensky and Rand (2015)](#ref-WR2015a) treat visual inspection as a routine part of building and debugging a model. A picture is only a first reading, and any pattern seen in it should then be confirmed with a measure and with more than one seed.

## Which Model the ABM Visualisation Panel Draws

All three tabs draw the segregation model of [Schelling (1971)](#ref-Sch1971a) on a square grid. Two equal groups of residents occupy cells, with at most one per cell. A resident is happy when the share of same-group neighbours among the surrounding cells reaches **Threshold**, and an unhappy resident moves to a random empty cell. The model suits drawing, since its state is a coloured map and its outcome is visible as blocks. It is an example to learn from, and replacing the agent, its step function and the colour rule adapts the code to another model.

## How the Three Tabs of the ABM Visualisation Panel Differ

**Static Plot** calls `abmplot!` twice and draws the grid at step 0 and at step **Steps (T)** side by side. **Video Animation** calls `abmvideo` and writes an MP4 of the whole run to the working directory. **Interactive Explorer** calls `abmexploration` and opens a live window with a slider for the threshold and two curves under the grid. A shared `plotkw` keeps one colour and marker rule across all views, so frames from different tabs can be compared.

## What Stack Draws an Agent-Based Model in the Panel

`Agents.jl`, the package of [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a), provides the model and the three drawing functions. They draw through `GLMakie.jl`, part of the plotting system of [Danisch and Krumbiegel (2021)](#ref-DK2021a), which uses the graphics card and opens a window. The functions take the rules for colour, marker and size as functions of an agent, so anything held in an agent can be drawn. `abmplot!` places a plot in an existing `Axis`, and that is how the panel builds figures with several parts.

## A Common Workflow for Visualising an Agent-Based Model

1. Use **Static Plot** to compare the start with the end.
2. Use **Colour Encoding Check** to confirm that the picture shows what is meant.
3. Use **Multi-Panel Figure** or **Video Animation** to see how the change unfolded.
4. Use **Interactive Explorer** to try values of **Threshold** freely.
5. Use **Spatial Clustering** and **Animation Summary** to attach numbers to what was seen.
6. Fix a figure with **Observable Overlay** or **Threshold Scenarios** for a report.

## References

<a id="ref-DK2021a"></a>Danisch, S. and Krumbiegel, J. (2021). Makie.jl: flexible high-performance data visualization for Julia. *Journal of Open Source Software* 6(65), 3349. [doi:10.21105/joss.03349](https://doi.org/10.21105/joss.03349)

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-Sch1971a"></a>Schelling, T. C. (1971). Dynamic models of segregation. *Journal of Mathematical Sociology* 1(2), 143–186. [doi:10.1080/0022250X.1971.9989794](https://doi.org/10.1080/0022250X.1971.9989794)

<a id="ref-WR2015a"></a>Wilensky, U. and Rand, W. (2015). *An Introduction to Agent-Based Modeling*. MIT Press.

## See Also

- [Factsheet](factsheet.md) · [Static Plot](static-plot.md) · [Video Animation](video.md) · [Interactive Explorer](interactive.md)
