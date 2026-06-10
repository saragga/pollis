# Excel Workbook — Factsheet

**XLSX.jl** reads and writes `.xlsx` files in pure Julia — no Excel installation required. Version 0.11 adds cell formatting, conditional formatting, merged cells, rich text, and formula embedding.

| | |
|---|---|
| **Purpose** | Read, write, format, and annotate Excel workbooks from Julia |
| **Input** | `.xlsx` files, Julia DataFrames, arrays, or scalars |
| **Core package** | [XLSX.jl](https://github.com/felipenoris/XLSX.jl) v0.11+ |
| **Companion** | [DataFrames.jl](https://github.com/JuliaData/DataFrames.jl) for tabular I/O |
| **Format** | Office Open XML (ECMA-376) — the standard `.xlsx` format |

## Key Functions

| Function | Task |
|---|---|
| `XLSX.readxlsx(path)` | Open a workbook (lazy) |
| `XLSX.readtable(path, sheet)` | Load a sheet into a DataFrame |
| `XLSX.writetable(path, ...)` | Write one or more sheets |
| `XLSX.openxlsx(path; mode)` | Open for editing with a `do` block |
| `XLSX.setFont`, `setFill`, `setBorder`, `setAlignment` | Cell formatting |
| `XLSX.setConditionalFormat` | Rule-based cell highlighting |
| `XLSX.mergeCells` | Merge a cell range |
| `XLSX.setFormula` | Embed an Excel formula |
| `XLSX.addDefinedName` | Create a named range |

## When to Use
- Loading structured data from `.xlsx` files into Julia for analysis.
- Generating styled reports or dashboards as `.xlsx` files.
- Delivering results to stakeholders who use Excel.
