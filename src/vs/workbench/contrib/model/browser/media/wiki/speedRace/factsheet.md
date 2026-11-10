# Run a Speed Race: Factsheet

The races, inputs, timers and actions of Run a Speed Race at a glance.

## Races of Run a Speed Race

| Race | Julia | Python | R |
|---|---|---|---|
| **Loop** | A `for` loop over the vector | A `for` loop over a Python list | A `for` loop over the vector |
| **Vectorised** | `sum(abs2, x .- sum(x) / length(x))` | `np.sum((x - x.mean()) ** 2)`, NumPy | `sum((x - mean(x))^2)` |
| **Sort** | `sort(x)` | `np.sort(x)`, NumPy | `sort(x)` |

**Loop** and **Vectorised** compute the sum of squared deviations from the mean; **Sort** returns the value in the middle of the sorted values.

## Inputs of Run a Speed Race

| Input | Default | Meaning |
|---|---|---|
| **Values** | 100000 | The number of simulated values, made in Julia and copied to Python and R |
| **Repeats** | 5 | How many timings each language makes, of which the fastest is kept |

A larger number of values makes each call longer, so each timing holds fewer calls; the **Loop** race takes the longest in Python and R, whose loops run in their interpreters, and the time of the whole race grows with the number of values and of repeats.

## Timers of Run a Speed Race

| Language | Timer | How a timing is made |
|---|---|---|
| Julia | `@b` of Chairmarks | Its fastest sample, in seconds a call |
| Python | `timeit.Timer`, `autorange` and `repeat` | Enough calls for a fifth of a second, timed **Repeats** times; the fastest, divided by the calls |
| R | `system.time` in a function of the race, `time_min` | Enough calls for a tenth of a second, timed **Repeats** times; the fastest, divided by the calls |

## Packages and Programs Used by Run a Speed Race

| Name | What it does in the race |
|---|---|
| PythonCall.jl | Runs Python code from Julia, with `pyexec`, and converts the results |
| CondaPkg.jl | Installs the Python and the Python packages of the environment, NumPy here |
| RCall.jl | Runs R code from Julia, with `R"..."`, and copies Julia values into R with `$` |
| Chairmarks.jl | Times the Julia code |
| R | Installed on the computer by the user, found by RCall |
| Plots.jl | Draws the charts of the actions |

## Actions of Run a Speed Race

| Group | Action | Output |
|---|---|---|
| Visualise | **Bar Chart of Times** | The time of a call in each language, on a log scale |
| Predict | **Times Across Sizes** | The race on 1 000 to 1 000 000 values, times against sizes on log scales |
| Compare | **Results Digit by Digit** | Each result in full, with its relative difference from Julia's |
| Compare | **Timed Inside and from Julia** | The time of the R function timed by R, and called from Julia with the data copied into R |
| Interpret | **Time per Element** | Nanoseconds a value in each language |

The actions use `race` and `run_race`, which the code of the race tab defines: run the tab's code first.

## Further Reading on Running a Speed Race

The documentation of PythonCall describes `pyexec`, `pyeval` and the conversion of values between Julia and Python, and that of CondaPkg how it installs Python packages. The documentation of RCall describes how it finds R, the `R"..."` string macro and `rcopy`. Python's documentation of `timeit` describes `autorange` and recommends the minimum of repeated timings. Time a Function, in Compose > Profiling, times Julia code alone.

## See Also

- [Overview](overview.md) · [Timing Fairly Across Languages](timing-fairly.md)
