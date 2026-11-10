# Check Type Stability: Common Causes of Type Instability

The causes of type instability that the checks of Check Type Stability most often find, each with the way the Performance Tips of the Julia manual describe to remove it.

## Why Does Reading a Non-Constant Global Make a Function Unstable?

A function that reads a global variable not declared `const` is compiled without knowing the type of its value, since any later assignment may change it. The compiler gives the value the type `Any`, and every call that uses it, such as the comparison `v > threshold` of the example of Check Type Stability, becomes a runtime dispatch, which **Runtime Dispatches** reports with its line. Passing the value to the function as an argument makes its type part of the types the function is compiled for. A global declared `const`, or a global with a declared type, `threshold::Float64 = 0.5`, also lets the compiler know its type. **Inferred Types** shows the global as `Any` in the code of the function.

## Why Is a Function That Returns Different Types Unstable?

A function whose result can be of more than one type, such as `nothing` for an empty input and a `Float64` otherwise, has its result inferred as a `Union` of those types. Every caller then works with a value of a type it does not know in advance. The compiler handles a small `Union` with a branch for each of its types, so the cost is often small, but the caller's own result may become unstable in turn. Returning a value of the same type in every case, such as `NaN` for an empty input of floating-point numbers, or raising an error for an input the function cannot handle, keeps the result concrete. DispatchDoctor's `@stable`, in **Stability Check**, flags such a result by default.

## Why Does a Variable That Changes Type Make a Loop Slower?

A variable given a value of one type and later a value of another, such as a sum started at the integer `0` and added to floating-point numbers, has a `Union` type throughout the function, so each use of it inside a loop must check which type it holds. `@code_warntype`, in **Inferred Types**, shows the variable in colour with its `Union` type. Starting the variable at a value of the type it will keep, such as `zero(eltype(x))` or `0.0`, or converting the values added to it, gives it one type. The same holds for a variable assigned in different branches of an `if`: each branch should assign a value of the same type.

## Why Do Containers and Fields of Abstract Types Cause Instability?

An array whose element type is abstract, such as `Vector{Any}` or `Vector{Real}`, holds each element as a reference to a boxed value, and code that reads an element does not know its type: each operation on it is a runtime dispatch. A struct whose field is declared with an abstract type, or with no type, has the same problem for that field. Arrays with a concrete element type, such as `Vector{Float64}`, and struct fields with concrete types, or with type parameters, `struct Point{T<:Real}; x::T; end`, keep the types known. An array built by `[]` and then filled with `push!` is a `Vector{Any}`; `Float64[]` gives it its element type from the start.

## When Does a Closure Cause Type Instability?

A closure, an anonymous function or an inner function that uses a variable of the function that defines it, keeps that variable in a box when the variable is assigned again after the closure is made, since the closure and the function share it. The type of a boxed variable is not inferred, so code that reads it, in the closure or after it, becomes unstable, and `@code_warntype` shows the variable as `Core.Box`. The Performance Tips of the Julia manual describe this case and suggest assigning such a variable only once, or wrapping the value in a `let` block that gives the closure its own copy. Cthulhu's `@descend`, in **Descend with Cthulhu**, follows a call into the closure to see its own types.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
