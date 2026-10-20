# Pollis: installs DuckDB (Pollis' fork, which uses the DuckDB engine of Pollis), DBInterface, Tables, the
# PollisDatasets and PollisJournals, keeps the PollisDatasets and PollisJournals up to date, and makes the three
# built-in databases together: PollisDatasets, PollisRSS (empty until feeds are read) and PollisJournals; then
# loads the Lance extension once, so that its first, slow load is paid here. Run by the Julia extension in a terminal of its own when the REPL reports that something is missing
# (PollisDB.needs_install), as install_revise.jl is for Revise.
include(joinpath(@__DIR__, "PollisDB.jl"))
PollisDB.install()
PollisDB.catalogue()
PollisDB.build()
PollisDB.build_rss()
PollisDB.build_journals()
PollisDB.warm_lance()
