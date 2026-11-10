# Check Type Stability: Overview

Check Type Stability finds where Julia cannot infer the types of a function's values from the types of its arguments, with three checks: **Inferred Types**, by `@code_warntype`; **Runtime Dispatches**, by JET; and **Stability Check**, by DispatchDoctor. The example, `share_above`, is unstable on purpose, in two ways.

## What Is Type Stability in Julia?

Julia compiles a function separately for each combination of the types of its arguments. When, from those types alone, the compiler can infer one concrete type for each variable of the function and for its result, the function is type stable, and the compiled code works directly on values of those types. When it cannot, a variable is given a `Union` of several types or an abstract type such as `Any`, and the compiled code must check the type of the value while it runs and choose the method to call for it, a dynamic or runtime dispatch. The Performance Tips of the Julia manual describe writing type-stable functions as one of the main ways to make Julia code fast.

## Why Does Type Instability Make Code Slower?

A call whose method Julia chooses while the code runs looks up the method for the actual types of its arguments each time it is made, which takes far longer than a call compiled for known types. A value of a type not known in advance is usually boxed, put in a heap object that also records its type, which allocates memory. Code that follows from an unstable value inherits its unknown type, so the instability spreads to the calls that use it. A small `Union`, such as `Union{Nothing, Float64}`, is often handled by the compiler with a branch for each type, at little cost; an abstract type such as `Any` is the costly case. Find Allocations shows the allocations boxing adds.

## What Do the Three Tabs of Check Type Stability Show?

**Inferred Types** runs `@code_warntype`, of Julia's standard library InteractiveUtils, which prints the types of the arguments, of the local variables and of the result, the **Body**, as the compiler infers them for the call, in colour when they are not concrete. **Runtime Dispatches** runs `@report_opt` of JET, which analyses the call and the functions it calls and reports each runtime dispatch with its line and the chain of calls that leads there, or prints that no errors were detected. **Stability Check** defines the function with DispatchDoctor's `@stable` before it, and then calls it: the call warns, or raises an error, when the type inferred for the result is not concrete.

## How Do the Three Checks of Check Type Stability Differ?

`@code_warntype` shows one function, the one called, with every type it infers: a variable of type `Any` is visible even when it is never used in a call. JET's `@report_opt` looks at the function and at every function it calls, and reports only the places where the instability forces a runtime dispatch; a small `Union` that the compiler handles with branches is not reported. DispatchDoctor's `@stable` checks only the type of the result, and does so at each call, in the code as it runs: its documentation describes it as ensuring that the return type of the function is concrete. In the example, `@code_warntype` shows both faults, JET the comparison with the global variable, and `@stable` the result that can be `nothing`.

## How Does Check Type Stability Keep a Function Stable?

The **Test Type Stability** action of Check Type Stability writes a test set that can go in the tests of a package or at the end of a notebook. `@inferred`, of Julia's Test, calls the function and fails when the type of its result is not the type the compiler inferred; `@test_opt`, of JET, fails for each runtime dispatch that `@report_opt` would report. DispatchDoctor's `@stable` keeps the check in the code itself: with `default_mode="warn"` each unstable call prints a `TypeInstabilityWarning`, and with the default mode, `"error"`, it raises a `TypeInstabilityError`. Its documentation describes a union limit, `default_union_limit`, whose default of 1 counts every `Union` as unstable.

## See Also

- [Factsheet](factsheet.md) · [Common Causes of Type Instability](common-causes.md)
