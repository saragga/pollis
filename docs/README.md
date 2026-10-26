# Pollis documents

The LaTeX sources of the documents in Help > Documentation. Edit them here, build with `latexmk -pdf` in the document's folder, and copy the PDF to `src/vs/workbench/browser/media/`.

| Source | Shipped as |
|---|---|
| `tour/pollis_tour.tex` | `pollis-tour.pdf` (A Tour of Pollis) |
| `guide/pollis_guide.tex` | `pollis-guide.pdf` (The Pollis Guide) |
| `ai-tour/pollis_ai_tour.tex` | `pollis-ai-tour.pdf` (A Tour of Pollis AI+) |
| `ai-brochure/pollis_ai_brochure.tex` | `pollis-ai-brochure.pdf` (Pollis AI+) |
| `workflows/workflow_data_packages.tex` | `pollis-drilldown-data-packages.pdf` (Drill-down: Data Packages) |

`workflows/replication_flowchart.pdf`, a figure of the Tour and the Guide, is not kept here either: build it from `replication_flowchart.tex` before them.

## Package vignettes

`vignettes/` holds the LaTeX sources of the package vignettes in Help > Documentation > Package Vignettes, all set in `newmethods_style.tex`. Build with `latexmk -pdf <Package>.tex` there, and copy `<Package>.tex` and `<Package>.pdf` to `src/vs/workbench/contrib/compose/browser/media/methods/<Package>/vignette/`, from which they ship and are copied into the published package. LSTNet's also needs `divergence.tex` and `fluxarchitectures.tex`, which it inputs.

`dp_event_studies.tex` is the draft vignette of PollisEventStudies.jl (Domain Packages), not shipped yet.
