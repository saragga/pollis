# Copyright (c) 2026 Antonio Saragga Seabra
# SPDX-License-Identifier: MIT

# Pollis: compiles the vignette of a package, for Help > Documentation > Packages, with the XeTeX of Tectonic
# that PollisTeX.jl installs. Run by the Julia extension in a hidden process of low priority (pollisDocuments.ts):
#
#   julia compile_vignette.jl SOURCE NAME PDF LABELS [own]
#
# SOURCE is the vignette/ folder of an installed package, or the repository of a package on GitHub
# (https://github.com/OWNER/NAME.jl), whose vignette/ folder is downloaded, or the folder of a document of an installed
# toolbox, for Help > Documentation > Toolbox Vignettes (compose/browser/toolboxDocumentsPage.ts), made the same way; NAME the vignette's main file, NAME.tex;
# PDF where the PDF goes; LABELS the app's docs/ask_labels.tex, which the main file is made to input before anything
# else, so that NAME.labels, the page of each heading, goes beside the PDF for Ask Pollis (ask_index.jl), as with
# Pollis' own documents; own for a document of the user's, Help > Documentation > User Documents (userDocumentsPage.ts).
# A vignette is its LaTeX sources (.tex, .bib), its style files and pictures beside them, and its resources/ folder
# (document_source.jl, document_file): packages carry no PDF. The PDF names its source for Edit the LaTeX Source in the
# PDF Viewer: a copy of the sources, NAME.source/ beside the PDF, or the user's own main file (document_source.jl). The sources are copied to a folder of their own first, LaTeX's working files beside
# them. The environment is that of the documents of Help > Documentation, ~/.pollis/documents/julia/vX.Y, which gets
# PollisTeX the first time; the user's environments are never touched. It writes a line of JSON on stdout as it goes:
# {"status": "installing"} while it installs PollisTeX, then {"pdf"} once the PDF is ready, or {"error"}.
import Pkg, Downloads
include(joinpath(@__DIR__, "pollis_registry.jl"))
include(joinpath(@__DIR__, "document_source.jl"))

const SOURCE = ARGS[1]
const NAME = ARGS[2]
const PDF = abspath(ARGS[3])
const LABELS = get(ARGS, 4, "")
const OWN = get(ARGS, 5, "") == "own"
const ENVIRONMENT = joinpath(homedir(), ".pollis", "documents", "julia", "v$(VERSION.major).$(VERSION.minor)")

say(line) = (println(line); flush(stdout))
json(text) = "\"" * escape_string(text) * "\""

"""Copies the vignette's files from a folder of an installed package into `build`, writable: the files of an installed
package are read-only, and `cp` keeps that, but the main file gets a line at its top (LABELS)."""
function copy_installed(folder, build)
	for (dir, _, files) in walkdir(folder), file in files
		path = replace(relpath(joinpath(dir, file), folder), '\\' => '/')
		document_file(path) || continue
		mkpath(dirname(joinpath(build, path)))
		cp(joinpath(dir, file), joinpath(build, path))
		chmod(joinpath(build, path), 0o644)
	end
end

"""Downloads the vignette's files from a repository on GitHub into `build`: its default branch, as listed by GitHub."""
function download_repository(repository, build)
	m = match(r"^https://github\.com/(?<owner>[^/]+)/(?<repository>[^/]+?)/?$", repository)
	m === nothing && error("$repository is not a repository on GitHub")
	owner, name = m[:owner], m[:repository]
	listing = String(take!(Downloads.download("https://api.github.com/repos/$owner/$name/git/trees/HEAD?recursive=1", IOBuffer())))
	# Each entry of the tree is an object without objects inside: its path, and its type, a blob for a file
	files = String[]
	for entry in eachmatch(r"\{[^{}]*\}", listing)
		path = match(r"\"path\"\s*:\s*\"(?<path>[^\"]+)\"", entry.match)
		type = match(r"\"type\"\s*:\s*\"(?<type>[^\"]+)\"", entry.match)
		(path === nothing || type === nothing || type[:type] != "blob" || !startswith(path[:path], "vignette/")) && continue
		document_file(path[:path][length("vignette/") + 1:end]) && push!(files, path[:path])
	end
	"vignette/$NAME.tex" in files || error("$repository has no vignette/$NAME.tex")
	for path in files
		target = joinpath(build, path[length("vignette/") + 1:end])
		mkpath(dirname(target))
		Downloads.download("https://raw.githubusercontent.com/$owner/$name/HEAD/$path", target)
	end
end

try
	Pkg.activate(ENVIRONMENT; io = devnull)
	if !any(info -> info.name == "PollisTeX" && info.is_direct_dep, values(Pkg.dependencies()))
		say("{\"status\":\"installing\"}")
		add_pollis_registry(Pkg; io = devnull)
		Pkg.add("PollisTeX"; io = devnull)
	end
	tectonic = Base.invokelatest(Base.require(Main, :PollisTeX).tectonic)
	mktempdir() do build
		startswith(SOURCE, "https://") ? download_repository(SOURCE, build) : copy_installed(SOURCE, build)
		main = joinpath(build, "$NAME.tex")
		isfile(main) || error("the vignette has no $NAME.tex")
		original = read(main, String)
		# Its source, which the PDF names: the user's own file, else the copy beside the PDF
		source_copy = splitext(PDF)[1] * ".source"
		top = source_docinfo(OWN ? joinpath(SOURCE, "$NAME.tex") : joinpath(source_copy, "$NAME.tex"))
		# The page of each heading, for Ask Pollis: a vignette compiles without it
		if isfile(LABELS)
			cp(LABELS, joinpath(build, "pollis_ask_labels.tex"); force = true)
			top *= "\\input{pollis_ask_labels}\n"
		end
		write(main, top * original)
		log = joinpath(build, "$NAME.log")
		if !success(pipeline(Cmd(`$tectonic --keep-logs --makefile-rules $NAME.deps $NAME.tex`; dir = build); stdout = devnull, stderr = devnull))
			# LaTeX's own words on what went wrong, the last lines of its log that start with !
			problems = isfile(log) ? filter(line -> startswith(line, "!"), readlines(log)) : String[]
			error(isempty(problems) ? "Tectonic could not compile $NAME.tex" : last(problems))
		end
		# The copy of the sources first, so that the PDF never names one not there yet
		mkpath(dirname(PDF))
		OWN ? rm(source_copy; force = true, recursive = true) : save_source(build, "$NAME.tex", original, joinpath(build, "$NAME.deps"), source_copy)
		# Copied beside it, then moved, so that the page never opens half a PDF
		cp(joinpath(build, "$NAME.pdf"), PDF * ".partial"; force = true)
		labels = splitext(PDF)[1] * ".labels"
		isfile(joinpath(build, "$NAME.labels")) ? cp(joinpath(build, "$NAME.labels"), labels; force = true) : rm(labels; force = true)
		mv(PDF * ".partial", PDF; force = true)
	end
	say("{\"pdf\":$(json(PDF))}")
catch err
	say("{\"error\":$(json(sprint(showerror, err)))}")
end
