# Factsheet

**ABM Visualisation** draws an agent-based model with `Agents.jl` and `GLMakie.jl`, using a Schelling grid as its example. Each tab gives a different view of the same model.

## What the ABM Visualisation Panel Does

| Item | Detail |
|---|---|
| Purpose | Draw a run as frames, a video or a live dashboard, and link the picture to measures |
| Julia stack | `Agents.jl` for the model and the drawing functions, `GLMakie.jl` for rendering, `Tables.jl` for plain columns |
| Tabs | **Static Plot**, **Video Animation**, **Interactive Explorer** |
| Input shape | No data: inputs set the model, and the code generates the residents |
| Recorded measures | `segregation`, the mean same-group neighbour share, and `share_happy` |
| Output | A figure window, an MP4 in the working directory, or a live window |

## How the Tabs of the ABM Visualisation Panel Differ

| Tab | Function | Result | Uses **Steps (T)** | Needs a window |
|---|---|---|---|---|
| **Static Plot** | `abmplot!` | Two frames, at step 0 and step T | Yes | To view it |
| **Video Animation** | `abmvideo` | MP4 of T + 1 frames | Yes | No |
| **Interactive Explorer** | `abmexploration` | Live grid, slider and curves | Only in Next Steps | Yes |

## What the Inputs of the ABM Visualisation Panel Default To

| Input | Default | Role |
|---|---|---|
| **Steps (T)** | 50 | Length of the run, and frames in a video |
| **Grid Side** | 20 | Cells along each side, with no wraparound |
| **Density** | 0.9 | Share of occupied cells, split between two groups |
| **Threshold** | 0.3 | Minimum same-group share for a resident to be happy |
| **Seed** | 42 | Starting layout and model generator |
| **Frame rate (fps)** | 10 | Frames per second, videos only |
| **Output file** | `schelling.mp4` | Name of the video, which must end in `.mp4` |

## Which Encodings the ABM Visualisation Panel Uses

`plotkw` holds one encoding for every view: `agent_color = groupcolor`, `agent_marker = :rect` and `agent_size = 12`. Group 1 is steel blue and group 2 dark orange, and empty cells are left blank. Colours and markers are ordinary functions of an agent, so they can test any field. **Colour Encoding Check** changes unhappy residents to crosses, and **Colour Schemes** recolours the same grid by group, by happiness and by the same-group share. The marker size is a fixed value, and may need changing with **Grid Side**.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
