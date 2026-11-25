# OCR Files and Snippets — Factsheet

## Sources OCR Files and Snippets Opens
| Source | What is given | What Pollis downloads or reads | Contents from |
|---|---|---|---|
| Internet Archive | An item's identifier, or a link to it | The item's metadata, its hOCR file (every word with its box on the page and a confidence), its page-numbers file and its contents file | The contents file, the OCR of the book's own contents page |
| Project Gutenberg | An ebook's number, or a link to it | The ebook's plain text, cut into pages of about 3,000 characters | The headings of the text |
| A local PDF | A PDF file with a text layer | The words and their boxes, by Poppler's `pdftotext -bbox-layout`; the document's details, by `pdfinfo` | The PDF's outline, by `pdftohtml -xml` |

A Project Gutenberg text has no scan, so Read shows its text without page images. A PDF without a text layer, a scan of images only, has no words to show: such a page needs OCR first.

## The Checks of a Word in OCR Files and Snippets
| Check | What it flags | Shown as |
|---|---|---|
| A dictionary of the language | A word in no dictionary of the work's languages | Wavy underline, In no dictionary of the work's languages |
| Word lists and rules of the work's time | Nothing itself: an old spelling found in them is not flagged | — |
| The work's own words | Nothing itself: a word accepted once is not flagged again | — |
| The OCR's own confidence | A word the dictionaries know, read with a confidence below 20 of 100 | Dotted underline, The OCR was unsure of it |
| Common OCR confusions | Nothing itself: they give the suggestions for a flagged word | Suggestions |
| A second scan | A word another copy of the same edition reads otherwise | Another copy reads it otherwise |
| The language model | A word the model finds misread in its sentence, as a suggestion only | The language model finds it misread |

Numbers, roman numerals and single letters are not checked. A word with a hyphen is known when each of its parts is.

## The Dictionaries of the Checks
The dictionaries are the free Hunspell dictionaries that LibreOffice uses, downloaded from LibreOffice's dictionaries repository into `~/.pollis/dictionaries` the first time a language is checked. Pollis reads them in Hunspell's own format, with their affixes and the rules by which German, Dutch and other languages join words into compounds. There are dictionaries for 35 languages:

| Codes |
|---|
| af, bg, br, ca, cs, da, de, el, en, eo, es, et, fr, gd, gl, he, hr, hu, is, it |
| lt, lv, nb, nl, nn, oc, pl, pt, pt-BR, ro, ru, sk, sl, sv, uk |

A work in a language with no dictionary, Latin for one, is checked by the OCR's confidence only. The English dictionary is that of British English.

## Old Spellings and the Work's Year
Modern dictionaries flag the spellings of older works, so the record's **Year** brings in the spelling of the work's time. For European Portuguese before the Orthographic Agreement of 1990, Pollis downloads a dictionary of the earlier spelling from the Natura project of the University of Minho. For spellings that no list holds, rules respell a word the modern way before it is looked up again:

| Language | Works before | Respelt, for example |
|---|---|---|
| Dutch | 1947 | mensch, heeten, loopen, photo |
| Dutch | 1900 | Spellings with ae, y and c before a, o or u |
| German | 1996 | daß, Schiffahrt |
| German | 1902 | Theil, thun, Cultur, Centrum, studiren |
| Portuguese | 1911 | pharmacia, theatro, lyrio, commercio, christão |
| French | 1835 | j'avois, étoit, enfans, tems |

## Suggestions From Common OCR Confusions
The suggestions for a flagged word come from the letters OCR commonly confuses: é and è read as 6 or £, c and e, rn and m, li and h, ô read as ö, ç read as q, the long s read as f, and accents lost. Pollis tries each confusion in the word and keeps the readings a dictionary knows, at most three. When no single confusion gives a known word, it tries two accents together, as in societe for société, and when that fails, the word split in two, as in two words run together.

## A Second Scan of the Same Edition
The Internet Archive often holds more than one scan of a book, from different libraries. **Find Other Copies** searches it for items of the same title, author, year and volume, and **Compare** downloads the plain text of the copy chosen and aligns it with the snippet's text word by word. A word the two scans read differently is flagged, with the other copy's reading as its suggestion. Unlike the dictionary, this finds misreads that are themselves real words, but only where the other copy reads them right.

## The Record of a Work: work.toml
| Field | What it holds |
|---|---|
| `id` | The short name of the work's folder |
| `title`, `author`, `editor`, `translator`, `year` | As printed, when known |
| `languages` | The languages of the text, as codes, the language of most of it first |
| `entryType`, `referenceKey` | The BibTeX entry type, and the work's key in PollisReferences |
| `summary`, `summarySource` | A few sentences on the work, and where they come from |
| `[scan]` | `archive`, `gutenberg`, or `sha256` and `path` for a PDF; `offset`, the difference between scan and printed pages |
| `[[contents]]` | Each entry's `label` and `pages` |
| `[[words]]` | The work's own words, each a `word` |
| `[[glossary]]` | Each `term`, with its translation under each language code |

Every field but `id` and the scan is optional.

## The File of a Snippet
| Field | What it holds |
|---|---|
| `work`, `label` | The work's id, and the snippet's label |
| `language`, `pages` | The language of the text, and the scan's pages it comes from |
| `text` | The corrected text |
| `[[corrections]]` | Each changed word, `read` as the scan read it and `corrected`, with its `page` |
| `[[translations]]` | Each translation's `language`, `model`, the day it was `made` and its `text` |

A snippet is one TOML file in the `snippets` folder of its work, named after its label. Other fields added by hand, such as the number of a letter, are kept as they are.

## Where the Files of a Work Are Kept
| Path | What it holds |
|---|---|
| `~/.pollis/works/<id>/work.toml` | The work's record |
| `~/.pollis/works/<id>/snippets/` | Its snippets |
| `~/.pollis/works/<id>/source/` | The source's text, the words of each page, the page images, a copied PDF, the texts of other copies |
| `<Pollis Workspace>/works/<id>/` | The record and snippets, once the work is added to the workspace |
| `~/.pollis/dictionaries/` | The dictionaries and word lists, shared by every work |

The record and snippets are a few kilobytes each. The source folder is large: the page images of a volume take a hundred megabytes or more, and they can be downloaded again from the source.

## Limits of OCR Files and Snippets
The checks are for printed text in a script with a Hunspell dictionary, whose scan already has its text. A page that is only an image needs OCR before it can be read here, and an inscription in an ancient script needs an OCR or a vision model that reads that script. A misread that is itself a real word passes the dictionary; a second scan or the language model may find it. A translation is made by a local model and can be wrong in a sentence, which is why each translation is labelled with its model and the date it was made.

## See Also
- [Overview](overview.md)
