# hypotecni-kalkulacka

Zakladni React projekt pro hypotecni kalkulacku zamerenou na cesky trh.

## Napady do dalsi faze

- klasicka kalkulacka: castka, vlastni kapital, procento uroku a graf
- historie urokovych sazeb v CR
- vysledna castka po ukoncene fixaci 1, 2, 3, 5, 10 let
- hypotecni kalendar: zadani pocatecniho data a vypocet uhrazenych splatek
mozna neco jako tohle:
Poř.    datum   	Splátka	Úrok (CZK)	Úmor (CZK)	Úvěr (CZK)
1  1.1.2027	71 643,11	50 000,00	21 643,11	9 978 356,89
2	1.2.2027 71 643,11	49 891,78	21 751,32	9 956 605,57
3	... 71 643,11	49 783,03	21 860,08	9 934 745,49
4	... 71 643,11	49 673,73	21 969,38	9 912 776,12
5	... 71 643,11	49 563,88	22 079,23	9 890 696,89
6	... 71 643,11	49 453,48	22 189,62	9 868 507,27
7	... 71 643,11	49 342,54	22 300,57	9 846 206,70
8	... 71 643,11	49 231,03	22 412,07	9 823 794,63
9	... 71 643,11	49 118,97	22 524,13	9 801 270,50

## Jak projekt spustit

1. Nainstaluj zavislosti:

```bash
npm install
```

2. Spust vyvojovy server:

```bash
npm run dev
```

3. Otevri prohlizec na adrese, kterou vypise Vite, obvykle:

```text
http://localhost:5173
```

## Dalsi prikazy

```bash
npm run build
npm run preview
```
