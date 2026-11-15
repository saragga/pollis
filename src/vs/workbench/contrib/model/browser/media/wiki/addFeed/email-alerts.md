# Add Feed — Email Alerts as Feeds

## Why Email Alerts Become Feeds
Google Scholar, JSTOR, HeinOnline, Nexis Uni, SSRN, Semantic Scholar, Web of Science, Scopus, Westlaw and Factiva send alerts by email, not as feeds. In the **From Email Alerts** section of the Add Feed page, Pollis reads a mailbox that receives these alerts and makes a feed of each alert, so that its new results arrive as items on the RSS Feeds page under the topic Email Alerts. An address used only for the alerts is best, because Pollis makes a feed of every alert that arrives there. The Email Alerts skill in Compose > Agent Skills shows a coding agent how to set the alerts up at each source, with searches written in that source's syntax.

## Connecting the Alerts Mailbox
The mailbox is read with IMAP. **Email Address**, **IMAP Server** and **Password** connect it, and **Connect** keeps them only once the mailbox can be read. The server is guessed from the address, such as `imap.gmail.com` for a Gmail address, until it is typed; a port other than 993 is added as `:port`. Gmail, iCloud and Yahoo need an app password, and IMAP turned on in the account's settings. The password is kept in the system's keychain, and Pollis only reads the mailbox. Once it is connected, the section names the mailbox, and **Change Mailbox** connects another one.

## Following the Alerts in the Mailbox
**Alerts in the Mailbox** lists the alerts that have arrived, by source, each with a box. Ticking an alert follows it, and unticking it stops following it; its items are listed under the Email Alerts topic of the RSS Feeds page. **Read Again** reads the mailbox again, for an alert set up since. When no alert has arrived yet, the section says so: alerts set up at the sources to be sent to the mailbox's address appear after their first email.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Feeds from PubMed and arXiv Searches](search-feeds.md)
