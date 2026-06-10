# Excel Workbook — Decision Guide

## Which Mode Should I Use?

### Use **Read** when…
- You have an existing `.xlsx` file and want to load its data into Julia for analysis, modelling, or visualisation.
- You need to inspect sheet names, dimensions, or merged cell ranges before processing.
- You want to batch-read multiple sheets into a `Dict` of DataFrames.

### Use **Write** when…
- You are generating a report, dashboard, or data export from Julia results.
- You need multiple sheets in a single workbook.
- Speed matters — `writetable` is the fastest path for plain tabular data with no styling.

### Use **Format** when…
- The workbook will be delivered to stakeholders who expect a polished spreadsheet.
- You need colour-coded headers, alternating row fills, or rule-based highlights (e.g. red cells for values below a threshold).
- You are building a template that others will reuse and must look consistent.

### Use **Formula** when…
- Downstream users need to interact with the workbook in Excel and perform their own calculations.
- You want to define named ranges so formulas remain readable after row/column changes.
- You are embedding rich text (annotations, multi-format strings) using `RichTextString`.

## Read + Write + Format Together
These modes are not mutually exclusive. A typical production workflow reads source data (Read), computes results in Julia, writes the output (Write), and then applies house-style formatting and conditional highlights in a second `openxlsx` pass (Format).
