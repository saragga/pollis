# POLLIS: REPL-backed documentation lookup for the Julia "Documentation" pane.
#
# The upstream pane fetched docs exclusively from LanguageServer.jl (the custom
# `julia/getDocFromWord` LSP request). Pollis runs without that language server,
# so docs are instead resolved here from the live REPL session using the same
# machinery as REPL help mode (`?foo`), rendered back to canonical Markdown for
# the webview. Unknown symbols yield Julia's own "No documentation found" markdown.

function repl_getdocfromword_request(conn, params::NamedTuple{(:word,),Tuple{String}}, @nospecialize(token))
    word = strip(params.word)
    isempty(word) && return ""

    return try
        # `REPL.helpmode` builds the expression that `?word` would evaluate; eval'ing
        # it in Main resolves names against the user's current session (loaded packages).
        docexpr = if hasmethod(REPL.helpmode, Tuple{IO,AbstractString,Module})
            Base.invokelatest(REPL.helpmode, devnull, String(word), Main)
        else
            Base.invokelatest(REPL.helpmode, devnull, String(word))
        end
        docobj = Base.invokelatest(Core.eval, Main, docexpr)

        io = IOBuffer()
        try
            # Canonical Markdown is what the webview's markdown renderer expects.
            Base.invokelatest(Markdown.plain, io, docobj)
        catch
            # Fallback for doc objects that are not a Markdown.MD.
            Base.invokelatest(show, io, MIME("text/plain"), docobj)
        end
        String(take!(io))
    catch
        ""
    end
end
