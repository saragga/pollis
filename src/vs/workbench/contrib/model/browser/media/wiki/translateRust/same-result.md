# Translate Julia to Rust: The Same Result in Rust

Why the Rust version of the example of Translate Julia to Rust gives the same count as Julia at every pixel, what could make a translation differ, and how **Compare** checks it.

## Why Do Julia and Rust Give the Same Counts?

Julia's `Float64` and Rust's `f64` are the same IEEE 754 double, and each of the operations of the iteration, a multiplication, an addition, a subtraction, a comparison, is rounded in the same way in both languages. The two versions of `escape_time` perform the same operations on the same numbers in the same order: `zr2 = zr * zr`, `zi2 = zi * zi`, the test `zr2 + zi2 > 4.0`, then `zi = 2.0 * zr * zi + ci` and `zr = zr2 - zi2 + cr`. The coordinates of each pixel are computed in the same way, `x0 + (j - 1) * spacing` in Julia and `x0 + j as f64 * spacing` in Rust, from the same `Float64` values that `@ccall` passes unchanged. Every intermediate value is therefore the same bit for bit, and so is the number of iterations before a pixel escapes.

## Can the Compiler Change the Order of Operations?

An optimising compiler may rewrite arithmetic only in ways that keep the result, unless it is told it may do more. One rewrite that changes results is fusing a multiplication and an addition into one fused multiply-add, which rounds once instead of twice. Rust never fuses them on its own: a fused multiply-add happens only where the code calls `mul_add`. Julia does not fuse them either, unless the code asks with `muladd`, `fma` or `@fastmath`. The compiler of neither language reorders a sum of floating-point numbers unless told to, so a translation that keeps the order of the original keeps its result. A translation that writes `a.mul_add(b, c)` for `a * b + c`, or adds the terms of a sum in another order, can change the last bits, and over many iterations the count of a pixel near the edge of a set.

## What Happens When an Integer Overflows in Rust?

Julia's integers wrap around silently when they overflow: `typemax(Int32) + Int32(1)` is `typemin(Int32)`. Rust does the same in a build made with `--release`, but a debug build, which `cargo build` without `--release` makes, stops the program with a panic at the overflow. A translation that relies on Julia's wrapping, as some hash functions and random number generators do, should say so with Rust's `wrapping_add` and its relatives, which wrap in every build. The example has no overflow to fear: its counter stops at `maxiter`, an `i32`, and the index `i + j * height` is an `i64` far from its limit for any picture that fits in memory.

## How Does Compare Check That the Results Are the Same?

**Compare** calls the original and the Rust version with the arguments of step 1 and keeps their results, `before_result` and `after_result`. It counts them as the same when `isequal` holds, or when `isapprox` applies to them and holds: equal within a relative tolerance of the square root of the machine epsilon of their type. For the example, both results are matrices of `Int32`, so `isequal` compares every count, and the line printed says whether all of them agree. A translation of a function whose operations had to change order, such as a sum computed in parallel, can pass with `isapprox` though not with `isequal`; a result that fails both is reported as different, to be looked into before the times, as a faster function with another answer is not the same function.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [From Julia to Rust](julia-to-rust.md) · [Calling Rust from Julia](calling-rust.md)
