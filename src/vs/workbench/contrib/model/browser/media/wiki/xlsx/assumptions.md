# Excel Workbook — Assumptions

## File Format
- XLSX.jl reads and writes **Office Open XML** (`.xlsx`) only. Legacy `.xls` (BIFF8) files are not supported — convert them to `.xlsx` first (e.g. with LibreOffice or Python's `xlrd`).
- The workbook must be a valid ECMA-376 archive. Password-protected or macro-enabled (`.xlsm`) files are not supported.

## Data Types
- Cells are read as their native Excel type: `Float64`, `Int`, `String`, `Bool`, `Date`, `DateTime`, or `Missing`.
- Empty cells become `Missing` in DataFrames.
- Dates are stored as Excel serial numbers internally; XLSX.jl converts them to `Julia.Dates.Date` or `DateTime` automatically when the cell has a date format.

## Sheet and Range References
- Sheet names are case-sensitive.
- `readtable` expects the table to start at cell A1 (or a specified anchor) with a header row.
- Merged cells expose the value only in the top-left cell; other cells in the merge return `Missing`.

## Formatting (v0.11+)
- Formatting calls (`setFont`, `setFill`, etc.) require `openxlsx` with `mode="w"` (new file) or `mode="rw"` (edit existing).
- Colour values are 6-digit hex strings without a leading `#` (e.g. `"4472C4"`).

## Formulas (v0.11+)
- `setFormula` stores the formula string; the computed value is only available after the file is opened in Excel or a compatible application.
- XLSX.jl does not evaluate formulas — it writes them for Excel to compute.
