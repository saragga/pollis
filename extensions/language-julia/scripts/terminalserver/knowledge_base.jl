# ---------------------------------------------------------------------------------------------
#  Copyright (c) 2026 Antonio Saragga Seabra
#  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
# ---------------------------------------------------------------------------------------------

# The hidden Julia process of the Knowledge Base page (Compose > Knowledge for AI Models > Knowledge Base), which the
# Julia extension runs (pollisKnowledgeBase.ts): it reads the catalogue of PollisKnowledge.jl, which PollisDB installs
# into the environment of the packages built into Pollis, and downloads a text the page switches on; a notebook calls
# the same functions.

using UUIDs: UUID

"""The environment of the packages built into Pollis, where PollisDB installs PollisKnowledge.jl."""
const POLLIS_ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")
# After the user's environments, so that their own version of the package comes first
POLLIS_ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, POLLIS_ENVIRONMENT)

const POLLIS_KNOWLEDGE = Base.PkgId(UUID("20c90171-e345-48e2-b3f5-e1c5e5b81d48"), "PollisKnowledge")

"""`value` as JSON: a string, a number, a Boolean, nothing, a vector, a named tuple or a dictionary of them."""
function json(value)
	if value === nothing
		"null"
	elseif value isa Bool || value isa Real
		string(value)
	elseif value isa AbstractString
		io = IOBuffer()
		print(io, '"')
		for character in value
			if character == '"' || character == '\\'
				print(io, '\\', character)
			elseif character == '\n'
				print(io, "\\n")
			elseif character < ' '
				print(io, "\\u", string(UInt16(character); base = 16, pad = 4))
			else
				print(io, character)
			end
		end
		print(io, '"')
		String(take!(io))
	elseif value isa AbstractVector
		"[" * join(json.(value), ",") * "]"
	else
		pairs_of = value isa NamedTuple ? pairs(value) : value
		"{" * join([json(string(key)) * ":" * json(item) for (key, item) in pairs_of], ",") * "}"
	end
end

say(value) = (println(json(value)); flush(stdout))

"""The documents of a text downloaded, as the page keeps them: file, title and kind."""
documents_of(PK, id) = [(; file = d.file, title = d.title, kind = d.kind) for d in PK.documents(id)]

"""
What the Julia extension runs, with the task as JSON in its argument. It writes one line of JSON on stdout: what the
task answers, or {"error"}. The tasks:
  - {"task": "texts"}: answers {texts}, the entries of the catalogue, each with `downloaded` and, when it is, its `documents`;
  - {"task": "download", "id"}: downloads the text `id`, unless it is on this computer, and answers {documents}.
"""
function main(task_json)
	if Base.locate_package(POLLIS_KNOWLEDGE) === nothing
		say((; error = "notInstalled"))
		return
	end
	PK = Base.require(POLLIS_KNOWLEDGE)
	Base.invokelatest(run_task, PK, task_json)
end

function run_task(PK, task_json)
	task = match(r"\"task\"\s*:\s*\"(?<task>[a-z]+)\"", task_json)
	id = match(r"\"id\"\s*:\s*\"(?<id>[a-z0-9_]+)\"", task_json)
	try
		if task !== nothing && task[:task] == "texts"
			texts = map(PK.catalogue()) do entry
				downloaded = PK.downloaded(entry["id"])
				merge(entry, Dict("downloaded" => downloaded, "documents" => downloaded ? documents_of(PK, entry["id"]) : []))
			end
			say((; texts))
		elseif task !== nothing && task[:task] == "download" && id !== nothing
			say((; documents = documents_of(PK, id[:id])))
		else
			say((; error = "no task in $(task_json)"))
		end
	catch failure
		say((; error = sprint(showerror, failure)))
	end
end

main(ARGS[1])
