# Finding Series

To download a series you need its **dataflow** and its **key**. This page covers how to find them.

## Browse the Data Categories

The [ECB Data Portal](https://data.ecb.europa.eu/data/data-categories) groups everything into top-level categories:

- ECB/Eurosystem policy and exchange rates
- Money, credit and banking
- Non-bank financial corporations
- Financial markets and interest rates
- Macroeconomic and sectoral statistics
- Balance of payments and other external statistics
- Supervisory and prudential statistics
- Payment statistics
- ECB surveys

Drill into a category, open a series, and the page shows the full **series key** and the **dataflow** it belongs to. Copy the key straight into your request.

## Reading a Key

A key fixes every dimension of the dataflow, dot-separated. For `EXR/D.USD.EUR.SP00.A`:

| Position | Value | Meaning |
|---|---|---|
| Frequency | `D` | Daily |
| Currency | `USD` | US dollar |
| Currency denom. | `EUR` | per euro |
| Exchange rate type | `SP00` | Reference rate |
| Series variation | `A` | Average |

## Common Series

| Dataflow / Key | Series |
|---|---|
| `EXR/D.USD.EUR.SP00.A` | US dollar / euro reference rate |
| `EXR/D.GBP.EUR.SP00.A` | Pound sterling / euro reference rate |
| `FM/B.U2.EUR.4F.KR.MRR_FR.LEV` | Main refinancing operations rate |
| `FM/B.U2.EUR.4F.KR.DFR.LEV` | Deposit facility rate |
| `FM/B.U2.EUR.4F.KR.MLFR.LEV` | Marginal lending facility rate |
| `EST/B.EU000A2X2A25.WT` | €STR (euro short-term rate) |
| `ICP/M.U2.N.000000.4.ANR` | HICP, euro area, annual rate of change |
| `ICP/M.U2.N.XEF000.4.ANR` | Core HICP (excl. energy and food) |
| `BSI/M.U2.Y.V.M30.X.I.U2.2300.Z01.A` | M3 annual growth rate |
| `YC/B.U2.EUR.4F.G_N_A.SV_C_YM.SR_10Y` | AAA 10-year spot yield |

## Tips

- Swap one dimension to get a sibling series: change `USD` to `GBP` in an `EXR` key, or `M30` to `M10` (M1) in a `BSI` key.
- For HICP by country, replace the reference area `U2` (euro area) with a country code such as `DE`, `FR`, or `IT`.
- The **Next Steps** buttons in this webview pre-fill working keys for the most-used series in each topic.

## See Also
- [Accessing Data](accessing-data.md) · [Query Options](query-options.md) · [Factsheet](factsheet.md)
