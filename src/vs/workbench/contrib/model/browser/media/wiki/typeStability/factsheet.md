# Check Type Stability: Factsheet

The tabs, inputs, macros and actions of Check Type Stability at a glance.

## Tabs of Check Type Stability

| Tab | Macro | What it reports | Package |
|---|---|---|---|
| **Inferred Types** | `@code_warntype` | The types inferred for the arguments, the local variables and the result, the ones not concrete in colour | InteractiveUtils, Julia's standard library |
| **Runtime Dispatches** | `@report_opt` | Each runtime dispatch in the call and in the functions it calls, with its line | JET.jl |
| **Stability Check** | `@stable` | A warning or an error at each call whose result is inferred to a type that is not concrete | DispatchDoctor.jl |

## Inputs of Check Type Stability

| Input | Default | Meaning |
|---|---|---|
| **Function** | share_above | The function to check, by name; the default gives the share of the values of a vector above a threshold, read from a global variable that is not const, and returns nothing for an empty vector |
| **Arguments** | x | The arguments of the call, as written in it; the checks infer for the types of their values |

With a function of your own, **Stability Check** prints the type inferred for the result, which `@stable` checks, and says where to put `@stable`: before the definition of the function, which is then run again.

## Macros and Functions Used by Check Type Stability

| Name | Package | What it does |
|---|---|---|
| `@code_warntype` | InteractiveUtils | Prints the code of a call with the types inferred |
| `@report_opt` | JET | Reports the runtime dispatches of a call |
| `@test_opt` | JET | A test that fails for each runtime dispatch |
| `JET.get_reports` | JET | The reports of a JET analysis, as a vector |
| `@stable` | DispatchDoctor | Checks the type inferred for the result at each call of the functions it is put before |
| `@descend` | Cthulhu | Shows the code of a call with its types, and descends into the calls it makes |
| `@inferred` | Test | Fails when the type of a result is not the one inferred |
| `Base.return_types` | Base | The types inferred for the result of a function, for given types of its arguments |

## Options of @stable in Check Type Stability

| Option | Default | Meaning |
|---|---|---|
| `default_mode` | `"error"` | `"error"` raises a `TypeInstabilityError`, `"warn"` prints a `TypeInstabilityWarning`, `"disable"` checks nothing |
| `default_union_limit` | 1 | The number of types a `Union` may have and count as stable; 1 counts every `Union` as unstable |
| `default_codegen_level` | `"debug"` | `"debug"` keeps a copy of the function for `@code_warntype`, `"min"` generates one body |

The **Stability Check** tab sets `default_mode="warn"`, so that the call warns and returns its result.

## Actions of Check Type Stability

| Group | Action | Output |
|---|---|---|
| Visualise | **Flame Graph of Dispatches** | The flame graph of 200 calls, in a tab of Pollis, with the frames of runtime dispatches in red |
| Diagnose | **Result Type** | The type inferred for the result, and whether it is concrete |
| Diagnose | **Descend with Cthulhu** | Cthulhu in the Julia REPL, on the call: the code with its types, and each call within it |
| Compare | **Before and After a Change** | The result type and the number of runtime dispatches of the function and of a changed version, `other`, and whether they give the same result |
| Interpret | **Test Type Stability** | A test set with `@inferred` and `@test_opt` |

**Before and After a Change** defines `other` for the default function only; with a function of your own, `other` is your changed version of it. **Descend with Cthulhu** takes over the REPL until `q` is pressed.

## Further Reading on Type Stability

The Performance Tips of the Julia manual describe type stability and its common causes, and the documentation of JET, DispatchDoctor and Cthulhu describes their macros, options and reports. Cthulhu relies on the internals of Julia's compiler, and its documentation says that its behaviour may change with the version of Julia. Find Allocations, in Compose > Profiling, shows the allocations that boxed values add, and Speed Up a Function takes a function through a diagnosis, a faster version and a comparison.

## See Also

- [Overview](overview.md) · [Common Causes of Type Instability](common-causes.md)
