# Test Connection — Factsheet

**Test Connection** checks whether this computer's network lets Pollis collaboration sessions through, and says what to do if it does not.

| | |
|---|---|
| **Purpose** | Check a network before a collaboration session, on each computer taking part |
| **Sections** | Summary, Introduction Servers, Direct Connections, Relay (TURN), This Session |
| **Actions** | Run Again, Copy Results |
| **Setting** | `pollis.collaboration.signalling`, which chooses the kind of introduction server |
| **Key choice** | Nostr relays, the default, or MQTT brokers, when the first are blocked |

## When to Use Test Connection
- Before a first session on a new network, such as a university's or a company's.
- When a participant cannot join a session or stays alone in it.
- During a session, to see how each participant is connected.
- Sending the results to someone helping with the network, with Copy Results.

## What Test Connection Does Not Do
The Test Connection page does not change any setting or any part of the network. A good result on one computer says nothing about another's network, so each participant should run it. The page sends no messages to other participants, and it needs no session to be open, except for the section This Session.

## See Also
- [Overview](overview.md) · [Reading the Results](reading-results.md)
