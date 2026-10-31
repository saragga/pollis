# Test Connection — Reading the Results

## What the Summary of Test Connection Can Say
The Summary gives the conclusion of the sections below it. On a good result the network lets sessions through. When no introduction server answers, a firewall or a proxy may be blocking secure WebSockets (`wss`), and another network, such as a phone's hotspot, is worth trying. When the Nostr relays are blocked and the MQTT brokers are reachable, set Pollis Collaboration Signalling to `mqtt` in Settings and start the session with that. A summary may also say that some connections will need the relay.

## Reading the Introduction Servers Section
Introduction Servers lists the Nostr relays, the default, and the MQTT brokers, the alternative, each with how many of them are reachable. One reachable server of the kind in use is enough for a session. Each probe waits up to 6 seconds, so a slow network can show a server as unreachable that would answer later; **Run Again** repeats the test.

## Reading the Direct Connections Section

| Message | Meaning |
|---|---|
| The same address to every server | Direct connections should work |
| A different address to each server | A strict NAT: connections with some participants may need the relay |
| Only one STUN server answered | The behaviour could not be compared; direct connections may still work |
| No STUN server answered | The network seems to block UDP, so connections will need the relay |

## Reading the This Session Section
The section This Session shows whether each participant is connected directly or through the relay. Outside a session it says **Not in a session**, and when you are alone it says **Nobody else is in the session yet**. Run the test again once others have joined.

## Why Test Connection Can Give Different Results on Another Network
Network address translators differ widely. [Hätönen, Nyrhinen, Eggert, Strowes, Sarolahti and Kojo (2010)](#ref-HNESS...2010a) measured home gateways and found extremely diverse behaviour in binding timeouts and protocol support. Translation also happens further out: with IPv4 addresses scarce, internet providers apply carrier-grade NAT across many customers ([Richter, Wohlfart, Vallina-Rodriguez, Allman, Bush, Feldmann, Kreibich, Weaver and Paxson (2016)](#ref-RWVAB...2016a)). A result of Test Connection therefore describes the network it ran on, and the same computer at home, at work or on a phone's connection may read differently.

## References

<a id="ref-HNESS...2010a"></a>Hätönen, S., Nyrhinen, A., Eggert, L., Strowes, S., Sarolahti, P. and Kojo, M. (2010). An experimental study of home gateway characteristics. *Proceedings of the 10th ACM SIGCOMM conference on Internet measurement*, 260–266. [doi:10.1145/1879141.1879174](https://doi.org/10.1145/1879141.1879174)

<a id="ref-RWVAB...2016a"></a>Richter, P., Wohlfart, F., Vallina-Rodriguez, N., Allman, M., Bush, R., Feldmann, A., Kreibich, C., Weaver, N. and Paxson, V. (2016). A multi-perspective analysis of carrier-grade NAT deployment. *Proceedings of the 2016 Internet Measurement Conference*, 215–229. [doi:10.1145/2987443.2987474](https://doi.org/10.1145/2987443.2987474)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md)
