# The content list of Pollis: the vignettes of the New Methods library, the analytical workflows and the published
# benchmarks, with the dates each was added and last updated, the oldest Pollis version that can use it, and its
# files with their SHA-256. Writes src/vs/workbench/contrib/compose/browser/media/content.toml, the list Pollis ships,
# and, with --publish, the same list and the files into a clone of the content repository
# (github.com/Trumpingtons/pollis-content), whose list Pollis reads once a day (pollisContent.ts): an entry updated
# there after the release is downloaded and announced, until a release ships it.
#
#   julia scripts/pollis-content.jl [--pollis VERSION] [--publish CLONE]
#
# An entry whose files changed gets today's date as updated, and as the oldest Pollis version that can use it the
# version in product.json, or VERSION: give the next release's version when the change needs code that only it has.
# An entry keeps its added date. Run it before every release, so that the shipped list matches the content shipped,
# and with --publish to publish content between releases; then commit and push the clone.

using SHA, TOML, Dates

const ROOT = dirname(@__DIR__)
const MEDIA = joinpath(ROOT, "src", "vs", "workbench", "contrib", "compose", "browser", "media")
const LIST = joinpath(MEDIA, "content.toml")

"""The files of a folder, and its subfolders, with one of the extensions the build ships (build/gulpfile.vscode.ts)."""
function shipped(folder, extensions)
	files = String[]
	for (dir, _, names) in walkdir(folder), name in names
		lstrip(splitext(name)[2], '.') in extensions && push!(files, relpath(joinpath(dir, name), folder))
	end
	return sort(replace.(files, '\\' => '/'))
end

"""The title of a notebook: its first heading `# ...`, read from the JSON text (no JSON package needed)."""
function notebooktitle(file)
	heading = match(r"\"# (?<title>(?:[^\"\\]|\\[^n])+)", read(file, String))
	heading === nothing && return splitext(basename(file))[1]
	return unescape_string(heading[:title])
end

"""The entries of a notebook library: one per folder with a notebook."""
function notebooks(base, extensions)
	entries = Dict{String, Any}[]
	for id in sort(readdir(base))
		folder = joinpath(base, id)
		isdir(folder) || continue
		files = shipped(folder, extensions)
		notebook = findfirst(endswith(".ipynb"), files)
		notebook === nothing && continue
		push!(entries, Dict("id" => id, "title" => notebooktitle(joinpath(folder, files[notebook])), "folder" => folder, "files" => files))
	end
	return entries
end

"""The vignettes of the New Methods library: METHOD/vignette/METHOD.pdf, with the title and citation of its method.toml."""
function vignettes()
	entries = Dict{String, Any}[]
	for id in sort(readdir(joinpath(MEDIA, "methods")))
		folder = joinpath(MEDIA, "methods", id, "vignette")
		isfile(joinpath(folder, "$id.pdf")) || continue
		method = TOML.parsefile(joinpath(MEDIA, "methods", id, "method.toml"))
		title = get(method, "vignette_title", "")
		entry = Dict{String, Any}("id" => id, "title" => isempty(title) ? get(method, "title", id) : title, "folder" => folder, "files" => ["$id.pdf"])
		for key in ("citation", "topic")
			isempty(get(method, key, "")) || (entry[key] = strip(replace(method[key], r"\s+" => " ")))
		end
		push!(entries, entry)
	end
	return entries
end

function main(args)
	version = something(findfirst(==("--pollis"), args), 0)
	publish = something(findfirst(==("--publish"), args), 0)
	pollis = version > 0 ? args[version + 1] : match(r"\"pollisVersion\":\s*\"(?<version>[^\"]+)\"", read(joinpath(ROOT, "product.json"), String))[:version]
	clone = publish > 0 ? abspath(args[publish + 1]) : nothing
	previous = isfile(LIST) ? TOML.parsefile(LIST) : Dict{String, Any}()
	today = string(Dates.today())
	list = Dict{String, Any}()
	for (kind, entries) in (
		"vignettes" => vignettes(),
		"workflows" => notebooks(joinpath(MEDIA, "workflows"), ("ipynb", "jl", "tex", "bib")),
		"benchmarks" => notebooks(joinpath(MEDIA, "correctness"), ("ipynb", "jl", "dat")),
	)
		list[kind] = map(entries) do entry
			folder = pop!(entry, "folder")
			entry["sha256"] = [bytes2hex(sha256(read(joinpath(folder, file)))) for file in entry["files"]]
			old = something(findfirst(e -> e["id"] == entry["id"], get(previous, kind, [])), 0)
			old = old > 0 ? previous[kind][old] : Dict{String, Any}()
			unchanged = get(old, "files", nothing) == entry["files"] && get(old, "sha256", nothing) == entry["sha256"]
			entry["added"] = get(old, "added", today)
			entry["updated"] = unchanged ? old["updated"] : today
			entry["pollis"] = unchanged ? old["pollis"] : pollis
			unchanged || println("$kind/$(entry["id"]): updated $today, for Pollis $pollis and later")
			clone === nothing || for file in entry["files"]
				mkpath(dirname(joinpath(clone, kind, entry["id"], file)))
				cp(joinpath(folder, file), joinpath(clone, kind, entry["id"], file); force = true)
			end
			entry
		end
	end
	header = """
		# The content of Pollis that can be updated between releases, written by scripts/pollis-content.jl: Pollis
		# ships this list, and reads the one in the content repository once a day (pollisContent.ts).

		"""
	write(LIST, header * sprint(io -> TOML.print(io, list; sorted = true)))
	println("Wrote $LIST.")
	if clone !== nothing
		# The folders of entries no longer listed go
		for kind in keys(list), id in (isdir(joinpath(clone, kind)) ? readdir(joinpath(clone, kind)) : String[])
			any(e -> e["id"] == id, list[kind]) || rm(joinpath(clone, kind, id); recursive = true)
		end
		cp(LIST, joinpath(clone, "content.toml"); force = true)
		println("Copied the list and the files to $clone: commit and push it to publish them.")
	end
end

main(ARGS)
