# ---------------------------------------------------------------------------------------------
#  Copyright (c) 2026 Antonio Saragga Seabra
#  SPDX-License-Identifier: MIT
# ---------------------------------------------------------------------------------------------

# The hidden Julia process of the texts of Britannica Through the Editions and Larousse Through the Editions, which the
# Julia extension runs (pollisEncyclopediaTexts.ts): it finds the texts of PollisBritannica.jl or PollisLarousse.jl,
# which PollisDB installs into the environment of the packages built into Pollis, and downloads them the first time they
# are asked for, as `PollisBritannica.texts()` and `PollisLarousse.texts()` do in a notebook. The texts are a lazy
# artifact of each package, about 535 MB for the Britannica and 250 MB for the Larousses.

using UUIDs: UUID

"""The environment of the packages built into Pollis, where PollisDB installs the packages of the encyclopedias."""
const POLLIS_ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")
# After the user's environments, so that their own version of a package comes first
POLLIS_ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, POLLIS_ENVIRONMENT)

"""The package of each encyclopedia, and the name of the artifact of its texts."""
const ENCYCLOPEDIAS = Dict(
	"britannica" => (pkg = Base.PkgId(UUID("db89cef9-ae45-49bd-8a72-96bae7fb52a2"), "PollisBritannica"), artifact = "britannica_texts"),
	"larousse" => (pkg = Base.PkgId(UUID("fc9f601d-d1b6-4016-bab9-0946768533ff"), "PollisLarousse"), artifact = "larousse_texts"),
)
const ARTIFACTS = Base.PkgId(UUID("56f22d72-fd6d-98f1-02f0-08ddc0907c33"), "Artifacts")

"""A JSON object of one string field."""
json(key, value) = "{\"$key\":\"" * replace(value, '\\' => "\\\\", '"' => "\\\"") * "\"}"

say(key, value) = (println(json(key, value)); flush(stdout))

"""The file of the texts of `encyclopedia` when they are on this computer, else ""; `nothing` when its package is not installed."""
function located(encyclopedia)
	path = Base.locate_package(encyclopedia.pkg)
	path === nothing && return nothing
	toml = joinpath(dirname(dirname(path)), "Artifacts.toml")
	Artifacts = Base.require(ARTIFACTS)
	hash = Base.invokelatest(Artifacts.artifact_hash, encyclopedia.artifact, toml)
	hash === nothing && return nothing
	file = joinpath(Base.invokelatest(Artifacts.artifact_path, hash), "texts.parquet")
	return isfile(file) ? file : ""
end

"""
What the Julia extension runs, with the task and the encyclopedia (britannica or larousse) in its arguments. It writes
one line of JSON on stdout: {"path"}, the file of the texts, "" when `locate` finds them missing; or {"error"}. The tasks:
  - `locate`: where the texts are, without downloading them;
  - `download`: downloads the texts, unless they are on this computer, and answers where they are.
"""
function main(task, name)
	encyclopedia = get(ENCYCLOPEDIAS, name, nothing)
	if encyclopedia === nothing
		return say("error", "noEncyclopedia")
	end
	file = located(encyclopedia)
	if file === nothing
		say("error", "noPackage")
	elseif !isempty(file) || task == "locate"
		say("path", file)
	elseif task == "download"
		package = Base.require(encyclopedia.pkg)
		say("path", Base.invokelatest(package.texts))
	else
		say("error", "noTask")
	end
end

try
	main(get(ARGS, 1, ""), get(ARGS, 2, "britannica"))
catch error
	say("error", sprint(showerror, error))
end
