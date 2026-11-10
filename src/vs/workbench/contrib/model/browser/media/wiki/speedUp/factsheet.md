# Speed Up a Function: Factsheet

The steps, inputs, diagnoses, macros and files of Speed Up a Function at a glance.

## Steps of Speed Up a Function

| Step | What it runs in the Julia REPL | Package |
|---|---|---|
| **The Function** | The example's data and `slow_var`, then the call; with a function of your own, the call alone | Base Julia |
| **Diagnose** | Type Stability, Allocations or Profile, as chosen | JET.jl, BenchmarkTools.jl, the Julia extension |
| **Change** | The faster version of the example, `fast_var`; with a function of your own, nothing: you write the faster version, or Speed Up with Agent does | Base Julia |
| **Compare** | The results of both versions checked, then a benchmark of each and `judge` | BenchmarkTools.jl |

## Inputs of Speed Up a Function

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Function** | The Function | slow_var | The function to speed up, by name; a name of a module, `MyModule.f`, is allowed |
| **Arguments** | The Function | x | The arguments of the call, as written in it, on one line |
| **Faster Version** | Change | fast_var | The name of the changed version, other than the function's |

The **Run** button of a step is off while the names are not Julia names, and the Run buttons of **Change** and **Compare** and Speed Up with Agent are off while the faster version has no name of its own.

## Diagnoses of the Diagnose Step

| Diagnosis | Code | What to look for |
|---|---|---|
| **Type Stability** | `@code_warntype` and `@report_opt` of JET | Variables inferred as a `Union` or `Any`, in colour; calls resolved at run time, each with where it is |
| **Allocations** | `@ballocations` and `@ballocated` of BenchmarkTools | How many times one call allocates on the heap, and how many bytes |
| **Profile** | `@profview` of five calls, after a first one | The widest frames at the top edge of the flame graph, in a tab of Pollis |

## Macros and Functions Used by Speed Up a Function

| Name | Package | What it does |
|---|---|---|
| `@code_warntype` | InteractiveUtils | The types inferred for the variables of a call |
| `@report_opt` | JET | Each call of the code that Julia resolves only at run time |
| `@ballocations` | BenchmarkTools | The allocations of one call, with the arguments interpolated |
| `@ballocated` | BenchmarkTools | The bytes allocated by one call |
| `@profview` | Pollis' Julia REPL | Profiles an expression and shows its flame graph |
| `@benchmark` | BenchmarkTools | A trial: the times and memory of every sample |
| `judge` | BenchmarkTools | Improvement, regression or invariant, between two estimates |

## Files of Speed Up with Agent

| File | Written by | When |
|---|---|---|
| `~/.pollis/speedup/slow_var.jl` | Pollis | Before the agent starts, for the example only: its data and `slow_var` |
| The faster version's file, named after it, beside the function's | The coding agent | Once the user has agreed to its plan |

The function's own file is never changed. The faster version's file starts with a comment that lists each change and the reason for it. Include it in the Julia REPL with `include` before the **Compare** step.

## Further Reading on Comparing Two Versions

| Topic | Source |
|---|---|
| The strategy of BenchmarkTools, and the minimum as an estimate | [Chen and Revels (2016)](#ref-CR2016a) |
| Repetitions and confidence intervals for comparing two systems | [Kalibera and Jones (2013)](#ref-KJ2013a) |

The Performance Tips of the Julia manual describe the changes of Common Ways to Speed Up Julia Code, and the documentation of JET describes the reports of `@report_opt` and how to filter them by module.

## References

<a id="ref-CR2016a"></a>Chen, J. and Revels, J. (2016). Robust benchmarking in noisy environments. [arXiv:1608.04295](https://arxiv.org/abs/1608.04295)

<a id="ref-KJ2013a"></a>Kalibera, T. and Jones, R. (2013). Rigorous benchmarking in reasonable time. In *Proceedings of the 2013 International Symposium on Memory Management*, 63–74. [doi:10.1145/2464157.2464160](https://doi.org/10.1145/2464157.2464160)

## See Also

- [Overview](overview.md) · [Common Ways to Speed Up Julia Code](common-fixes.md)
