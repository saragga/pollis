# Julia Functions in DuckDB: Writing a DuckDB Extension in Rust

How the Rust Extension tab of Julia Functions in DuckDB builds a DuckDB extension: the crate [duckdb-neo](#ref-DDBL2026a), the entry point, the signature, the metadata at the end of the file, and how DuckDB 2.0.0 and other programs load an extension that DuckDB has not signed. [Klabnik and Nichols (2023)](#ref-KN2023a) is the reference for the Rust.

## What Is a DuckDB Extension?

A DuckDB extension is a shared library that DuckDB opens while it runs, which adds functions, types, file formats or settings to the database that loads it. DuckDB's own extensions, such as json, fts and httpfs, are built by DuckDB for each version and platform, signed, and installed from its repository with `INSTALL json`. An extension of one's own is the same kind of file, named `<name>.duckdb_extension`: the library a compiler made, with 512 bytes of metadata appended that tell DuckDB the extension's platform, the version of DuckDB it is for, and how it talks to DuckDB. Unlike a function registered from Julia, an extension is a file, so any program that runs the same DuckDB on the same platform can load it with `LOAD 'path/fractal.duckdb_extension'`.

## What Does duckdb-neo Give a Rust Extension?

duckdb-neo is the Rust crate for the C API version 2 of DuckDB, the interface through which an extension calls DuckDB and DuckDB calls the extension; its version number carries that of DuckDB, 0.20000.2 for DuckDB 2.0.0. With the feature `build-extension`, the crate takes DuckDB's functions from the table DuckDB passes when it loads the extension, so the library links against no copy of DuckDB. A scalar function is a type that implements the trait `ScalarCallbacks`, whose `exec` receives the argument vectors and the output vector of one chunk. `ScalarFunctionBuilder::new` names it, `SignatureBuilder` gives its parameters, `FunctionParameter::new::<f64>("zr")` for each, and its return type, `i32::logical_type(extension)?`, and `register` adds it to the database.

## What Does the Entry Point of a DuckDB Extension Do?

`LOAD 'fractal.duckdb_extension'` takes the extension's name from the file name, `fractal`, opens the library and calls its function `fractal_init_c_api_v2`, the entry point. The attribute `#[duckdb_entrypoint_c_api_v2(extension_name = "fractal", api_version = "2.0.0")]` on a Rust function writes that entry point: it receives the table of DuckDB's functions, checks the version of the API it asks for, and calls the function it is written on with an `Extension`, in which the extension registers what it adds. A file renamed after it was built no longer matches its entry point, and `LOAD` fails. The crate is built with `crate-type = ["cdylib"]`, a library with C names and calling conventions, as for any library another language opens.

## What Is the Metadata at the End of a DuckDB Extension File?

DuckDB reads the last 512 bytes of the file before it opens it as a library. They start with 22 bytes, a header written as a WebAssembly custom section named `duckdb_signature`, so that the same layout keeps an extension built for WebAssembly valid. Eight fields of 32 bytes follow, each text padded with zeros: three unused, the ABI type, the extension's version, the version of DuckDB, the platform, such as `osx_arm64`, `linux_amd64` or `windows_amd64`, and `4`, which marks a DuckDB extension. The last 256 bytes hold the signature, zeros in an unsigned extension. DuckDB's build tools append this with the script `append_extension_metadata.py`; the Rust Extension tab writes the same bytes in Julia, with the version and platform that the database it loads into reports.

## Why Does a Rust Extension Load in One Version of DuckDB Only?

The ABI type in the metadata says how the extension talks to DuckDB. `C_STRUCT` is the stable C API: the version field holds the oldest version of that API the extension needs, and it loads in every later DuckDB. Extensions written for the C API version 2 are marked `C_STRUCT_UNSTABLE`, as DuckDB's template for Rust extensions marks them: the version field holds the exact version of DuckDB, and the extension loads in that version alone, since the API may still change between versions. A new version of DuckDB therefore needs the version of duckdb-neo made for it and a new build. The tab stops with a message when the database is not DuckDB 2.0.0, and builds again when the version or platform changes, as `built_from.txt` records.

## How Do Other Programs Load an Unsigned DuckDB Extension?

DuckDB refuses an extension without a valid signature unless the setting `allow_unsigned_extensions` was given when the database opened; it cannot be changed while the database runs. In Julia it is `DuckDB.DB(":memory:"; config = ["allow_unsigned_extensions" => "true"])`, in Python `duckdb.connect(config = {"allow_unsigned_extensions": "true"})`, and the DuckDB command line takes the option `-unsigned`. `LOAD` with the path of the file then loads it. `INSTALL 'path/fractal.duckdb_extension'` copies the file into DuckDB's folder of extensions, `~/.duckdb/extensions/<version>/<platform>`, after which `LOAD fractal` finds it by name. Allowing unsigned extensions lets a database run code that no one has vouched for, so it suits extensions built on the same computer from sources one has read.

## References

<a id="ref-DDBL2026a"></a>DuckDB Labs and contributors (2026). duckdb-neo: ergonomic wrapper for DuckDB's v2 C API (beta). [github.com/duckdb/duckdb-rs](https://github.com/duckdb/duckdb-rs)

<a id="ref-KN2023a"></a>Klabnik, S. and Nichols, C. (2023). *The Rust Programming Language*, 2nd ed. San Francisco: No Starch Press. [doc.rust-lang.org/book](https://doc.rust-lang.org/book/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [How DuckDB Calls a Scalar Function](scalar-functions.md) · [Julia Functions Registered in a Database](julia-functions.md)
