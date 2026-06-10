# Excel Workbook — Diagnostics

## Common Errors

### `KeyError: sheet "Sheet1" not found`
The sheet name does not match exactly (case-sensitive). Use `XLSX.sheetnames(xf)` to list all available names.

```julia
xf = XLSX.readxlsx("data.xlsx")
println(XLSX.sheetnames(xf))   # check exact names
```

### `MethodError` or unexpected `Missing` values
A column contains mixed types (e.g. numbers and strings in the same column). Inspect the raw sheet before loading:

```julia
ws = XLSX.readxlsx("data.xlsx")["Sheet1"]
println(ws["A1:D5"])   # print a range as a matrix
```

### DataFrame has wrong column count
`readtable` expects a contiguous header row at the top of the table. If the file has title rows above the data, specify the anchor cell:

```julia
df = DataFrame(XLSX.readtable("data.xlsx", "Sheet1"; anchor_cell=XLSX.CellRef("A3"))...)
```

### Dates read as `Float64`
The cell has a date serial number but no date format applied in Excel. Cast manually:

```julia
using Dates
df.date_col = Date.(Dates.epochdays.(round.(Int, df.date_col)) .+ Dates.value(Date(1899,12,30)))
```

### File saved but formatting not visible
Formatting requires `openxlsx` with `mode="w"` or `mode="rw"`. Using `writetable` does not apply cell-level formatting — call formatting functions inside an `openxlsx` block after writing.

### Formula shows `#NAME?` in Excel
The formula string passed to `setFormula` contains a Julia string escape or a non-ASCII character. Check for accidental backslashes or Unicode in the formula string.
