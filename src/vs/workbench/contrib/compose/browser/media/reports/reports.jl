# Copyright (c) 2026 Antonio Saragga Seabra
# Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.

# Compose > Reports without a coding agent: a notebook as a LaTeX report (article) or slides (beamer).
# Pollis includes this file in its Julia REPL and calls PollisReports.make(notebook, folder, kind).
#
# With a template (a workflow's latex/ folder: report.tex or slides.tex, references.bib and make.jl), its
# files are copied to the folder and make.jl runs there, writing the figures and tables the template uses.
# Without one, the notebook's code cells run in order and each cell's printed output and figure are saved
# (outputs/cellN.txt, figures/cellN.pdf); the .tex is a draft of the markdown cells with those outputs.
# Either way the .tex is written only when the folder has none, so a re-export refreshes the numbers and
# keeps the user's edits, and notebook.md, the notebook as short Markdown, is written for Polish with Agent.

module PollisReports

import JSON, PollisTeX, REPL
using Markdown

export make

"""The printed output kept of a cell, in characters."""
const MAX_OUTPUT = 20_000

const FONTS = raw"""
\usepackage{fontspec}
\setmainfont{LibertinusSerif}[Extension=.otf, UprightFont=*-Regular, BoldFont=*-Bold, ItalicFont=*-Italic, BoldItalicFont=*-BoldItalic]
\setsansfont{LibertinusSans}[Extension=.otf, UprightFont=*-Regular, BoldFont=*-Bold, ItalicFont=*-Italic]
\setmonofont{DejaVuSansMono}[Extension=.ttf, Scale=MatchLowercase, BoldFont=*-Bold]
"""

const PACKAGES = raw"""
\usepackage{amsmath, booktabs, graphicx, xcolor, fancyvrb}
"""

const LINKS = raw"""
\usepackage[colorlinks, allcolors=blue!50!black]{hyperref}
"""

# beamer loads hyperref itself
const BEAMER_LINKS = raw"""
\hypersetup{colorlinks, allcolors=blue!50!black}
\setbeamertemplate{frametitle continuation}{}
"""

"""A cell of the notebook, with what running it gave."""
mutable struct Cell
	kind::Symbol
	source::String
	output::String
	figure::Bool
end

"""
	make(notebook, folder, kind; template = nothing, library = nothing)

Writes `kind.tex` (`:report` or `:slides`) for `notebook` in `folder` and compiles it with PollisTeX. With
`template`, a folder holding `kind.tex` and its `make.jl`, those are used instead of a draft. `library` is the folder
of pollis.bib, so that `\\bibliography{pollis}` finds it.
"""
function make(notebook::AbstractString, folder::AbstractString, kind::Symbol; template = nothing, library = nothing)
	mkpath(folder)
	tex = joinpath(folder, "$kind.tex")
	data = JSON.parsefile(notebook)
	cells = [Cell(Symbol(c["cell_type"]), source(c["source"]), "", false) for c in data["cells"]]
	metadata = get(get(data, "metadata", Dict()), "pollis", Dict())
	if template !== nothing && isfile(joinpath(template, "$kind.tex"))
		for file in readdir(template)
			target = joinpath(folder, file)
			isfile(joinpath(template, file)) && !isfile(target) && cp(joinpath(template, file), target)
		end
		script = joinpath(folder, "make.jl")
		isfile(script) && run_in_notebook_folder(notebook) do m
			Base.include(m, script)
		end
	else
		run_cells!(cells, notebook, folder)
		isfile(tex) || write(tex, kind === :slides ? slides(cells, metadata) : report(cells, metadata))
	end
	write(joinpath(folder, "notebook.md"), lean(cells, metadata, notebook))
	return compile(tex, library)
end

"""
	compile(tex, library)

Compiles `tex` with PollisTeX, with `library` (the folder of pollis.bib) on Tectonic's search path; a PollisTeX older
than its `searchpath` keyword compiles without it.
"""
function compile(tex::AbstractString, library)
	if library === nothing || !hasmethod(PollisTeX.compile, Tuple{String}, (:searchpath,))
		return PollisTeX.compile(tex)
	end
	return PollisTeX.compile(tex; searchpath = [library])
end

source(s) = s isa AbstractVector ? join(s) : string(s)

"""Runs `f` on a new module, as the notebook's kernel would, in the notebook's folder; plots draw no window."""
function run_in_notebook_folder(f, notebook)
	m = Module(:Notebook)
	isdefined(Main, :Pollis) && Core.eval(m, :(const Pollis = $(Main.Pollis)))
	Core.eval(m, :(include(path) = Base.include($m, path)))
	Core.eval(m, :(eval(x) = Core.eval($m, x)))
	withenv("GKSwstype" => "100") do
		cd(() -> f(m), dirname(abspath(notebook)))
	end
end

"""Runs the code cells in order, keeping what each prints and its figure; stops at the first error."""
function run_cells!(cells, notebook, folder)
	mkpath(joinpath(folder, "outputs"))
	mkpath(joinpath(folder, "figures"))
	run_in_notebook_folder(notebook) do m
		for (i, cell) in enumerate(cells)
			cell.kind === :code || continue
			printed = tempname()
			value = nothing
			failed = false
			open(printed, "w") do io
				redirect_stdout(io) do
					try
						value = Base.include_string(m, cell.source, "cell $i")
					catch error
						print(io, "ERROR: ", sprint(showerror, error))
						failed = true
					end
				end
			end
			output = read(printed, String)
			rm(printed)
			if !failed && value !== nothing && !REPL.ends_with_semicolon(cell.source)
				# the cell's packages loaded after this function was compiled: invokelatest finds their show methods
				if Base.invokelatest(showable, MIME"application/pdf"(), value) && !(value isa AbstractString)
					open(io -> Base.invokelatest(show, io, MIME"application/pdf"(), value), joinpath(folder, "figures", "cell$i.pdf"), "w")
					cell.figure = true
				else
					text = sprint((io, x) -> Base.invokelatest(show, IOContext(io, :limit => true, :displaysize => (40, 100)), MIME"text/plain"(), x), value)
					output *= (isempty(output) || endswith(output, '\n') ? "" : "\n") * text
				end
			end
			length(output) > MAX_OUTPUT && (output = first(output, MAX_OUTPUT) * "\n...")
			cell.output = rstrip(output)
			isempty(cell.output) || write(joinpath(folder, "outputs", "cell$i.txt"), cell.output * "\n")
			if failed
				@warn "Cell $i of the notebook failed, so the later cells were not run." output
				break
			end
		end
	end
end

# ------------------------------------------------------------------ Markdown to LaTeX

const SPECIAL = Dict('\\' => "\\textbackslash{}", '{' => "\\{", '}' => "\\}", '$' => "\\\$", '&' => "\\&", '#' => "\\#",
	'%' => "\\%", '_' => "\\_", '^' => "\\^{}", '~' => "\\~{}")

escape(s::AbstractString) = join(get(SPECIAL, c, string(c)) for c in s)

"""Parses a markdown cell, with `\$\$ ... \$\$` blocks as display math."""
parse_markdown(s) = Markdown.parse(replace(s, r"\$\$(?<math>.+?)\$\$"s => s"\n```math\n\g<math>\n```\n"))

inline(x::AbstractString) = escape(x)
inline(x::AbstractVector) = join(inline.(x))
inline(x::Markdown.Bold) = "\\textbf{$(inline(x.text))}"
inline(x::Markdown.Italic) = "\\emph{$(inline(x.text))}"
inline(x::Markdown.Code) = "\\texttt{$(escape(x.code))}"
inline(x::Markdown.Link) = "\\href{$(replace(x.url, r"[%#]" => s"\\\0"))}{$(inline(x.text))}"
inline(x::Markdown.LaTeX) = "\$$(x.formula)\$"
inline(x::Markdown.Image) = escape(x.alt)
inline(::Markdown.LineBreak) = "\\\\\n"
inline(x) = escape(string(x))

"""The LaTeX of a markdown block; `section` gives the command of a heading's level."""
block(x::Markdown.Paragraph, section) = inline(x.content) * "\n\n"
block(x::Markdown.Header{l}, section) where {l} = section(l, inline(x.text))
block(x::Markdown.Code, section) = x.language == "math" ? "\\[\n$(x.code)\n\\]\n\n" : "\\begin{Verbatim}[fontsize=\\small]\n$(x.code)\n\\end{Verbatim}\n\n"
block(x::Markdown.LaTeX, section) = "\\[\n$(x.formula)\n\\]\n\n"
block(x::Markdown.BlockQuote, section) = "\\begin{quote}\n$(blocks(x.content, section))\\end{quote}\n\n"
block(::Markdown.HorizontalRule, section) = "\\medskip\\hrule\\medskip\n\n"
block(x::Markdown.Admonition, section) = "\\paragraph*{$(escape(x.title))} $(blocks(x.content, section))"
function block(x::Markdown.List, section)
	env = x.ordered >= 0 ? "enumerate" : "itemize"
	items = join("\\item " * rstrip(blocks(item, section)) * "\n" for item in x.items)
	"\\begin{$env}\n$items\\end{$env}\n\n"
end
function block(x::Markdown.Table, section)
	rows = [join(inline.(row), " & ") * " \\\\" for row in x.rows]
	columns = join(a === :r ? "r" : a === :c ? "c" : "l" for a in x.align)
	"\\begin{center}\n\\begin{tabular}{$columns}\n\\toprule\n$(rows[1])\n\\midrule\n$(join(rows[2:end], "\n"))\n\\bottomrule\n\\end{tabular}\n\\end{center}\n\n"
end
block(x, section) = escape(string(x)) * "\n\n"

blocks(content, section) = join(block(x, section) for x in content)

"""The notebook's title: its first `# ` heading, which is taken out of the cell."""
function title!(cells)
	for cell in cells
		cell.kind === :markdown || continue
		m = match(r"^\s*#\s+(?<title>[^\n]+)\n?"s, cell.source)
		m === nothing && return ""
		cell.source = cell.source[length(m.match)+1:end]
		return inline(parse_markdown(m[:title]).content[1].content)
	end
	return ""
end

output_tex(i, cell, size) = "\\VerbatimInput[fontsize=\\$size, frame=leftline, framerule=0.4pt, rulecolor=\\color{gray}]{outputs/cell$i.txt}\n\n"

"""A draft report: the markdown cells, the printed outputs and the figures, without the code."""
function report(cells, metadata)
	cells = deepcopy(cells)
	title = title!(cells)
	section(l, text) = l <= 2 ? "\\section*{$text}\n\n" : l == 3 ? "\\subsection*{$text}\n\n" : "\\paragraph*{$text}\n"
	body = IOBuffer()
	abstract = true
	for (i, cell) in enumerate(cells)
		if cell.kind === :markdown
			content = parse_markdown(cell.source).content
			if abstract && !isempty(content) && content[1] isa Markdown.Paragraph
				# the paragraph after the title is the abstract
				print(body, "\\begin{abstract}\n", rstrip(block(content[1], section)), "\n\\end{abstract}\n\n")
				content = content[2:end]
			end
			print(body, blocks(content, section))
			abstract = false
		elseif cell.kind === :code
			isempty(cell.output) || print(body, output_tex(i, cell, "footnotesize"))
			cell.figure && print(body, "\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.9\\linewidth]{figures/cell$i.pdf}\n\\end{figure}\n\n")
		end
	end
	"""
	% A draft written by Pollis from the notebook: edit it, then compile with the run button above.
	\\documentclass[11pt]{article}
	$FONTS\\usepackage[a4paper, margin=2.5cm]{geometry}
	$PACKAGES$LINKS
	\\title{$title}
	\\author{}
	\\date{\\today}

	\\begin{document}
	\\maketitle

	$(String(take!(body)))\\end{document}
	"""
end

"""Draft slides: a frame for each heading's text, and one for each output and each figure."""
function slides(cells, metadata)
	cells = deepcopy(cells)
	title = title!(cells)
	frames = IOBuffer()
	heading = title
	frame(content; fragile = false) = print(frames, "\\begin{frame}[$(fragile ? "fragile, " : "")allowframebreaks]{$heading}\n\\small\n", rstrip(content), "\n\\end{frame}\n\n")
	for (i, cell) in enumerate(cells)
		if cell.kind === :markdown
			text = IOBuffer()
			for x in parse_markdown(cell.source).content
				if x isa Markdown.Header
					position(text) > 0 && frame(String(take!(text)))
					heading = inline(x.text)
				else
					print(text, block(x, (l, t) -> "\\textbf{$t}\n\n"))
				end
			end
			position(text) > 0 && frame(String(take!(text)))
		elseif cell.kind === :code
			isempty(cell.output) || frame(output_tex(i, cell, "tiny"); fragile = true)
			cell.figure && frame("\\centering\n\\includegraphics[width=\\linewidth, height=0.75\\textheight, keepaspectratio]{figures/cell$i.pdf}")
		end
	end
	"""
	% Draft slides written by Pollis from the notebook: edit them, then compile with the run button above.
	\\documentclass{beamer}
	$FONTS$PACKAGES$BEAMER_LINKS
	\\title{$title}
	\\author{}
	\\date{\\today}

	\\begin{document}
	\\begin{frame}
	\\titlepage
	\\end{frame}

	$(String(take!(frames)))\\end{document}
	"""
end

# ------------------------------------------------------------------ the notebook for the agent

"""The notebook as short Markdown: its article, then each cell, with the code's printed output and figure."""
function lean(cells, metadata, notebook)
	io = IOBuffer()
	println(io, "<!-- ", basename(notebook), ", written by Pollis for Polish with Agent: the cells, with each code cell's output and figure -->\n")
	article = get(get(metadata, "workflow", Dict()), "article", nothing)
	if article !== nothing
		println(io, "Article: ", get(article, "citation", ""))
		haskey(article, "bibtex") && println(io, "\n```bibtex\n", article["bibtex"], "\n```")
		println(io)
	end
	for (i, cell) in enumerate(cells)
		if cell.kind === :markdown
			println(io, strip(cell.source), "\n")
		elseif cell.kind === :code
			println(io, "```julia\n# cell $i\n", strip(cell.source), "\n```\n")
			isempty(cell.output) || println(io, "Output (outputs/cell$i.txt):\n```\n", cell.output, "\n```\n")
			cell.figure && println(io, "Figure: figures/cell$i.pdf\n")
		end
	end
	return String(take!(io))
end

end
