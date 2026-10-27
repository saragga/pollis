# Pollis: compiles the vignette of a package, for Help > Documentation > Packages, with the XeTeX of Tectonic
# that PollisTeX.jl installs. Run by the Julia extension in a hidden process of low priority (pollisDocuments.ts):
#
#   julia compile_vignette.jl SOURCE NAME PDF
#
# SOURCE is the vignette/ folder of an installed package, or the repository of a package on GitHub
# (https://github.com/OWNER/NAME.jl), whose vignette/ folder is downloaded, or the folder of a document of an installed
# toolbox, for Help > Documentation > Toolboxes (compose/browser/toolboxDocumentsPage.ts), made the same way; NAME the vignette's main file, NAME.tex;
# PDF where the PDF goes. A vignette is its LaTeX sources (.tex, .bib) and its resources/ folder (images and the
# like): packages carry no PDF. The sources are copied to a folder of their own first, LaTeX's working files beside
# them. The environment is that of the documents of Help > Documentation, ~/.pollis/documents/julia/vX.Y, which gets
# PollisTeX the first time; the user's environments are never touched. It writes a line of JSON on stdout as it goes:
# {"status": "installing"} while it installs PollisTeX, then {"pdf"} once the PDF is ready, or {"error"}.
import Pkg, Downloads

const SOURCE = ARGS[1]
const NAME = ARGS[2]
const PDF = abspath(ARGS[3])
const ENVIRONMENT = joinpath(homedir(), ".pollis", "documents", "julia", "v$(VERSION.major).$(VERSION.minor)")

say(line) = (println(line); flush(stdout))
json(text) = "\"" * escape_string(text) * "\""

"""The files of a vignette folder that make the vignette, by their paths relative to it."""
vignette_file(path) = splitext(path)[2] in (".tex", ".bib") && !occursin('/', path) || startswith(path, "resources/")

"""Copies the vignette's files from a folder of an installed package into `build`."""
function copy_installed(folder, build)
	for (dir, _, files) in walkdir(folder), file in files
		path = replace(relpath(joinpath(dir, file), folder), '\\' => '/')
		vignette_file(path) || continue
		mkpath(dirname(joinpath(build, path)))
		cp(joinpath(dir, file), joinpath(build, path))
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
		vignette_file(path[:path][length("vignette/") + 1:end]) && push!(files, path[:path])
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
		Pkg.add(url = "https://github.com/Trumpingtons/PollisTeX.jl"; io = devnull)
	end
	tectonic = Base.invokelatest(Base.require(Main, :PollisTeX).tectonic)
	mktempdir() do build
		startswith(SOURCE, "https://") ? download_repository(SOURCE, build) : copy_installed(SOURCE, build)
		isfile(joinpath(build, "$NAME.tex")) || error("the vignette has no $NAME.tex")
		log = joinpath(build, "$NAME.log")
		if !success(pipeline(Cmd(`$tectonic --keep-logs $NAME.tex`; dir = build); stdout = devnull, stderr = devnull))
			# LaTeX's own words on what went wrong, the last lines of its log that start with !
			problems = isfile(log) ? filter(line -> startswith(line, "!"), readlines(log)) : String[]
			error(isempty(problems) ? "Tectonic could not compile $NAME.tex" : last(problems))
		end
		# Copied beside it, then moved, so that the page never opens half a PDF
		mkpath(dirname(PDF))
		cp(joinpath(build, "$NAME.pdf"), PDF * ".partial"; force = true)
		mv(PDF * ".partial", PDF; force = true)
	end
	say("{\"pdf\":$(json(PDF))}")
catch err
	say("{\"error\":$(json(sprint(showerror, err)))}")
end
