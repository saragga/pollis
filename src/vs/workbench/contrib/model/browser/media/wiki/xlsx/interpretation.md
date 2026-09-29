# Interpretation

## Workbook Structure
An `.xlsx` file is a ZIP archive of XML files. The key components are:

| Component | What it holds |
|---|---|
| **Workbook** | List of sheets and global settings |
| **Worksheet** | A grid of cells identified by column letter + row number (e.g. `A1`) |
| **Shared strings** | A deduplicated table of all string values |
| **Styles** | Font, fill, border, number format, and alignment definitions |
| **Defined names** | Named ranges or formulas scoped to the workbook or a sheet |

## Cell References
- A cell address is a column letter followed by a row number: `B3`, `AA10`.
- A range is two addresses separated by `:`: `A1:D20`.
- An absolute reference (used in formulas and defined names) prefixes `$`: `$A$1`.

## Reading vs. Writing Trade-offs
- `readtable` is the fastest path for rectangular tabular data with a header row.
- `openxlsx` gives cell-level access at the cost of more verbose code — use it when you need non-rectangular layouts, multiple anchors, or formatting.

## Conditional Formatting
Rules are evaluated by Excel, not by XLSX.jl. The rule string uses Excel syntax (`">1000"`, `"<AVERAGE($B$2:$B$20)"`). XLSX.jl stores the rule; Excel applies the highlight when the file is opened.

## Named Ranges
`addDefinedName` creates a workbook-scoped name that points to a cell or range. Downstream users can refer to it by name in formulas (`=TotalRevenue`) rather than by address (`=Sheet1!$A$3`), making the workbook robust to row/column insertions.

## See Also
- [Diagnostics](diagnostics.md) · [Overview](overview.md) · [Constraints](constraints.md)
