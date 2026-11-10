# New Article Method — Factsheet

A **Pollis method** is a Julia package made from a published article: the tables the article prints become the package's tests, one test for each printed value, so the code is shown to reproduce what was published.

| | |
|---|---|
| **Purpose** | Turn a method published in an article into a tested Julia package |
| **Input** | The article, its data as links or typed-in tables, and its published tables as targets |
| **Core packages** | [CSV.jl](https://github.com/JuliaData/CSV.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl), [LocalRegistry.jl](https://github.com/GunnarFarneback/LocalRegistry.jl), [PollisTeX.jl](https://github.com/Trumpingtons/PollisTeX.jl) |
| **Steps** | Article and Data, Write a Method, Write a Vignette, Prepare for Registration, Package and Publish |
| **Output** | The package NAME.jl in `~/.pollis/packages`, its tests, its vignette and, if asked, its public repository and its entry in the Pollis registry |
| **Key choice** | How far each target may be off, in units of the last printed digit |

## When to Write a Pollis Method

- **A published method has no working Julia package**, and the article prints results to check the code against.
- **A course or a study needs an estimator exactly as an article defines it**, not a near relative of it.
- **Someone else should be able to reuse the code and trust it**: the tests show which published values it reproduces.

## What a Pollis Method Is Not

A Pollis method is not a notebook and not a one-off replication of an analysis: it is a package others can install. It is not possible without data and expected results, since the printed values are its tests. Its tests are not a proof that the method is right in general, only that it gives the published values on the published data.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
