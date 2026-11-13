# Typed Structs

The **Typed Structs** tab of the JSON Files panel reads a nested JSON document into Julia structs with JSON.jl ([JuliaIO Contributors (2026)](#ref-JIOC2026a)). The structs describe the document's shape, and JSON.jl checks every field against it as it reads.

## How Do I Read JSON into Julia Structs?

```julia
using JSON

struct Day
	day::Int
	ozone::Union{Missing, Int}
end
struct Month
	month::Int
	days::Vector{Day}
end

months = JSON.parse(text, Vector{Month})   # or JSON.parsefile(path, T)
```

A struct field takes the value of the key of the same name, and a field whose type is a struct or a vector of structs reads the object or array below it. The order of the keys in the file does not matter.

## What Happens to null and to Missing Keys in Typed Parsing?

A JSON `null` read into a field of type `Union{Missing, T}` becomes `missing`, and into `Union{Nothing, T}` becomes `nothing`; into a field that allows neither, `null` stops the reading with an error. A key the struct has no field for is skipped. Keys absent from the file are filled by the defaults that the `@defaults` macro of JSON.jl declares, or stop the reading when there are none.

## Why Read JSON into Structs Instead of Dictionaries?

Without a type, `JSON.parsefile(path)` returns `JSON.Object` values, ordered dictionaries in which every value has type `Any`. Code on them is slow, since Julia cannot know the types, and a misspelt key gives `nothing` far from the cause. Structs give fields with concrete types, fast code, and an error at reading time when the document does not have the expected shape. For a document too irregular for structs, `JSON.lazy` reads only the parts that are asked for.

## References

<a id="ref-JIOC2026a"></a>JuliaIO Contributors (2026). JSON.jl: JSON parsing and printing. [github.com/JuliaIO/JSON.jl](https://github.com/JuliaIO/JSON.jl)

## See Also
- [Flatten](flatten.md) · [File Format](file-format.md) · [Write](write.md)
