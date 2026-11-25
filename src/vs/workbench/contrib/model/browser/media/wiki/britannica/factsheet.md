# Britannica Through the Editions — Factsheet

## The Editions of the Britannica in PollisBritannica
PollisBritannica holds the fourteen editions of the Encyclopaedia Britannica from 1768 to 1929 and the two supplements of those years. The tenth, twelfth and thirteenth editions were new volumes added to the edition before them, so only their new volumes are in it. The `edition` column of the `editions` and `articles` tables has the key in the first column below.

| Key | Edition | Years |
|---|---|---|
| 1 to 3 | First, second and third editions | 1768–1797 |
| 3S | Supplement to the third edition | 1801 |
| 4 to 6 | Fourth, fifth and sixth editions | 1801–1823 |
| 6S | Supplement to the fourth, fifth and sixth editions | 1815–1824 |
| 7 to 9 | Seventh, eighth and ninth editions | 1830–1889 |
| 10 | Tenth edition, new volumes added to the ninth | 1902–1903 |
| 11 | Eleventh edition | 1910–1911 |
| 12 | Twelfth edition, new volumes added to the eleventh | 1922 |
| 13 | Thirteenth edition, new volumes added to the eleventh | 1926 |
| 14 | Fourteenth edition | 1929 |

## What an Article Row of PollisBritannica Holds
The `articles` table of PollisBritannica has a row for each article of each edition.

| Column | What it holds |
|---|---|
| `id` | The number of the article, by which the texts give its text |
| `edition` | The key of the edition |
| `volume` | The volume, with a or b for the two parts of a volume bound apart |
| `item`, `page`, `end_page` | The item of the Internet Archive and the pages of its scan where the article starts and ends |
| `printing` | In the fourteenth edition, the printing of the copy read, 1929 or 1930 |
| `key` | The headword in the capital letters A to Z only, to look the article up in every edition |
| `headword`, `title` | The headword, and the title with its qualifiers, as the scan reads them |
| `chars` | The length of the article in characters |
| `signature` | The initials of the contributor, where the article is signed |

The page of an article's scan is `https://archive.org/details/<item>/page/n<page>`.

## How PollisBritannica Finds the Articles in the Scans
The articles are found in the text that the Internet Archive read from the scan of each volume. A headword opens a paragraph, or follows the full stop that ends the article before it, in capital letters, followed by a comma, a bracket, a full stop or a dash. Of the headwords found in a volume, the longest sequence in alphabetical order is kept, which leaves out capitals within articles and the running heads at the top of the pages. The earliest editions file I with J and U with V, which the order allows for. An article runs to the next headword; its signature is the initials in brackets at its end. The fourteenth edition is read from several copies of some volumes: each headword is taken from the copy with the most of its text.

## Limits of the Articles of PollisBritannica
The articles are only as good as the text read from the scans. A headword that the scan misread may be missing, so that its article runs into the one before it, which then looks longer than it is. A title may carry misread letters, and the initials of one contributor may be read in two ways. Some copies of the fourteenth edition have no page index, so their articles have no page, and Open the Scan opens the scan at its start. The tenth, twelfth and thirteenth editions hold only new volumes, so an article missing from them may be in the edition they were added to. The page of the scan shows each article as printed.

## Where the Scans of PollisBritannica Come From
Every scan is at the Internet Archive. The first six editions and the two supplements are the scans of the National Library of Scotland. The seventh to the eleventh editions and the twelfth are complete sets uploaded volume by volume. The three new volumes of the thirteenth edition and most volumes of the fourteenth are copies of libraries, many of them from the Digital Library of India. PollisBritannica holds only what it measures in each article and the article's first words, with the link to its scan.

## See Also
- [Overview](overview.md)
