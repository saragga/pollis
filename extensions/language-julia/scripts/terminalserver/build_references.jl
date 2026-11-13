# Pollis: makes the PollisReferences database again when what it is made from has changed, as when a window opens a
# Pollis Workspace other than the one whose references its views read (PollisDB.user_references_home). Run by the
# Julia extension in a hidden process (language-julia.pollisBuildReferences), with the packages install_pollisdb.jl
# installed; nothing is installed here.
include(joinpath(@__DIR__, "PollisDB.jl"))
PollisDB.build_references()
