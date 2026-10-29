# Pollis: makes PollisDocuments, ~/.pollis/documents/PollisDocuments.duckdb, the passages of Pollis' documents that Ask
# Pollis searches. Run by the Julia extension in a hidden process of low priority (pollisDocuments.ts), after the
# documents are compiled, with five arguments: the list of what to read, a JSON file of {kind, title, file, menu,
# toolbox, collection}, which the command pollis.askPollis.sources gives (askPollisSources.ts), a document of Pollis
# when it has no collection; the embedding model, as the setting pollis.ask.embeddingModel names it; what a passage is
# given to it as (pollis.ask.passagePrefix, with {title} and {text}); 1 when the model is on this computer, else 0; and
# 1 when the Julia Manual is searched too (pollis.ask.juliaManual), else 0. The list has the package vignettes compiled,
# in ~/.pollis/documents/vignettes. A PDF's text is read with pdftotext (Poppler_jll), a page at a time, and cut under
# its headings with the .labels compile_documents.jl or compile_vignette.jl puts beside it; a wiki is cut at its headings. The Julia Manual is that
# of the Julia that runs this, which comes with it, so that a Julia updated has its own: the Manual, Base and the
# standard library, from the search index Documenter writes beside its HTML, a section or a docstring an entry, each
# passage with the page and anchor it is at. Each is cut into passages of about 250 words, at paragraphs, each carrying
# the last sentence of the one before, when it is short. The passages of a document that has not changed since the last
# index (its kind, title, menu, toolbox and the size and date of its file) are copied from it. The embeddings come from
# ~/.pollis/documents/embeddings.duckdb, by the model and the text it was given, so that no text is embedded twice; each
# collection is listed with its number of passages (collections). The index is written to
# PollisDocuments.duckdb.partial, its full-text index (fts, BM25) built, and renamed over the last; on Windows a session
# that has it attached keeps the old one, and the next start tries again. When passages have no embedding yet and the
# model is on this computer, the index is published first without them, for the search by words; the script then writes
# {"embed": n} and reads from stdin the address of an embedding server of llama.cpp (pollisLlamaServer.ts), or an empty
# line; it embeds the passages into embeddings.duckdb, which keeps what is done if it is stopped, and publishes the
# index again. Its own environment is that of compile_documents.jl, which gets Poppler_jll the first time; DuckDB is the
# one built into Pollis. It writes a line of JSON on stdout as it goes: {"status": "installing"} while it installs
# Poppler_jll, {"total"} when it starts, {"done", "total"} as each document is read, {"embedding", "total"} as passages
# are embedded, {"passages", "embedded"} when an index is published, {"error"} when it cannot be made: "noDuckDB" when
# the packages of the built-in databases are not installed yet, at Pollis' first start. Nothing is written when nothing
# has changed.
import Pkg

const SOURCES = abspath(ARGS[1])
"""The embedding model, and what a passage is given to it as: `{title}`, its document and headings, and `{text}`."""
const EMBEDDER = ARGS[2]
const PREFIX = ARGS[3]
"""The collection of a document the list gives none: Pollis' own documents, wikis and vignettes."""
const POLLIS = "Pollis"
"""Whether the embedding model is on this computer, so that the passages without an embedding can be embedded."""
const EMBEDDABLE = ARGS[4] == "1"
"""Whether the Julia Manual is read, as a collection of its own."""
const JULIA_MANUAL = ARGS[5] == "1"
const MANUAL = "Julia Manual"
"""The search index of the documentation that comes with this Julia: some packages of Julia for Linux leave it out."""
const MANUAL_INDEX = normpath(joinpath(Sys.BINDIR, "..", "share", "doc", "julia", "html", "en", "search_index.js"))
"""The pages of the Manual, Base and the standard library: not the developer docs or the news."""
const MANUAL_PAGES = raw"^(?:index\.html|manual/|base/|stdlib/)"
"""
The table of Unicode Input, a character a line, which is left out: its names (Rocket, File Folder, Calendar) would be
found for questions that are not about it. The text before it, how to type a character, is kept.
"""
const UNICODE_TABLE = r"^(?:Code point\(s\)|U\+[0-9A-F]{4,})"
const OUTPUT = joinpath(homedir(), ".pollis", "documents")
const DATABASE = joinpath(OUTPUT, "PollisDocuments.duckdb")
const PARTIAL = DATABASE * ".partial"
const ENVIRONMENT = joinpath(OUTPUT, "julia", "v$(VERSION.major).$(VERSION.minor)")
"""The environment of the packages built into Pollis, where DuckDB is."""
const BUILTIN = joinpath(homedir(), ".pollis", "julia", "environments", "v$(VERSION.major).$(VERSION.minor)")
"""The fts extension of DuckDB, which the Julia extension unpacks from Pollis."""
const FTS = joinpath(homedir(), ".pollis", "duckdb", "fts.duckdb_extension")
"""The embeddings made, by the model and the text it was given: what an index takes its embeddings from."""
const EMBEDDINGS = joinpath(OUTPUT, "embeddings.duckdb")
"""About how many words a passage has."""
const WORDS = 250
"""The longest text the embedding model is given, in characters: well inside the 2,048 tokens of its server."""
const LONGEST = 4000
"""How many passages go to the embedding model in one request."""
const BATCH = 32
const CONFIG = ["autoinstall_known_extensions" => "false", "autoload_known_extensions" => "false"]
# allow-any-unicode-next-line
const ARROW = " › "
# A wiki passage of fewer words is joined with the next, under the headings they share; and the longest sentence
# carried from one passage to the next
const SHORT = 60

say(line) = (println(line); flush(stdout))
sql(text) = "'" * replace(text, "'" => "''") * "'"

Pkg.activate(ENVIRONMENT; io = devnull)
if !any(info -> info.name == "Poppler_jll" && info.is_direct_dep, values(Pkg.dependencies()))
	say("{\"status\":\"installing\"}")
	Pkg.add("Poppler_jll"; io = devnull)
end
push!(LOAD_PATH, BUILTIN)

# At the first start, the REPL installs them while this runs: the extension runs it again once they are installed
if any(name -> Base.identify_package(name) === nothing, ("DuckDB", "DBInterface", "Tables"))
	say("{\"error\":\"noDuckDB\"}")
	exit(1)
end

using Poppler_jll, DuckDB, DBInterface, Tables, SHA, Downloads

if !isfile(FTS)
	say("{\"error\":\"noFts\"}")
	exit(1)
end

"""What the passages are cut by: this script, so that a change to how it cuts them reads every document again."""
const SCRIPT = bytes2hex(SHA.sha256(read(@__FILE__)))

"""
A document read, kept with no passages when it has none (a wiki not written yet): `version` is the size and date of
its file, `collection` what it is searched with (Pollis, the Julia Manual).
"""
struct Document
	kind::String
	title::String
	source::String
	menu::String
	toolbox::String
	version::String
	collection::String
end

"""
A passage before it is written: its page (`missing` in a wiki), the headings it is under, its text, and in the Julia
Manual the HTML page and anchor it is at.
"""
struct Passage
	page::Union{Int, Missing}
	heading::String
	text::String
	anchor::String
end

Passage(page, heading, text) = Passage(page, heading, text, "")

version(file) = "$(filesize(file))-$(round(Int, mtime(file)))"

"""The documents to read: those of the list that exist."""
function documents()
	db = DuckDB.DB(":memory:"; config = CONFIG)
	rows = Tables.rowtable(DBInterface.execute(db, "SELECT * FROM read_json(?, format = 'array', columns = {kind: 'VARCHAR', title: 'VARCHAR', file: 'VARCHAR', menu: 'VARCHAR', toolbox: 'VARCHAR', collection: 'VARCHAR'})", [SOURCES]))
	DBInterface.close!(db)
	found = [Document(row.kind, row.title, row.file, row.menu, row.toolbox, version(row.file), coalesce(row.collection, POLLIS)) for row in rows if isfile(row.file)]
	JULIA_MANUAL && isfile(MANUAL_INDEX) && push!(found, Document("julia", MANUAL, MANUAL_INDEX, "", "", "$VERSION-$(version(MANUAL_INDEX))", MANUAL))
	return found
end

"""The documents of the last index, with what it was built by (`built`: script, embedder, prefix, passages, embedded), or nothing when there is none that can be read."""
function last_index()
	isfile(DATABASE) || return nothing
	try
		db = DuckDB.DB(":memory:"; config = CONFIG)
		DBInterface.execute(db, "ATTACH $(sql(DATABASE)) AS last (READ_ONLY)")
		rows = Tables.rowtable(DBInterface.execute(db, "SELECT kind, title, source, menu, toolbox, version, collection FROM last.documents"))
		built = Dict(row.name => row.value for row in Tables.rowtable(DBInterface.execute(db, "SELECT name, value FROM last.built")))
		DBInterface.close!(db)
		return (documents = Set(Document(row...) for row in rows), built = built, script = get(built, "script", ""))
	catch
		return nothing
	end
end

# ---------------------------------------------------------------- text

"""A heading or a line as it is compared: its letters and digits, in lower case."""
key(text) = lowercase(replace(text, r"[^\p{L}\p{N}]+" => ""))

wordcount(text) = count(r"\S+", text)

sentences(text) = split(text, r"(?<=[.!?])\s+(?=[\p{Lu}\p{N}\"(])")

"""Opens a heading at `level` (1 the first) of `headings`: those below it close, any missing above it are empty."""
function open_heading!(headings, level, text)
	while length(headings) < level - 1
		push!(headings, "")
	end
	resize!(headings, level - 1)
	push!(headings, text)
end

"""The text of a heading as LaTeX wrote it to the .labels: without its commands, the second argument of \\texorpdfstring kept."""
function label_text(text)
	text = replace(text, r"\\ifttl@toclabel.*?\\fi\s*" => "", r"\\numberline\s*\{[^{}]*\}" => "", r"\\color\s*\{[^{}]*\}" => "")
	text = replace(text, r"\\texorpdfstring\s*\{(?:[^{}]|\{[^{}]*\})*\}\s*\{(?<pdf>(?:[^{}]|\{[^{}]*\})*)\}" => s"\g<pdf>")
	text = replace(text, r"\\(?<char>[&%_#$])" => s"\g<char>", r"\\(?:enspace|quad|qquad|,|;| )\s*|~" => " ")
	text = replace(text, r"\\[A-Za-z@]+\*?\s*" => "", r"[{}]" => "")
	return strip(replace(text, r"\s+" => " "))
end

"""The headings of a compiled document, page by page: (level, text), the topic or section 1, a heading inside it 2."""
function labels(pdf)
	file = splitext(pdf)[1] * ".labels"
	found = Dict{Int, Vector{Tuple{Int, String}}}()
	isfile(file) || return found
	for line in eachline(file)
		parts = split(line, '|'; limit = 3)
		length(parts) == 3 || continue
		page = tryparse(Int, parts[1])
		page === nothing && continue
		level = parts[2] in ("1", "part", "chapter", "section") ? 1 : parts[2] in ("2", "subsection") ? 2 : 3
		text = label_text(parts[3])
		isempty(text) || push!(get!(found, page, Tuple{Int, String}[]), (level, text))
	end
	return found
end

"""Joins the lines of a paragraph: a word cut at the end of a line is joined again when the document has it whole."""
function join_lines(lines, words)
	text = ""
	for line in lines
		if isempty(text)
			text = line
		elseif occursin(r"^(?:[•\-–*]|\d+[.)])\s", line)
			text *= "\n" * line
		elseif (m = match(r"(?<head>\p{L}+)-$", text)) !== nothing && (n = match(r"^(?<tail>\p{Ll}+)", line)) !== nothing
			text = lowercase(m[:head] * n[:tail]) in words ? text[1:prevind(text, end)] * line : text * line
		else
			text *= " " * line
		end
	end
	return text
end

"""Cuts the paragraphs of a run under one heading into passages of about `WORDS` words, each but the first carrying the last sentence of the one before."""
function passages!(found, paragraphs, page, heading)
	pieces = String[]
	for paragraph in paragraphs
		if wordcount(paragraph) <= WORDS
			push!(pieces, paragraph)
			continue
		end
		# A paragraph longer than a passage is cut at its sentences; a sentence longer than one, a table or code, at its lines
		part = ""
		for sentence in sentences(paragraph), (k, line) in enumerate(wordcount(sentence) > WORDS ? split(sentence, '\n') : [sentence])
			if !isempty(part) && wordcount(part) + wordcount(line) > WORDS
				push!(pieces, part)
				part = ""
			end
			part = isempty(part) ? line : part * (k > 1 ? "\n" : " ") * line
		end
		isempty(part) || push!(pieces, part)
	end
	text = ""
	emit() = if wordcount(text) >= 3
		previous = isempty(found) || found[end].heading != heading ? "" : last(sentences(found[end].text))
		# Lines without a sentence's end, as a table's, are not carried
		wordcount(previous) > SHORT && (previous = "")
		push!(found, Passage(page, heading, isempty(previous) || startswith(text, previous) ? text : previous * "\n" * text))
	end
	for piece in pieces
		if !isempty(text) && wordcount(text) + wordcount(piece) > WORDS
			emit()
			text = ""
		end
		text = isempty(text) ? piece : text * "\n\n" * piece
	end
	isempty(text) || emit()
	return found
end

"""The passages of a PDF: its pages read with pdftotext, cut under the headings of its .labels."""
function pdf_passages(pdf)
	pages = split(read(`$(pdftotext()) -enc UTF-8 $pdf -`, String), '\f')
	isempty(last(pages)) && pop!(pages)
	pages = [replace(page, '\u2011' => '-', '\u00ad' => "", '\ufb01' => "fi", '\ufb02' => "fl") for page in pages]
	words = Set(lowercase(m.match) for page in pages for m in eachmatch(r"\p{L}+", page))
	# The running titles and footers: a line on many of the pages, its numbers aside; and the page numbers
	seen = Dict{String, Int}()
	for page in pages, line in unique(key(replace(line, r"\d+" => "")) for line in split(page, '\n'))
		isempty(line) || (seen[line] = get(seen, line, 0) + 1)
	end
	running = Set(line for (line, n) in seen if length(pages) >= 4 && n >= max(3, 0.4 * length(pages)))
	headings = labels(pdf)
	open_headings = String[]
	found = Passage[]
	for (page, text) in enumerate(pages)
		lines = [strip(line) for line in split(text, '\n')]
		marks = get(headings, page, Tuple{Int, String}[])
		# Where each heading of the page is: the lines that spell it, else after the heading before it
		at = zeros(Int, length(marks))
		span = ones(Int, length(marks))
		from = 1
		for (j, (_, heading)) in enumerate(marks)
			wanted = key(heading)
			for i in from:length(lines), n in 1:3
				i + n - 1 <= length(lines) || break
				# A numbered section is spelled with its number: 5.3 How many
				if key(replace(join(lines[i:i + n - 1], " "), r"^\d+(?:\.\d+)*\s+" => "")) == wanted
					at[j], span[j], from = i, n, i + n
					@goto located
				end
			end
			at[j] = j == 1 ? 0 : at[j - 1]
			span[j] = 0
			@label located
		end
		heading = join(filter(!isempty, open_headings), ARROW)
		paragraphs = String[]
		paragraph = String[]
		close_paragraph() = if !isempty(paragraph)
			push!(paragraphs, join_lines(paragraph, words))
			empty!(paragraph)
		end
		open_heading(j) = begin
			close_paragraph()
			passages!(found, paragraphs, page, heading)
			empty!(paragraphs)
			open_heading!(open_headings, marks[j]...)
			heading = join(filter(!isempty, open_headings), ARROW)
		end
		foreach(open_heading, findall(==(0), at))
		# The lines that spell a heading are not text
		after = 1
		for (i, line) in enumerate(lines)
			i < after && continue
			starting = findall(==(i), at)
			if !isempty(starting)
				foreach(open_heading, starting)
				after = i + maximum(span[starting])
				after > i && continue
			end
			k = key(replace(line, r"\d+" => ""))
			if isempty(line)
				close_paragraph()
			elseif !(k in running || occursin(r"^\d+$", line) || key(line) in map(key, open_headings))
				push!(paragraph, line)
			end
		end
		close_paragraph()
		passages!(found, paragraphs, page, heading)
	end
	return found
end

"""
Joins each short passage of a wiki, of fewer than `SHORT` words, with the next, while
together they have at most `WORDS`: under the headings they share, each part after the headings of its own below
them, when those differ from the part's before.
"""
function join_short(found)
	joined = Passage[]
	group = Passage[]
	path(passage) = split(passage.heading, ARROW)
	function shared(passages)
		common = path(passages[1])
		for passage in passages[2:end]
			other = path(passage)
			n = something(findfirst(k -> k > length(other) || other[k] != common[k], eachindex(common)), length(common) + 1) - 1
			common = common[1:n]
		end
		return common
	end
	function close_group()
		isempty(group) && return
		if length(group) == 1
			push!(joined, group[1])
		else
			common = shared(group)
			parts = String[]
			before = SubString{String}[]
			for passage in group
				own = path(passage)[length(common) + 1:end]
				push!(parts, isempty(own) || own == before ? passage.text : join(own, ARROW) * "\n" * passage.text)
				before = own
			end
			push!(joined, Passage(group[1].page, join(common, ARROW), join(parts, "\n\n"), group[1].anchor))
		end
		empty!(group)
	end
	words = 0
	for passage in found
		n = wordcount(passage.text)
		if !isempty(group) && (words < SHORT || n < SHORT) && words + n <= WORDS
			push!(group, passage)
			words += n
		else
			close_group()
			push!(group, passage)
			words = n
		end
	end
	close_group()
	return joined
end

"""Markdown as text: links and images by their words, without emphasis or the backquotes of code."""
markdown_text(line) = replace(line, r"!?\[(?<words>[^\]]*)\]\([^)]*\)" => s"\g<words>", r"\*\*|__|`" => "")

"""The passages of a wiki, cut at its headings, `nothing` for a wiki still "Not written yet."."""
function wiki_passages(file, title)
	lines = readlines(file)
	body = filter(line -> !isempty(strip(line)) && !startswith(line, "# "), lines)
	(isempty(body) || strip(join(body, " ")) == "Not written yet.") && return nothing
	name = something(findfirst(line -> startswith(line, "# "), lines), 0)
	open_headings = [title, name == 0 ? "" : strip(lines[name][3:end])]
	found = Passage[]
	paragraphs = String[]
	paragraph = String[]
	heading() = join(filter(!isempty, open_headings), ARROW)
	close_paragraph() = if !isempty(paragraph)
		push!(paragraphs, join(paragraph, "\n"))
		empty!(paragraph)
	end
	i = 0
	while (i += 1) <= length(lines)
		line = lines[i]
		if (m = match(r"^(?<hashes>#{2,4})\s+(?<text>.+)$", line)) !== nothing
			close_paragraph()
			passages!(found, paragraphs, missing, heading())
			empty!(paragraphs)
			# The panel and the wiki are the first two headings, ## the third
			open_heading!(open_headings, length(m[:hashes]) + 1, strip(markdown_text(m[:text])))
		elseif startswith(line, "```")
			# A code block stays whole, with the paragraph that introduces it
			block = [line]
			while (i += 1) <= length(lines)
				push!(block, lines[i])
				startswith(lines[i], "```") && break
			end
			close_paragraph()
			code = join(block, "\n")
			isempty(paragraphs) ? push!(paragraphs, code) : (paragraphs[end] *= "\n" * code)
		elseif startswith(strip(line), "|")
			# A table, a row at a time, each value after its column's heading
			close_paragraph()
			cells(row) = [strip(markdown_text(cell)) for cell in split(strip(strip(row), '|'), '|')]
			columns = cells(line)
			while i + 1 <= length(lines) && startswith(strip(lines[i + 1]), "|")
				row = cells(lines[i += 1])
				all(cell -> occursin(r"^:?-+:?$", cell), row) && continue
				# A column without a heading gives its value alone
				label(k) = isempty(get(columns, k, "")) ? "" : "$(columns[k]): "
				push!(paragraphs, join(["$(label(k))$cell" for (k, cell) in enumerate(row) if !isempty(cell)], "; "))
			end
		elseif isempty(strip(line))
			close_paragraph()
		elseif !startswith(line, "# ")
			push!(paragraph, markdown_text(rstrip(line)))
		end
	end
	close_paragraph()
	passages!(found, paragraphs, missing, heading())
	return join_short(found)
end

"""
The passages of the Julia Manual, from its search index: an entry, a section or a docstring, under its page and title,
cut at its paragraphs; the short ones joined as a wiki's, within their page.
"""
function manual_passages(file)
	db = DuckDB.DB(":memory:"; config = CONFIG)
	# The index is a script that sets a variable to its JSON: what comes before the JSON is cut
	entries = Tables.rowtable(DBInterface.execute(db, """
		SELECT * FROM (
			SELECT unnest(from_json(regexp_replace(content, '^[^{]*', ''), '{"docs": [{"location": "VARCHAR", "page": "VARCHAR", "title": "VARCHAR", "text": "VARCHAR"}]}').docs, recursive := true)
			FROM read_text(?))
		WHERE regexp_matches(location, ?)""", [file, MANUAL_PAGES]))
	DBInterface.close!(db)
	found = Passage[]
	page = Passage[]
	html = ""
	for entry in entries
		at = first(split(entry.location, '#'))
		if at != html
			append!(found, join_short(page))
			page = Passage[]
			html = at
		end
		title = coalesce(entry.title, "")
		heading = isempty(title) || title == entry.page ? entry.page : entry.page * ARROW * title
		from = length(page)
		paragraphs = filter(paragraph -> !occursin(UNICODE_TABLE, paragraph), split(strip(coalesce(entry.text, "")), r"\n{2,}"))
		passages!(page, paragraphs, missing, heading)
		page[from + 1:end] = [Passage(p.page, p.heading, p.text, entry.location) for p in page[from + 1:end]]
	end
	append!(found, join_short(page))
	return found
end

# ---------------------------------------------------------------- the index

"""
Writes the index of `found` to PollisDocuments.duckdb.partial and publishes it over the last: the passages of the
documents not changed since `previous` copied from it, the others read; their embeddings, those embeddings.duckdb has;
the full-text index. Returns the texts that have no embedding yet, (key, input), and exits when it cannot publish.
"""
function build(found, previous; progress = true)
	rm(PARTIAL; force = true)
	rm(PARTIAL * ".wal"; force = true)
	db = DuckDB.DB(PARTIAL; config = CONFIG)
	DBInterface.execute(db, "LOAD $(sql(FTS))")
	DBInterface.execute(db, "CREATE TABLE documents(id INTEGER PRIMARY KEY, kind VARCHAR, title VARCHAR, source VARCHAR, menu VARCHAR, toolbox VARCHAR, version VARCHAR, collection VARCHAR)")
	DBInterface.execute(db, "CREATE TABLE passages(id INTEGER PRIMARY KEY, document INTEGER, page INTEGER, heading VARCHAR, text VARCHAR, anchor VARCHAR, embedding FLOAT[])")
	DBInterface.execute(db, "CREATE TABLE built(name VARCHAR PRIMARY KEY, value VARCHAR)")
	reuse = previous !== nothing && previous.script == SCRIPT
	reuse && DBInterface.execute(db, "ATTACH $(sql(DATABASE)) AS last (READ_ONLY)")

	documents_appender = DuckDB.Appender(db, "documents")
	for (id, document) in enumerate(found)
		for value in (id, document.kind, document.title, document.source, document.menu, document.toolbox, document.version, document.collection)
			DuckDB.append(documents_appender, value)
		end
		DuckDB.end_row(documents_appender)
	end
	DuckDB.close(documents_appender)

	passage_id = 0
	appender = DuckDB.Appender(db, "passages")
	for (id, document) in enumerate(found)
		# Not changed since the last index: its passages are copied below
		if !(reuse && document in previous.documents)
			cut = try
				document.kind == "wiki" ? wiki_passages(document.source, document.title) :
					document.kind == "julia" ? manual_passages(document.source) : pdf_passages(document.source)
			catch
				nothing
			end
			for passage in something(cut, Passage[])
				for value in (passage_id += 1, id, passage.page, passage.heading, passage.text, isempty(passage.anchor) ? missing : passage.anchor, missing)
					DuckDB.append(appender, value)
				end
				DuckDB.end_row(appender)
			end
		end
		progress && say("{\"done\":$id,\"total\":$(length(found))}")
	end
	DuckDB.close(appender)

	# The passages of the documents not changed, as they were: a document is found again by all it was read as
	reuse && DBInterface.execute(db, """
		INSERT INTO passages
		SELECT ? + row_number() OVER (ORDER BY p.id), n.id, p.page, p.heading, p.text, p.anchor, NULL
		FROM last.passages p
		JOIN last.documents d ON p.document = d.id
		JOIN documents n ON (n.kind, n.title, n.source, n.menu, n.toolbox, n.version, n.collection) = (d.kind, d.title, d.source, d.menu, d.toolbox, d.version, d.collection)""",
		[passage_id])
	reuse && DBInterface.execute(db, "DETACH last")

	# What each passage is given to the embedding model as, and the embeddings made of it before: a wiki's headings
	# start with its panel and its name, a PDF's do not have its title
	DBInterface.execute(db, "ATTACH $(sql(EMBEDDINGS)) AS cache")
	DBInterface.execute(db, "CREATE TABLE IF NOT EXISTS cache.embeddings(key VARCHAR PRIMARY KEY, embedding FLOAT[])")
	DBInterface.execute(db, """
		CREATE TEMP TABLE inputs AS
		SELECT id, sha256(? || chr(10) || input) AS key, input
		FROM (
			SELECT p.id, left(replace(replace(?, '{title}', CASE WHEN d.kind = 'wiki' THEN p.heading ELSE concat_ws($(sql(ARROW)), d.title, nullif(p.heading, '')) END), '{text}', p.text), $LONGEST) AS input
			FROM passages p JOIN documents d ON p.document = d.id)""",
		[EMBEDDER, PREFIX])
	DBInterface.execute(db, "UPDATE passages SET embedding = c.embedding FROM inputs i, cache.embeddings c WHERE c.key = i.key AND passages.id = i.id")
	todo = Tables.rowtable(DBInterface.execute(db, "SELECT key, any_value(input) AS input FROM inputs WHERE key NOT IN (SELECT key FROM cache.embeddings) GROUP BY key ORDER BY min(id)"))
	DBInterface.execute(db, "DETACH cache")
	# Of one size, for array_cosine_distance
	sizes = Tables.rowtable(DBInterface.execute(db, "SELECT DISTINCT len(embedding) AS n FROM passages WHERE embedding IS NOT NULL"))
	dimensions = length(sizes) == 1 ? only(sizes).n : 0
	dimensions > 0 && DBInterface.execute(db, "ALTER TABLE passages ALTER embedding TYPE FLOAT[$dimensions]")
	# Each collection, with its number of passages, for the switch of the page; a question is routed by its passages
	DBInterface.execute(db, "CREATE TABLE collections(name VARCHAR PRIMARY KEY, passages INTEGER)")
	DBInterface.execute(db, """
		INSERT INTO collections
		SELECT d.collection, count(p.id) FROM documents d LEFT JOIN passages p ON p.document = d.id GROUP BY d.collection""")

	DuckDB.query(db, "PRAGMA create_fts_index('passages', 'id', 'heading', 'text', stemmer = 'english', overwrite = 1)")
	counts = only(Tables.rowtable(DBInterface.execute(db, "SELECT count(*) AS passages, count(embedding) AS embedded FROM passages")))
	# builtAt, when it was built, in milliseconds: the passages Evaluate Answering Models found with the index before are reused until it is built again
	DBInterface.execute(db, "INSERT INTO built VALUES ('script', ?), ('passages', ?), ('embedded', ?), ('dimensions', ?), ('embedder', ?), ('passagePrefix', ?), ('builtAt', ?)",
		[SCRIPT, string(counts.passages), string(counts.embedded), dimensions > 0 ? string(dimensions) : "", EMBEDDER, PREFIX, string(round(Int, time() * 1000))])
	DBInterface.execute(db, "CHECKPOINT")
	DBInterface.close!(db)

	try
		rm(DATABASE * ".wal"; force = true)
		mv(PARTIAL, DATABASE; force = true)
	catch
		# A session has the last index open, on Windows: it is made again at the next start
		say("{\"error\":\"busy\"}")
		exit(1)
	end
	say("{\"passages\":$(counts.passages),\"embedded\":$(counts.embedded)}")
	return todo
end

"""
Embeds `todo`, the (key, input) of texts, with the llama.cpp server at `url` (its OpenAI /embeddings), into
embeddings.duckdb, `BATCH` texts a request, each kept as it comes: a request that fails is made again a text at a
time, and a text that fails then is left to the next index.
"""
function embed(url, todo)
	db = DuckDB.DB(":memory:"; config = CONFIG)
	DBInterface.execute(db, "ATTACH $(sql(EMBEDDINGS)) AS cache")
	DBInterface.execute(db, "CREATE TABLE todo(position INTEGER, key VARCHAR, input VARCHAR)")
	appender = DuckDB.Appender(db, "todo")
	for (position, text) in enumerate(todo)
		for value in (position, text.key, text.input)
			DuckDB.append(appender, value)
		end
		DuckDB.end_row(appender)
	end
	DuckDB.close(appender)
	# The texts from..to, in one request: the body is written and the answer read by DuckDB, with their JSON
	function request(from, to)
		body = only(Tables.rowtable(DBInterface.execute(db, "SELECT to_json({input: list(input ORDER BY position)})::VARCHAR AS body FROM todo WHERE position BETWEEN ? AND ?", [from, to]))).body
		output = IOBuffer()
		response = Downloads.request(url * "/embeddings"; method = "POST", input = IOBuffer(body), output = output,
			headers = ["Content-Type" => "application/json"], timeout = 600, throw = false)
		response isa Downloads.Response && response.status == 200 || return false
		try
			DBInterface.execute(db, """
				INSERT OR REPLACE INTO cache.embeddings
				SELECT t.key, e.embedding
				FROM (SELECT unnest(from_json(?, '{"data": [{"index": "INTEGER", "embedding": "FLOAT[]"}]}').data, recursive := true)) e
				JOIN todo t ON t.position = ? + e."index"
				""", [String(take!(output)), from])
			return true
		catch
			return false
		end
	end
	for from in 1:BATCH:length(todo)
		to = min(from + BATCH - 1, length(todo))
		request(from, to) || foreach(position -> request(position, position), from:to)
		say("{\"embedding\":$to,\"total\":$(length(todo))}")
	end
	DBInterface.close!(db)
end

found = documents()
previous = last_index()
built(name) = previous === nothing ? nothing : get(previous.built, name, nothing)
# Nothing changed, and every passage embedded, or none can be
if previous !== nothing && previous.script == SCRIPT && previous.documents == Set(found) && built("embedder") == EMBEDDER &&
		built("passagePrefix") == PREFIX && (built("embedded") == built("passages") || !EMBEDDABLE)
	exit()
end

say("{\"total\":$(length(found))}")
todo = build(found, previous)
if EMBEDDABLE && !isempty(todo)
	say("{\"embed\":$(length(todo))}")
	url = strip(readline(stdin))
	if !isempty(url)
		embed(url, todo)
		build(found, last_index(); progress = false)
	end
end
