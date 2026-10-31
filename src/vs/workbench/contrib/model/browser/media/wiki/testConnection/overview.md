# Test Connection — Overview

## How Pollis Collaboration Sessions Connect Over a Network
A Pollis session connects its participants in two stages. First, free public servers introduce the participants to each other, passing the few messages that let two computers find one another; these are the introduction servers. Then each pair connects directly, peer to peer, and the session's content travels only between them. The procedure for finding a direct path is Interactive Connectivity Establishment ([Keranen, Holmberg and Rosenberg (2018)](#ref-KHR2018a)), which tries the addresses each computer can offer until one pair of them works.

## Why a Network Can Block a Direct Connection
Most computers sit behind a network address translator (NAT), which shares one public address among many devices. A computer learns the address the outside world sees for it by asking a STUN server ([Petit-Huguenin, Salgueiro, Rosenberg, Wing, Mahy and Matthews (2020)](#ref-PSRWM...2020a)). Two computers can then usually reach each other at those addresses, provided that the NAT gives each computer the same outside address whichever server it talks to, the behaviour recommended by [Audet and Jennings (2007)](#ref-AJ2007a). A strict NAT gives a different address to each destination, so the address learned from a STUN server is of no use to the other participant. A firewall may also block UDP, the transport these connections use.

## What a TURN Relay Does When Direct Connection Fails
When no direct path exists, the traffic can go through a relay server, by the protocol TURN ([Reddy, Johnston, Matthews and Rosenberg (2020)](#ref-RJMR2020a)). A relay works on nearly any network but costs bandwidth for whoever runs it, and each participant's traffic passes through it. Pollis has no relay set up yet, so two participants whose networks both block direct connections cannot connect.

## How Often Direct Connections Through a NAT Succeed
Hole punching is the technique behind most direct connections: both computers send at once, so that each NAT lets the other's packets in. [Ford, Srisuresh and Kegel (2005)](#ref-FSK2005a) found that about 82% of the NATs they tested supported it for UDP and about 64% for TCP. On a real peer-to-peer network, [Halkes and Pouwelse (2011)](#ref-HP2011a) found about 64% of peers behind a NAT or firewall where puncturing should work, with over 80% of the attempts between such peers succeeding. A direct connection is thus common but not assured, which is what Test Connection checks for the network at hand.

## References

<a id="ref-AJ2007a"></a>Audet, F. and Jennings, C. (2007). Network Address Translation (NAT) Behavioral Requirements for Unicast UDP. *RFC 4787*. [doi:10.17487/RFC4787](https://doi.org/10.17487/RFC4787)

<a id="ref-FSK2005a"></a>Ford, B., Srisuresh, P. and Kegel, D. (2005). Peer-to-peer communication across network address translators. *Proceedings of the 2005 USENIX Annual Technical Conference*. [usenix.org/conference/2005-usenix-annual-technical-conference/peer-peer-communication-across-network-address](https://www.usenix.org/conference/2005-usenix-annual-technical-conference/peer-peer-communication-across-network-address)

<a id="ref-HP2011a"></a>Halkes, G. and Pouwelse, J. (2011). UDP NAT and firewall puncturing in the wild. *NETWORKING 2011*, 1–12. [doi:10.1007/978-3-642-20798-3_1](https://doi.org/10.1007/978-3-642-20798-3_1)

<a id="ref-KHR2018a"></a>Keranen, A., Holmberg, C. and Rosenberg, J. (2018). Interactive Connectivity Establishment (ICE): A Protocol for Network Address Translator (NAT) Traversal. *RFC 8445*. [doi:10.17487/RFC8445](https://doi.org/10.17487/RFC8445)

<a id="ref-PSRWM...2020a"></a>Petit-Huguenin, M., Salgueiro, G., Rosenberg, J., Wing, D., Mahy, R. and Matthews, P. (2020). Session Traversal Utilities for NAT (STUN). *RFC 8489*. [doi:10.17487/RFC8489](https://doi.org/10.17487/RFC8489)

<a id="ref-RJMR2020a"></a>Reddy, T., Johnston, A., Matthews, P. and Rosenberg, J. (2020). Traversal Using Relays around NAT (TURN): Relay Extensions to Session Traversal Utilities for NAT (STUN). *RFC 8656*. [doi:10.17487/RFC8656](https://doi.org/10.17487/RFC8656)

## See Also
- [Factsheet](factsheet.md) · [Reading the Results](reading-results.md)
