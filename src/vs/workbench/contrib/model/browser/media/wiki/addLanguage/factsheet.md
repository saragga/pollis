# Add a Language: Factsheet

The languages, compilers, inputs, files and actions of Add a Language at a glance.

## Languages and Compilers of Add a Language

| Tab | Compiler | Build command | Races |
|---|---|---|---|
| **C** | GCC, `gcc` or a versioned name such as `gcc-15` | `gcc -O2 -shared -fPIC` | Loop, Vectorised as the loop, Sort with `qsort` |
| **Fortran** | `gfortran`, of GCC | `gfortran -O2 -shared -fPIC` | Loop, Vectorised with array expressions |
| **Rust** | `rustc` | `rustc --edition 2021 --crate-type cdylib -C opt-level=2` | Loop, Vectorised with iterators, Sort with `sort_unstable_by` |

On macOS, the program `gcc` is Apple's clang under another name, so the C tab keeps only a compiler whose `--version` says it is GCC, such as the GCC of Homebrew.

## Installing the Compilers of Add a Language

| Compiler | macOS | Linux | Windows |
|---|---|---|---|
| GCC | `brew install gcc` | The `gcc` package of the distribution | MinGW-w64 |
| gfortran | `brew install gcc`, with GCC | The `gfortran` package of the distribution | MinGW-w64 |
| rustc | rustup, from rustup.rs | rustup, from rustup.rs | rustup, from rustup.rs |

Each compiler must be on the path of the Julia session, which `Sys.which` searches.

## Inputs of Add a Language

| Input | Default | Meaning |
|---|---|---|
| **Race** | Loop | The race of Run a Speed Race the language joins: Loop, Vectorised or Sort |
| **Values** | 100000 | The number of values, made with the seed of Run a Speed Race |
| **Optimisation** | Level 2 | `-O2` or `-O3` for GCC and gfortran, `opt-level` 2 or 3 for rustc |

## Files Written by Add a Language

| File | Where | Content |
|---|---|---|
| The source | `~/.pollis/race/c/race.c`, `~/.pollis/race/fortran/race.f90`, `~/.pollis/race/rust/race.rs` | The races in the language |
| The libraries | The same folders, `race-O<level>-<hash>` with `.so`, `.dylib` or `.dll` | One library for each source and level |

A changed source gets a new library name, because a library already loaded in the Julia session is not loaded again.

## Names Set by the Code of Add a Language

| Name | What it is |
|---|---|
| `race` | The results and times of each language of the race |
| `julia_race` | The Julia function of the race |
| `compiled_function(level)` | The compiled function of the race, built at that level, callable from Julia |
| `compiled_race` | The compiled function at the chosen **Optimisation** |
| `source_file`, `build_command`, `compiler` | The source, the command that builds it and the compiler |

## Actions of Add a Language

| Group | Action | Output |
|---|---|---|
| Visualise | **Bar Chart of Times** | The time of a call in each language of the race |
| Diagnose | **Source and Build Command** | The source, the command and the compiler's version |
| Predict | **Times Across Sizes** | Julia and the compiled language on 1 000 to 1 000 000 values |
| Compare | **Optimisation Levels** | The race built at levels 0 to 3, beside Julia |
| Compare | **Results Digit by Digit** | Each result and its relative difference from Julia's |
| Interpret | **Time per Element** | Nanoseconds a value in each language |

## See Also

- [Overview](overview.md) · [Calling Compiled Code from Julia](calling-compiled-code.md)
