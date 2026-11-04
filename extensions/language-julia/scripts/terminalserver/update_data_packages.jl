# Pollis: the Update buttons of Check for Data Package Updates... (the Pollis menu on macOS, the Help menu elsewhere)
# and of the Welcome page do at once what the REPL does at its start (install_pollisdb.jl): update the PollisDatasets, PollisJournals, PollisReferences and PollisRSS that
# Pollis installed, when GitHub has a newer commit, and makes the built-in databases again with their data. It also
# updates the PollisDatasets of the PDF tools' environment (pdf_tools.jl). Run by the Julia extension in a hidden
# process; its last line is POLLIS_DATA_PACKAGES and a JSON object: {"updated": [names], "offline": true or false}.
include(joinpath(@__DIR__, "PollisDB.jl"))
import Pkg

todo = PollisDB.pending()
# GitHub answered for none of the packages: offline (a copy in the user's own environment is never asked about)
offline = all(d -> d.latest === nothing, todo.data)
updated = String[]
if PollisDB.needs_install()
    PollisDB.install()
    # Updated when the commit installed is now GitHub's: Pkg may have failed on one, which keeps its old copy
    for d in todo.data
        if (d.missing || d.outdated) && d.latest !== nothing && isfile(d.commit) && strip(read(d.commit, String)) == d.latest
            push!(updated, d.pkg.name)
        end
    end
    PollisDB.catalogue()
    PollisDB.copy_package_data()
    PollisDB.build()
    PollisDB.build_rss()
    PollisDB.build_journals()
    PollisDB.build_references()
end

# The PDF tools have a PollisDatasets of their own, for the sample PDF, which nothing else updates
const PDF_ENVIRONMENT = joinpath(homedir(), ".pollis", "pdf", "julia", "v$(VERSION.major).$(VERSION.minor)")
const PDF_MANIFEST = joinpath(PDF_ENVIRONMENT, "Manifest.toml")
if !offline && isfile(PDF_MANIFEST)
    try
        Pkg.activate(PDF_ENVIRONMENT; io = devnull)
        if haskey(Pkg.project().dependencies, "PollisDatasets")
            before = read(PDF_MANIFEST, String)
            Pkg.update("PollisDatasets"; update_registry = false, io = devnull)
            read(PDF_MANIFEST, String) != before && !("PollisDatasets" in updated) && push!(updated, "PollisDatasets")
        end
    catch err
        @debug "Pollis: the PollisDatasets of the PDF tools not updated" exception = err
    end
end

println("POLLIS_DATA_PACKAGES {\"updated\":[", join(("\"$name\"" for name in updated), ","), "],\"offline\":", offline, "}")
