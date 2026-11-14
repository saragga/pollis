# Typed Structs

The **Typed Structs** tab of the JSON Files panel reads a nested JSON document with JSON.jl ([JuliaIO Contributors (2026)](#ref-JIOC2026a)) and turns it into Julia structs with StructUtils.jl ([Quinn (2026)](#ref-Qui...2026a)). The structs describe the document's shape, and StructUtils.jl checks every field against it as it builds them.

## How Do I Read JSON into Julia Structs?

```julia
using JSON, StructUtils

struct Day
	day::Int
	ozone::Union{Missing, Int}
end
struct Month
	month::Int
	days::Vector{Day}
end

months = StructUtils.make(Vector{Month}, JSON.parsefile(path))
```

`JSON.parsefile` reads the file into dictionaries and vectors, and `StructUtils.make` builds the structs from them. A struct field takes the value of the key of the same name, and a field whose type is a struct or a vector of structs is built from the object or array below it. The order of the keys in the file does not matter, and a key the struct has no field for is skipped. The same two calls work with every version of JSON.jl, including 0.21, which other packages, such as Gadfly, still require.

## What Happens to null and to Missing Keys in Typed Parsing?

A JSON `null` read into a field of type `Union{Missing, T}` becomes `missing`, and into `Union{Nothing, T}` becomes `nothing`; into a field that allows neither, `null` stops the reading with an error, as does a value of the wrong type, such as text for an `Int`. A key absent from the document gives `missing` to a field that allows it. Other fields take the defaults that the `@defaults` macro of StructUtils.jl declares, as in `StructUtils.@defaults struct Day ... temp::Int = 0 end`, and with no default an absent key stops the reading with an error that names the field.

## Why Read JSON into Structs Instead of Dictionaries?

Without a type, `JSON.parsefile(path)` returns dictionaries in which every value has type `Any`. Code on them is slow, since Julia cannot know the types, and a misspelt key gives an error or `nothing` far from the cause. Structs give fields with concrete types, fast code, and an error at reading time when the document does not have the expected shape. JSON.jl 1.0 and later also read a file straight into a type, `JSON.parsefile(path, T)`, with StructUtils.jl doing the same work underneath, and `JSON.lazy` reads only the parts of a large document that are asked for.

## References

<a id="ref-JIOC2026a"></a>JuliaIO Contributors (2026). JSON.jl: JSON parsing and printing. [github.com/JuliaIO/JSON.jl](https://github.com/JuliaIO/JSON.jl)

<a id="ref-Qui...2026a"></a>Quinn, J. (2026). StructUtils.jl: Macros to enhance struct definitions and tools to convert between different data representations. [github.com/JuliaServices/StructUtils.jl](https://github.com/JuliaServices/StructUtils.jl)

## See Also
- [Flatten](flatten.md) · [File Format](file-format.md) · [Write](write.md)
