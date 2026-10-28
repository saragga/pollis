# Pollis documents

The LaTeX sources of the documents in Help > Documentation. Pollis ships these sources, not the PDFs: when the Julia REPL starts, the Julia extension compiles them with XeTeX (Tectonic, from PollisTeX.jl) into `~/.pollis/documents`, where Help opens them (`extensions/language-julia/scripts/terminalserver/compile_documents.jl`). To see a change, build with `tectonic` in the document's folder; Pollis compiles it again at its next start.

| Source | Compiled as |
|---|---|
| `tour/pollis_tour.tex` | `pollis-tour.pdf` (A Tour of Pollis) |
| `guide/pollis_guide.tex` | `pollis-guide.pdf` (The Pollis Guide) |
| `ai-tour/pollis_ai_tour.tex` | `pollis-ai-tour.pdf` (A Tour of Pollis AI+) |
| `ai-brochure/pollis_ai_brochure.tex` | `pollis-ai-brochure.pdf` (Pollis AI+) |
| `workflows/workflow_data_packages.tex` | `pollis-drilldown-data-packages.pdf` (Drill-down: Data Packages) |
| `workflows/workflow_literature_radar.tex` | `pollis-drilldown-literature-radar.pdf` (Drill-down: Literature Radar) |
| `workflows/workflow_ask_pollis.tex` | `pollis-drilldown-ask-pollis.pdf` (Drill-down: Ask Pollis) |

`workflows/replication_flowchart.pdf`, a figure of the Tour and the Guide, is not kept here either: it is built from `replication_flowchart.tex` before them.

## Package vignettes

`vignettes/` holds the LaTeX sources of the package vignettes in Help > Documentation > Packages, all set in `newmethods_style.tex`. Copy `<Package>.tex` (and any images, in a `resources/` folder) to `src/vs/workbench/contrib/compose/browser/media/methods/<Package>/vignette/`, from which Package and Publish copies them into the published package. Packages carry no PDF: Help > Documentation > Packages compiles a vignette with PollisTeX (XeTeX, as for every Pollis document) the first time it is opened. To check one here, build it with `tectonic <Package>.tex`; the PDF is git-ignored. LSTNet's also needs `divergence.tex` and `fluxarchitectures.tex`, which it inputs.

`dp_event_studies.tex` is the draft vignette of PollisEventStudies.jl (Domain Packages), not shipped yet.
