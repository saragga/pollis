# Copyright (c) 2026 Antonio Saragga Seabra
# SPDX-License-Identifier: MIT

# Pollis: where the LaTeX source of a PDF that Pollis compiles is, for Edit the LaTeX Source in the PDF Viewer, which
# copies it into the documents folder of the Pollis Workspace (compose/browser/userDocumentsPage.ts). Included by
# compile_documents.jl and compile_vignette.jl. The PDF says where, in its document information, as PollisSource: the
# main .tex of a copy of its sources, NAME.source/ beside NAME.pdf, or, for a document of the user's, their own main
# file. The path is written from the home folder, as ~/..., so that a PDF passed on does not carry the user's folders.
# The copy holds the files Tectonic read for the document (--makefile-rules), laid out as compile_vignette.jl takes a
# document: the .tex and .bib files, style files and pictures beside the main file, everything else in resources/, the
# paths of the .tex files that name them changed to match. A copy compiles in User Documents as it is.

"""The extensions of the files beside the main file that make a document; the files of resources/ and chapters/ make it too."""
const DOCUMENT_EXTENSIONS = (".tex", ".bib", ".sty", ".cls", ".bst", ".png", ".jpg", ".jpeg", ".pdf")

"""
Whether a file of a document's folder, by its path from that folder with /, goes into compiling the document: beside
the main file, or in resources/, or in chapters/, those of a book of Collate Documents (collateDocumentsPage.ts).
"""
document_file(path) = (!occursin('/', path) && lowercase(splitext(path)[2]) in DOCUMENT_EXTENSIONS) || startswith(path, "resources/") || startswith(path, "chapters/")

"""A path as PollisSource gives it: from the home folder as ~, with /."""
function home_path(path)
	home = homedir()
	shown = startswith(path, home * Base.Filesystem.path_separator) ? "~" * path[length(home) + 1:end] : path
	replace(shown, '\\' => '/')
end

"""The line that, put before \\documentclass, writes `path` in the PDF's document information as PollisSource."""
function source_docinfo(path)
	# A string of the PDF in hexadecimal, UTF-16 with its byte order mark, so that no path needs escaping
	hex = "FEFF" * join(string(unit; base = 16, pad = 4) for unit in transcode(UInt16, home_path(path)))
	"\\AddToHook{shipout/firstpage}{\\special{pdf:docinfo<</PollisSource<$hex>>>}}\n"
end

"""The files Tectonic read for a document, from the rules it wrote (--makefile-rules): their paths, as it gave them."""
function read_dependencies(rules)
	text = replace(read(rules, String), "\\\n" => " ")
	colon = findfirst(r"(?<!\\) *: ", text)
	colon === nothing && return String[]
	inputs = strip(text[last(colon) + 1:end])
	[replace(replace(input, "\\ " => " "), '\\' => '/') for input in split(inputs, r"(?<!\\)\s+") if !isempty(input)]
end

"""
Writes the copy of a document's sources to `target`: `file`, the main file, with its text as written (`original`, before
the lines Pollis puts at its top), and the files it read by the rules of Tectonic, `rules`, from `folder`.
"""
function save_source(folder, file, original, rules, target)
	rm(target; force = true, recursive = true)
	isfile(rules) || return
	# Each file of the copy, from where it is in the folder to where it goes in the copy, and the paths that change
	files = Pair{String, String}[]
	prefixes = Dict{String, String}()
	names = Dict{String, String}()
	for path in read_dependencies(rules)
		(isabspath(path) || path == file || basename(path) == "pollis_ask_labels.tex") && continue
		normal = replace(normpath(path), '\\' => '/')
		isfile(joinpath(folder, normal)) || continue
		if !startswith(normal, "../") && document_file(normal)
			push!(files, normal => normal)
			continue
		end
		moved = "resources/" * replace(normal, r"^(\.\./)+" => "")
		push!(files, normal => moved)
		if occursin('/', path)
			prefixes[dirname(path) * "/"] = dirname(moved) * "/"
		else
			names[path] = moved
			names[splitext(path)[1]] = splitext(moved)[1]
		end
	end
	# A path in braces or after a comma, as \includegraphics{...}, \input{...} and \graphicspath{{...}} name them
	function rewrite(text)
		for (old, new) in names
			text = replace(text, Regex("(?<=[{,])\\Q$old\\E(?=[},])") => new)
		end
		# The longest first: ../tour/images/ before ../
		for (old, new) in sort!(collect(prefixes); by = pair -> -length(first(pair)))
			text = replace(text, Regex("(?<=[{,])\\Q$old\\E") => new)
		end
		text
	end
	mkpath(target)
	write(joinpath(target, file), rewrite(original))
	for (from, to) in files
		mkpath(dirname(joinpath(target, to)))
		if lowercase(splitext(from)[2]) in (".tex", ".sty", ".cls")
			write(joinpath(target, to), rewrite(read(joinpath(folder, from), String)))
		else
			cp(joinpath(folder, from), joinpath(target, to); force = true)
		end
	end
end
