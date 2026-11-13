# Translate Julia to Rust: From Julia to Rust

How the parts of a Julia function become Rust in Translate Julia to Rust: types of fixed size, counting from 0, Julia's column order, slices over memory Julia owns, and the Julia code that does not translate as it is. [Klabnik and Nichols (2023)](#ref-KN2023a) is the reference for the Rust these sections use.

## How Do the Types of a Julia Function Become Rust Types?

A Julia function is usually written without types, and Julia compiles a version of it for the types of the arguments of each call. A Rust function names a type for every argument and every result, and the function Julia calls through a C library must use types that both languages lay out in memory in the same way. Floating-point numbers become `f64` for `Float64`, and integers keep their size: `i64` for `Int64`, `i32` for `Int32`. In the example, `escape_time` of Julia, generic in its arguments, becomes `fn escape_time(zr: f64, zi: f64, cr: f64, ci: f64, maxiter: i32) -> i32` in Rust, the types Julia infers for the call `fractal_counts` makes. A `Bool` crosses as an `i32` tested with `!= 0`, and a complex number as its two parts, since C has no type that both languages share for it.

## Why Does the Rust Version Count from 0?

Julia counts the elements of an array from 1 and Rust from 0. A loop `for j in 1:width` in Julia becomes `for j in 0..width` in Rust, where `0..width` stops before `width`, and every formula that uses the index has to move by one. In the example, the real part of a pixel is `x0 + (j - 1) * spacing` in Julia and `x0 + j as f64 * spacing` in Rust: the same number, as `j` is one less in Rust. The `as f64` is explicit because Rust converts no integer to a floating-point number on its own, where Julia converts `j - 1` to a `Float64` when it multiplies it by `spacing`. A translation that forgets the shift reads the element next to the one meant, or past the end.

## How Does a Julia Matrix Look from Rust?

Julia stores a matrix column by column: the elements of the first column, then those of the second, and so on. A Rust function that receives the matrix's pointer sees one run of `height * width` values in that order, with no rows and columns of its own, so element `(i, j)` of Julia is at `(i - 1) + (j - 1) * height` in Rust, counted from 0. In the example, `fill_counts` turns the pointer into a slice with `std::slice::from_raw_parts_mut(counts, (height * width) as usize)` and writes pixel `(i, j)` at `i + j * height`, where `i` and `j` already count from 0. The loop over `i`, down a column, is the inner one in both languages, so that both write the memory in the order it is laid out.

## What Does unsafe Mean in the Rust Version?

Rust checks at compile time that every reference points at valid memory and that no two references can change the same memory at once. A pointer received from Julia carries none of that knowledge, so turning it into a slice is an `unsafe` operation: the code promises what the compiler cannot check, that the pointer is valid for `height * width` values of `i32` and that nothing else writes them during the call. The example marks `fill_counts` as `pub unsafe extern "C" fn`, writes the promise in a `# Safety` section of its documentation comment, and keeps the `unsafe` block to the one line that makes the slice. Everything after that line is safe Rust: the slice knows its length, and an index past its end stops the program rather than writing beyond the matrix.

## What Does Not Translate from Julia to Rust as It Is?

Some Julia code has no direct counterpart in a function that a C library exports. Multiple dispatch on many argument types becomes one Rust function for each combination of types used, or a Rust generic function exported once for each. Values whose size is not fixed, such as `String`, `BigFloat` or arrays of arrays, need a layout agreed on both sides, or stay in Julia. Arrays created inside a loop can usually be allocated once by Julia and passed in. Calls to Julia packages have to be replaced by Rust crates that compute the same thing, or by Rust code written for the purpose, which changes what has to be checked. Translate with Agent names such parts in its plan, before it writes any code.

## References

<a id="ref-KN2023a"></a>Klabnik, S. and Nichols, C. (2023). *The Rust Programming Language*, 2nd ed. San Francisco: No Starch Press. [doc.rust-lang.org/book](https://doc.rust-lang.org/book/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Calling Rust from Julia](calling-rust.md) · [The Same Result in Rust](same-result.md)
