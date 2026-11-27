# Larousse Through the Editions — Factsheet

## The Works of Larousse in PollisLarousse
PollisLarousse holds three encyclopaedic dictionaries of Larousse, published in Paris from 1866 to 1933, and the supplements of the first two. The `edition` column of the `editions` and `articles` tables has the key in the first column below.

| Key | Work | Years | Volumes |
|---|---|---|---|
| `GDU` | Grand dictionnaire universel du XIXe siècle, by Pierre Larousse | 1866–1876 | 1 to 15 |
| `GDU-S1` | Its first supplement | 1878 | 16 |
| `GDU-S2` | Its second supplement | 1890 | 17 |
| `NLI` | Nouveau Larousse illustré, edited by Claude Augé | 1897–1904 | 1 to 7 |
| `NLI-S` | Its supplement | 1906 | 8 |
| `L20` | Larousse du XXe siècle, edited by Paul Augé | 1928–1933 | 2 and 3 of 6 |

Of the Larousse du XXe siècle, the Internet Archive lends the other volumes only to readers who borrow them, so only the second, of 1929, and the third, of 1930, are read.

## What an Article Row of PollisLarousse Holds
The `articles` table of PollisLarousse has a row for each article of each work.

| Column | What it holds |
|---|---|
| `id` | The number of the article, by which the texts give its text |
| `edition` | The key of the work |
| `volume` | The volume, numbered on in the supplements |
| `item`, `page`, `end_page` | The item of the Internet Archive and the pages of its scan where the article starts and ends |
| `key` | The headword in the capital letters A to Z only, accents left out, to look the article up in every work |
| `headword` | The headword, as the scan reads it |
| `title` | The headword with the first names or the qualifier in brackets that follow it, which tells apart the articles of one headword |
| `chars` | The length of the article in characters |

The `editions` table has a row for each work: its key, name, years, volumes read, articles and the characters of all its articles. The page of an article's scan in the Internet Archive's reader is `https://archive.org/details/<item>/page/n<page>`. The fifth volume of the Grand dictionnaire universel and its second supplement have no page index at the Internet Archive, so their articles have no page, and Open in the Internet Archive opens the volume at its start.

## How PollisLarousse Finds the Articles in the Scans
The articles are found in the text that the Internet Archive read from the scan of each volume. A headword opens a paragraph in capitals, followed by a comma, a bracket, a full stop or its part of speech, such as `s. m.` or `adj.`. The Nouveau Larousse illustré prints the names of people and places in lower case, followed by their first names in brackets or by a comma. The Grand dictionnaire universel prints in lower case the titles of works, with their qualifier in brackets or their kind, such as `roman` or `comédie`, and the titles of events, with their year. Of the headwords found in a volume, the longest sequence in alphabetical order is kept, accents left out, which leaves out the running heads at the top of the pages and the capitals within articles. Headwords whose letters the scan misread are taken back where they fall between the articles beside them. In the Nouveau Larousse illustré and the Larousse du XXe siècle, an article of three pages or more also ends at the top of a page whose running head names a later headword. A page scanned twice is read once, and the alphabetical lists at the ends of some volumes, such as their contributors, are left out. An article runs to the next headword.

## Limits of the Articles of PollisLarousse
The articles are only as good as the text read from the scans. A headword that the scan misread may be missing, so that its article runs into the one before it, which then looks longer than it is; a few of the longest articles of each work are such runs. A title may carry misread letters, most often in the Larousse du XXe siècle, whose scans the Internet Archive read less well. The articles of Larousse are not signed, so PollisLarousse has no contributors. The page of the scan shows each article as printed.

## Where the Scans of PollisLarousse Come From
Every scan is at the Internet Archive. The Grand dictionnaire universel and its two supplements are the scans of the Bibliothèque nationale de France, from Gallica. The Nouveau Larousse illustré and its supplement are copies of the University of Ottawa, scanned for the University of Toronto. The two volumes of the Larousse du XXe siècle are scans of the Internet Archive's own books; the item of the second volume is named as its sixth, but its title page reads Tome deuxième. PollisLarousse holds what it measures in each article, with the link to its scan, and its texts are those the Internet Archive read.

## See Also
- [Overview](overview.md)
