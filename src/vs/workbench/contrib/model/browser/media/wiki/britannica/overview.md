# Britannica Through the Editions — Overview

## What Britannica Through the Editions Shows
The **Britannica Through the Editions** page follows an article of the Encyclopaedia Britannica through every edition from the first, published from 1768 to 1771, to the fourteenth, of 1929. For each edition it shows the article as the scan of that edition prints it: its title, its length in characters, its share of the edition, the initials of its contributor where it is signed, its opening words, and a link to its page of the scan at the Internet Archive. Side by side, the editions show which subjects were given an article, when, and how much room, and how the opening of an article changed from one edition to the next. The page opens from Extend > Historical Geography and Archaeology > Britannica Through the Editions, from PollisBritannica in the Databases view, and from the Command Palette.

## The Cases of Britannica Through the Editions
A **case** is an article followed through the editions with a note for each edition on what changed: an article first given, rewritten by a new contributor, cut, or left out. The cases are the chips at the top of the page, under **Cases**. Choosing one shows the summary of the case, then its bars and its editions, each with the note of the case below the article. The cases come with PollisBritannica.jl, in the same database as the articles, so a new case reaches the page when the package is updated.

## Looking Up a Headword of Your Own
**Your Entry** looks up any headword in every edition, shown in the same way as a case, without the notes. Type the headword as the Britannica prints it, such as `PETRA` or `HUMBOLDT`, and press **Look Up** or Enter; case and accents do not matter. Words after a comma narrow the articles to those whose title has them: `DARWIN, CHARLES` finds the articles on Charles Darwin and leaves out those on Erasmus Darwin. When no edition has an article under the headword, the page says so and offers the headwords that start the same letters, each a link that looks it up. That no edition has an article is itself a finding: a subject the Britannica of those years did not treat on its own.

## The Bars: Share of the Edition and Characters
Above the editions, a bar for each edition measures the longest article found under the headword. **Share of the Edition** gives its characters per million characters of all the articles of its edition, which allows editions of different sizes to be compared: the first edition fills three volumes, the eleventh twenty-eight. **Characters** gives its length itself. The years of each edition are at the left of its bar; the pointer on them shows the edition's name, and the pointer on a value shows the title of the article measured. An edition with no article under the headword has an empty bar and a dash.

## Each Edition's Card
Below the bars, a card for each edition names it and its years, then gives the longest article under the headword: its title, its characters, its characters per million of the edition, **Signed** with the contributor's initials or **Unsigned**, and its volume and page of the scan. **Open the Scan** opens that page of the scan in Pollis's own browser, beside the page, where the article can be read as printed. Its opening words follow, in italics. Any other articles under the same headword, such as a second person of the same surname, are listed under **Also under this headword**, with their characters. For a case, the note of the case for that edition closes the card; an edition without an article says **No article**.

## The PollisBritannica Database and Query in SQL
The page reads PollisBritannica, a built-in database that Pollis makes when the Julia REPL starts from the files of PollisBritannica.jl, and makes again when the package is updated. Its tables are `editions`, `articles` and `cases`. In a duckdb> terminal they are `PollisBritannica.articles` and so on, and in Julia `britannica` once connected from the Databases view. The Next Steps group **Query in SQL** has four queries to start from: An Article Through the Editions, Longest Articles of an Edition, Articles That Grew or Shrank and Contributors of an Edition.

## See Also
- [Factsheet](factsheet.md)
