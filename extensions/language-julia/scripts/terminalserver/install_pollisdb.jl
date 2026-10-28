# Pollis: installs DuckDB (Pollis' fork, which uses the DuckDB engine of Pollis), DBInterface, Tables, the
# PollisDatasets, PollisJournals, PollisReferences and PollisRSS, keeps them up to date, copies the references of
# PollisReferences beside those Pollis came with and the feeds of PollisRSS where Pollis reads them, and makes the four
# built-in databases together: PollisDatasets, PollisRSS (empty until feeds are read), PollisJournals and PollisReferences. Run by the Julia extension in a terminal of its own when the REPL reports that something is missing
# (PollisDB.needs_install), as install_revise.jl is for Revise.
include(joinpath(@__DIR__, "PollisDB.jl"))
PollisDB.install()
PollisDB.catalogue()
PollisDB.copy_package_data()
PollisDB.build()
PollisDB.build_rss()
PollisDB.build_journals()
PollisDB.build_references()
