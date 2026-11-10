# Find Allocations: Factsheet

The tabs, inputs, functions and actions of Find Allocations at a glance.

## Tabs of Find Allocations

| Tab | Report | What it shows | Package |
|---|---|---|---|
| **By Line** | `Profile.print(..., format = :flat)` of `Profile.Allocs.fetch()` | Each line of code with the bytes allocated at it and in what it calls | Profile, Julia's standard library |
| **By Type** | The allocations of `Profile.Allocs.fetch()` grouped by type | Each type allocated, with its number of allocations and bytes | Profile, Julia's standard library |
| **Possible Allocations** | `check_allocs` | Each place the compiled code may allocate or dispatch at run time, with its line | AllocCheck.jl |

## Inputs of Find Allocations

| Input | Default | Meaning |
|---|---|---|
| **Function** | rolling_mean | The function whose allocations are found, by name; the default takes the mean of each window of a series, copying each window and growing its result |
| **Arguments** | x, 20 | The arguments of the call, as written in it; the default is a simulated series of 10 000 values and windows of 20 values |
| **Sample Rate** | 1 | The share of the allocations recorded, from 0 to 1, **By Line** and **By Type** only |

## Functions and Macros Used by Find Allocations

| Name | Package | What it does |
|---|---|---|
| `Profile.Allocs.@profile` | Profile | Records the allocations of an expression, the share set by `sample_rate` |
| `Profile.Allocs.fetch` | Profile | The allocations recorded, each with its `type`, `size` and `stacktrace` |
| `Profile.Allocs.clear` | Profile | Empties the record of allocations |
| `Profile.print` | Profile | The flat or tree report of the allocations, in bytes |
| `@profview_allocs` | Pollis' Julia REPL | Records the allocations of an expression and shows their flame graph |
| `@allocations`, `@allocated` | Base | The number of allocations and the bytes of one evaluation |
| `check_allocs` | AllocCheck | The places a function may allocate, for given types of its arguments |
| `@check_allocs` | AllocCheck | Defines a function that raises an `AllocCheckFailure` at its call when it may allocate |

## Results of AllocCheck in Find Allocations

| Result | What it is |
|---|---|
| `AllocationSite` | A place where the code allocates an object, with its type and line |
| `DynamicDispatch` | A call whose method is chosen while the code runs, with the function called and its line |
| `AllocatingRuntimeCall` | A call into Julia's runtime that allocates, with its name and line |
| `AllocCheckFailure` | The error of a function defined with `@check_allocs`, the places found in its field `errors` |

## Actions of Find Allocations

| Group | Action | Output |
|---|---|---|
| Visualise | **Allocation Flame Graph** | A flame graph of the bytes allocated, every allocation recorded, in a tab of Pollis |
| Diagnose | **Allocations per Call** | The allocations and bytes of one call, measured inside a function |
| Diagnose | **Dynamic Dispatches** | The `DynamicDispatch` results of `check_allocs`, each with its line |
| Compare | **Before and After a Change** | Allocations and bytes of the function and of a changed version, `other`, and whether they give the same result |
| Interpret | **Check No Allocations** | Nothing may allocate, or each place that may, by `@check_allocs` |

**Before and After a Change** defines `other` for the default function only, and **Check No Allocations** checks `rolling_mean!` for it; with a function of your own, `other` is your changed version of it.

## Further Reading on Allocations

The chapter on profiling of the Julia manual describes `Profile.Allocs` and its sample rate, and its Performance Tips describe the common causes of allocations: global variables, types that change, slices that copy and arrays made in loops. The documentation of AllocCheck describes `check_allocs`, `@check_allocs` and the keyword `ignore_throw`, and the limits of a static check. Speed Up a Function, in Compose > Profiling, takes the changes these sources describe through a diagnosis, a faster version and a comparison.

## See Also

- [Overview](overview.md) · [Heap, Stack and Garbage Collection](heap-stack-gc.md)
