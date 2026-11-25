# ---------------------------------------------------------------------------------------------
#  Copyright (c) 2026 Antonio Saragga Seabra
#  SPDX-License-Identifier: MIT
# ---------------------------------------------------------------------------------------------

# The hidden Julia process of the texts of Britannica Through the Editions, which the Julia extension runs
# (pollisBritannicaTexts.ts): it finds the texts of PollisBritannica.jl, which PollisDB installs into the environment of
# the packages built into Pollis, and downloads them the first time they are asked for, as `PollisBritannica.texts()`
# does in a notebook. The texts are a lazy artifact of the package, about 535 MB.

using UUIDs: UUID

"""The environment of the packages built into Pollis, where PollisDB installs PollisBritannica.jl."""
const POLLIS_ENVIRONMENT = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")
# After the user's environments, so that their own version of the package comes first
POLLIS_ENVIRONMENT in LOAD_PATH || push!(LOAD_PATH, POLLIS_ENVIRONMENT)

const POLLIS_BRITANNICA = Base.PkgId(UUID("db89cef9-ae45-49bd-8a72-96bae7fb52a2"), "PollisBritannica")
const ARTIFACTS = Base.PkgId(UUID("56f22d72-fd6d-98f1-02f0-08ddc0907c33"), "Artifacts")

"""A JSON object of one string field."""
json(key, value) = "{\"$key\":\"" * replace(value, '\\' => "\\\\", '"' => "\\\"") * "\"}"

say(key, value) = (println(json(key, value)); flush(stdout))

"""The file of the texts when they are on this computer, else ""."""
function located()
	path = Base.locate_package(POLLIS_BRITANNICA)
	path === nothing && return nothing
	toml = joinpath(dirname(dirname(path)), "Artifacts.toml")
	Artifacts = Base.require(ARTIFACTS)
	hash = Base.invokelatest(Artifacts.artifact_hash, "britannica_texts", toml)
	hash === nothing && return nothing
	file = joinpath(Base.invokelatest(Artifacts.artifact_path, hash), "texts.parquet")
	return isfile(file) ? file : ""
end

"""
What the Julia extension runs, with the task in its argument. It writes one line of JSON on stdout: {"path"}, the file
of the texts, "" when `locate` finds them missing; or {"error"}. The tasks:
  - `locate`: where the texts are, without downloading them;
  - `download`: downloads the texts, unless they are on this computer, and answers where they are.
"""
function main(task)
	file = located()
	if file === nothing
		say("error", "noPackage")
	elseif !isempty(file) || task == "locate"
		say("path", file)
	elseif task == "download"
		PollisBritannica = Base.require(POLLIS_BRITANNICA)
		say("path", Base.invokelatest(PollisBritannica.texts))
	else
		say("error", "noTask")
	end
end

try
	main(isempty(ARGS) ? "" : ARGS[1])
catch error
	say("error", sprint(showerror, error))
end
