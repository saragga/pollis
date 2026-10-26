# Pollis: compiles, at the start of a session, the documents of Help > Documentation from their LaTeX sources (docs/
# of Pollis), with the XeTeX of Tectonic that PollisTeX.jl installs. Run by the Julia extension in a hidden process of
# low priority (pollisDocuments.ts), with the folder of the sources as its argument; the PDFs go to ~/.pollis/documents,
# from where Help opens them. Its own environment, ~/.pollis/documents/julia/vX.Y, gets PollisTeX the first time; the
# user's environments are never touched. The sources are copied to ~/.pollis/documents/build first: the app's folder
# may be read-only, and LaTeX's working files and the figures built go beside them. Nothing is compiled when the
# sources and Tectonic are those of the last compile, which ~/.pollis/documents/stamp records. The documents compile a
# group at a time, those of a group side by side: the replication flowchart, a figure of the Tour and the Guide; then
# the Tour and the Guide; then the others. The TeX packages a document uses are downloaded the first time, which on a
# new computer takes a few minutes; after that each document takes seconds. It writes a line of JSON on stdout as it
# goes: {"status": "installing"} while it installs PollisTeX, {"total"} when it starts compiling, {"done", "total",
# "document"} as each document is ready, {"failed"} for one that is not, its log beside where the PDF would be.
import Pkg

const SOURCES = abspath(ARGS[1])
const OUTPUT = joinpath(homedir(), ".pollis", "documents")
const BUILD = joinpath(OUTPUT, "build")
const STAMP = joinpath(OUTPUT, "stamp")
const ENVIRONMENT = joinpath(OUTPUT, "julia", "v$(VERSION.major).$(VERSION.minor)")

"""A document: its source, relative to docs/, and the name of its PDF in ~/.pollis/documents ("" for a figure)."""
const GROUPS = [
	[("workflows/replication_flowchart.tex", "")],
	[("tour/pollis_tour.tex", "pollis-tour.pdf"), ("guide/pollis_guide.tex", "pollis-guide.pdf")],
	[
		("ai-tour/pollis_ai_tour.tex", "pollis-ai-tour.pdf"),
		("ai-brochure/pollis_ai_brochure.tex", "pollis-ai-brochure.pdf"),
		("workflows/workflow_data_packages.tex", "pollis-drilldown-data-packages.pdf"),
	],
]
const DOCUMENTS = [name for group in GROUPS for (_, name) in group if !isempty(name)]

say(line) = (println(line); flush(stdout))

"""The files the documents are made from, by their paths relative to docs/: the package vignettes have their own."""
sources() = sort!([relpath(joinpath(dir, file), SOURCES) for (dir, _, files) in walkdir(SOURCES) for file in files
	if splitext(file)[2] in (".tex", ".png", ".jpg", ".pdf") && !startswith(relpath(dir, SOURCES), "vignettes")])

Pkg.activate(ENVIRONMENT; io = devnull)
if !any(info -> info.name == "PollisTeX" && info.is_direct_dep, values(Pkg.dependencies()))
	say("{\"status\":\"installing\"}")
	Pkg.add(url = "https://github.com/Trumpingtons/PollisTeX.jl"; io = devnull)
end

using PollisTeX, SHA

const TECTONIC = PollisTeX.tectonic()

# What the documents are made from: the sources and the version of Tectonic
stamp = let context = SHA.SHA256_CTX()
	SHA.update!(context, codeunits(string(PollisTeX.version())))
	for file in sources()
		SHA.update!(context, codeunits(file))
		SHA.update!(context, read(joinpath(SOURCES, file)))
	end
	bytes2hex(SHA.digest!(context))
end
isfile(STAMP) && readchomp(STAMP) == stamp && all(name -> isfile(joinpath(OUTPUT, name)), DOCUMENTS) && exit()

rm(BUILD; force = true, recursive = true)
for file in sources()
	mkpath(dirname(joinpath(BUILD, file)))
	cp(joinpath(SOURCES, file), joinpath(BUILD, file))
end

say("{\"total\":$(length(DOCUMENTS))}")
done = Threads.Atomic{Int}(0)
failed = Threads.Atomic{Int}(0)

"""Compiles `source` in its folder of the build and, for a document, puts its PDF in ~/.pollis/documents."""
function compile(source, name)
	folder = joinpath(BUILD, dirname(source))
	file = basename(source)
	ok = success(pipeline(Cmd(`$TECTONIC --keep-logs $file`; dir = folder); stdout = devnull, stderr = devnull))
	isempty(name) && return
	if ok
		# Copied beside it, then moved, so that Help never opens half a PDF
		partial = joinpath(OUTPUT, name * ".partial")
		cp(joinpath(folder, splitext(file)[1] * ".pdf"), partial; force = true)
		mv(partial, joinpath(OUTPUT, name); force = true)
		say("{\"done\":$(Threads.atomic_add!(done, 1) + 1),\"total\":$(length(DOCUMENTS)),\"document\":\"$name\"}")
	else
		Threads.atomic_add!(failed, 1)
		log = joinpath(folder, splitext(file)[1] * ".log")
		isfile(log) && cp(log, joinpath(OUTPUT, splitext(name)[1] * ".log"); force = true)
		say("{\"failed\":\"$name\"}")
	end
end

for group in GROUPS
	# Tectonic is a process of its own, so tasks are enough to compile a group side by side
	@sync for (source, name) in group
		@async compile(source, name)
	end
end

failed[] == 0 && write(STAMP, stamp)
