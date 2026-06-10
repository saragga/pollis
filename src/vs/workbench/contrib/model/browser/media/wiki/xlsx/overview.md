# Excel Workbook — Overview

**XLSX.jl** provides pure-Julia read/write access to the Office Open XML (`.xlsx`) format. No COM automation, no Python bridge, no Excel licence — just a Julia package that speaks the ECMA-376 standard directly.

## Four Task Modes

### Read
Open an existing workbook and load one or more sheets into Julia DataFrames. The workbook is opened lazily — only the requested sheets are parsed.

```julia
using XLSX, DataFrames
df = DataFrame(XLSX.readtable("data.xlsx", "Sheet1")...)
```

### Write
Create a new workbook (or update an existing one) from Julia data. `writetable` writes multiple sheets in a single call; `openxlsx` gives full cell-level control.

```julia
XLSX.writetable("output.xlsx",
    "Sales"     => collect(eachcol(df_sales)),
    "Inventory" => collect(eachcol(df_inv)))
```

### Format (v0.11+)
Apply fonts, fills, borders, alignment, conditional formatting, and merged cells to individual cells or ranges. All formatting is done inside an `openxlsx` `do` block so the file is saved atomically on exit.

### Formula (v0.11+)
Embed Excel formulas (`=SUM(A1:A10)`) and create named ranges (`addDefinedName`) so downstream Excel users can interact with the workbook using familiar spreadsheet logic.

## Typical Workflow
1. Receive or generate data in Julia (DataFrames, arrays).
2. Use **Write** to produce the initial workbook.
3. Use **Format** to apply house style (headers, conditional highlights).
4. Use **Formula** to add calculated cells for Excel-side interactivity.
5. Deliver the `.xlsx` file to stakeholders.
