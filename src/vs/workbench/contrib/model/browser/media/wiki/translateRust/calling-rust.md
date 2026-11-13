# Translate Julia to Rust: Calling Rust from Julia

How the crate of Translate Julia to Rust becomes a library that Julia can open, how `@ccall` passes the arguments and the memory, what happens when the Rust code fails, and why a rebuilt library needs a new Julia session.

## What Does a Crate Built as a cdylib Give Julia?

cargo builds a crate as a Rust library by default, made for other Rust crates. The line `crate-type = ["cdylib"]` in the `[lib]` section of `Cargo.toml` asks for a C dynamic library instead: a file that any language able to call C can open, with the functions the crate exports and the parts of the Rust standard library they use, and no dependency on Rust being installed. cargo writes it to `target/release` after `cargo build --release`, under the system's name for such a library: `libfractal.dylib` on macOS, `libfractal.so` on Linux and `fractal.dll` on Windows, for a crate named `fractal`. The **Build** step of Translate Julia to Rust builds the example's crate this way and points `fractal_library` at the file, with `Libdl.dlext` for the extension of the system it runs on.

## What Do no_mangle and extern "C" Do?

Rust changes the names of its functions in the compiled library, so that functions of the same name in different modules stay apart, and passes arguments in a way of its own that may change between versions of the compiler. A function meant for other languages turns both off. `#[unsafe(no_mangle)]` keeps its name as written, `fill_counts`, which `@ccall` looks for; in the 2024 edition of Rust the attribute is written inside `unsafe(...)`, since two exported functions with the same name could clash. `extern "C"` makes the function take its arguments and return its result as a C function does on the same system, which is what `@ccall` expects. The signature in Rust and the types in the `@ccall` have to agree one by one, as no tool checks them across the two languages.

## How Does @ccall Pass the Arguments and the Memory?

`@ccall fractal_library.fill_counts(counts::Ptr{Int32}, height::Int64, ...)::Cvoid` names the library, the function, the type of each argument and of the result. Julia converts each argument to the type written: an `Int` to `Int64`, the `Bool` `julia_set` to `Int32`, and the matrix `counts` to a pointer to its first element. The matrix stays alive and in place until the call returns, so the Rust code may write into it, but it must not keep the pointer for later. The memory belongs to Julia: Julia allocated it, and its garbage collector frees it once nothing refers to the matrix, never Rust. This is why the Julia function of the example allocates the matrix itself, calls Rust to fill it, and returns it as a Julia `Matrix{Int32}`.

## What Happens When the Rust Code Fails?

A Rust program that meets an error it cannot handle, such as an index past the end of a slice, panics: it stops the current work and unwinds. A panic must not unwind into the frames of Julia, which do not know how to handle it, and since Rust 1.81 a panic that reaches the edge of an `extern "C"` function aborts the whole process instead, with a message. For a call from the Julia REPL that means the Julia session ends. A Rust function meant to be called from Julia therefore checks its inputs, or is given inputs that cannot fail, as `fill_counts` is given a matrix of exactly `height * width` values. An error that the caller should handle is better returned as a number, a code that the Julia function turns into a Julia error.

## Why Does a Rebuilt Library Need a New Julia Session?

The first `@ccall` into a library opens it, and Julia keeps it open and remembers the address of each function it called. A library rebuilt by cargo after a change to `src/lib.rs` is a new file on disk, but the Julia session still calls the code it loaded, and the change does not show. The simplest way to call a new build is a new Julia session: **Build** and **Compare** then open the new library. A change to the Julia function that calls Rust, on the other hand, takes effect as soon as it is defined again, as any Julia function does.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [From Julia to Rust](julia-to-rust.md) · [The Same Result in Rust](same-result.md)
