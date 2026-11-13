# Compile Julia to a Shared Library: Trimming and What It Leaves Out

What the option `--trim` of Julia and juliac keeps and removes, the code it cannot compile, and how a function is written so that it trims, as `fill_counts` is in the **JuliaC** tab of Compile Julia to a Shared Library.

## What Does Trimming Do?

A Julia system image normally holds everything a session might need: Base, the standard libraries loaded, and the compiler, so that new code can be compiled while the program runs. Trimming builds instead an image with only the code that can be reached from its entry points, the methods a program or a library starts from. The Julia developer documentation describes `--trim` as tracing calls from those entry points: when the types of every call are known, the set of methods needed is complete and usually small, and everything else is left out. In the **JuliaC** tab, `--compile-ccallable` makes `fill_counts`, marked with `Base.@ccallable`, an entry point, and `--trim=safe` keeps `fill_counts`, `escape_time` and the few methods of Base they call. A trimmed library cannot compile new code when it runs, so everything it will ever call has to be compiled in advance.

## What Are the Modes of --trim?

The Julia command line takes `--trim=no`, the default, `--trim=safe`, `--trim=unsafe` and `--trim=unsafe-warn`. The three modes that trim differ in what they do with a call too dynamic for the compiler to know which method it reaches. In `safe` mode such a call is an error at compile time, which shows where the call is. In `unsafe` mode the build goes on, and the library or program may then lack code it needs and fail when it runs. `unsafe-warn` goes on as well, with a warning at compile time for each such call. The **JuliaC** tab uses `--trim=safe`, so that a library either builds with all the code it needs or does not build at all. The Julia documentation presents the unsafe modes as being for testing.

## Which Code Cannot Be Trimmed?

Code whose types the compiler cannot infer: a call on a value whose type is known only when the program runs reaches a method chosen at that moment, which trimming cannot foresee. Global variables that are not constant are a common case, and the Julia documentation names `stdin`, `stdout` and `stderr` among them: printing from trimmed code should use an output stream of known type, such as `print(Core.stdout, x)`. Code that uses reflection, such as `eval`, or that builds types and calls from values at run time, is also out of reach. The documentation suggests JET.jl, Cthulhu.jl and SnoopCompile to find failures of type inference, and the Performance Tips of the Julia manual to fix them. `fill_counts` passes because every value in it has a type known from its arguments.

## How Is a Function Written So That It Trims?

Trimming expects concrete entry points: functions whose argument and result types are all given, as `Base.@ccallable` requires for `fill_counts`. Inside, the function should be type-stable, every variable keeping one type, and should call only functions whose types follow from their arguments. `escape_time` in Compile Julia to a Shared Library counts in the type of `maxiter`, starting at `zero(maxiter)`, so its result is always an `Int32`; `fill_counts` sums pixels inside into an `Int64` and writes counts of a known type through a typed pointer. The Julia documentation adds that type-stability tests such as `@inferred` and `JET.@report_call` are about as close as a package can get to checking that its code trims, as trimming depends on the entry points a program chooses.

## What Changes Between Versions of Julia?

Trimming is new in Julia 1.12 and marked experimental, which is why the **JuliaC** tab passes `--experimental`. The Julia developer documentation says that some changes to Base that make more programs trimmable would break other code, so they are applied only when trimming is asked for, through the build script that juliac runs. It also says that a program that trims with one version of Julia is not guaranteed to trim with every later version, although such breakage is expected to be rare, and it recommends continuous integration that builds the trimmed program and tests it. A library of the **JuliaC** tab is rebuilt in a new folder for each new Julia version, as the folder's name includes it.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Libraries with and without a Runtime](runtimes.md) · [Shipping a Library](shipping.md)
