# Decision Guide

The right view depends on what the picture is for: looking for a problem, understanding a mechanism, or presenting a result.

## Which ABM Visualisation Tab Fits a Purpose

| Purpose | Tab | Why |
|---|---|---|
| A figure for a report or a close comparison | **Static Plot** | Frames can be compared side by side, and printed |
| Showing how a pattern forms | **Video Animation** | Order and motion are visible, and the file can be shared |
| Trying values while watching | **Interactive Explorer** | A slider changes the rule during the run |
| A session with no graphics display | **Video Animation** | It writes a file, and a window is not needed to view the result at once |

## When to Use a Static Figure or an Animation

Use a static figure when the audience must compare states, or when the medium is a page. Use an animation when the sequence of events is the message, and keep it short and slow. [Tversky, Morrison and Betrancourt (2002)](#ref-TMB2002a) suggest that a well-designed set of still frames can often do as well, so a **Multi-Panel Figure** is a good default. A video in a talk adds attention and can explain a mechanism. A video in a paper's supplement adds little unless a reader needs to see the motion itself.

## How to Choose Frames and a Frame Rate for an Agent-Based Run

Choose frames at moments where something changes, using **Animation Summary** to find when most of the change had happened. The default checkpoints of **Multi-Panel Figure** at 0, T / 2 and T are only a start, and they sit poorly if all the change happens early. Choose **Frame rate (fps)** so that a viewer can follow an event, with a low value for a model where few agents act visibly per step. A shorter **Steps (T)** at a lower rate is often clearer than a long, fast film.

## How to Choose Colours and Markers for Agents

Encode only what the question needs. Group identity suits two well-separated colours, and an ordered value such as a share suits a perceptually uniform map. [Crameri, Shephard and Heron (2020)](#ref-CSH2020a) explain why rainbow maps distort ordered values and exclude some readers. Use marker shape for a second property, as **Colour Encoding Check** does with its crosses, and check it remains readable at the final size. Keep one encoding across all figures of a study, as the shared `plotkw` does.

## When a Visualisation Is Not Enough

A picture cannot give a standard error, and cannot show that a pattern holds across seeds. Once a pattern is spotted, measure it with a statistic and repeat across runs, as **Ensemble & Parameter Scanning** does. **Agent-Based Models** provides other spaces and checks when grids do not suit. For a real system, the model must also be compared with data, for which a picture of a simulation is no substitute. [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a) describe the data collection in the same package that serves those later steps.

## References

<a id="ref-CSH2020a"></a>Crameri, F., Shephard, G. E. and Heron, P. J. (2020). The misuse of colour in science communication. *Nature Communications* 11(1), 5444. [doi:10.1038/s41467-020-19160-7](https://doi.org/10.1038/s41467-020-19160-7)

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-TMB2002a"></a>Tversky, B., Morrison, J. B. and Betrancourt, M. (2002). Animation: can it facilitate? *International Journal of Human-Computer Studies* 57(4), 247–262. [doi:10.1006/ijhc.2002.1017](https://doi.org/10.1006/ijhc.2002.1017)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Static Plot](static-plot.md)
