**Beállítások:**

- emptyPlaceholderString = :(  

# search-function-test

## results-count-test

**Beállítások:**

- numberOfPagesToFetch.hervis = 4
- numberOfPagesToFetch.sinsa = 3
- numberOfPagesToFetch.sportissimo = 2
- blacklistedWebsite = []
- maxPrice = 20000
- searchword = kabát

A teszt végig megy mindhárom weboldalon és ellenőrzni hogy az adott weboldalhoz tartozó
FoundImages.length egyenlő-e a meghatározott értékkel

## results-blacklist-test

**Beállítások:**

- blacklistedWebsite = [sinsay, sportissimo]
- numberOfPageToFetch.hervis = 3
- searchword = kabát

A teszt ellenőrzni hogy a beérkező tömb hossza egyenlő-e eggyel (3 elérhető oldalból, 2 letiltva),
  majd ellenőrzni hogy az egyetlen elem a tömbben a Hervis websiteName-mel rendelkezik.

## results-price-test

  **Beállítások:**

  - numberOfPagesToFetch.hervis = 3
  - numberOfPagesToFetch.sinsay = 2
  - numberOfPageToFetch.sportissimo = 4
  - blacklistedWebsite = []
  - maxPrice = 20000
  - minPrice = 4000
  - searchword = kabát

  A teszt lefutattja a beállított paraméterekkel a Search függvényt majd ellenőrni minden egyes
  terméknél hogy az ára a minPrice és a maxPrice között legyen, megengedő módon.

## empty-result-test

  **Beállítások:**

  - numberOfPagesToFetch.hervis = 2
  - numberOfPagesToFetch.sinsay = 2
  - numberOfPagesToFetch.sportissimo = 2
  - blackListedWebsite = ['hervis', 'sportissimo']
  - maxPrice = 20000
  - minPrice = 4000

  A teszt lefutattja a Search függvényt ami nem ad vissza eredményt − mivel a Sinsay weboldalon
  nem található Adidas termék − majd ellenőrzni hogy üres tömböt ad-e vissza a függvény.

## empty-searchword-test

  - numberOfPagesToFetch.hervis = 3
  - numberOfPagesToFetch.sinsay = 3
  - numberOfPagesToFetch.sportissimo = 3
  - blackListedWebsite = []
  - maxPrice = 20000
  - minPrice = 4000
  - searchword =

  A teszt ellenőrzni hogy egy üres tömböt ad-e vissza a függvény.

## empty-string-searchword-test

  - numberOfPagesToFetch.hervis = 3
  - numberOfPagesToFetch.sinsay = 3
  - numberOfPagesToFetch.sportissimo = 3
  - blackListedWebsite = []
  - maxPrice = 20000
  - minPrice = 4000
  - searchword = ''

  A teszt ellenőrzni hogy egy üres tömböt ad-e vissza a függvény.

# search-endpoint-edgecases-tests

## empty-result-test

  **Beállítások:**

  - véletlenszerűen generált paraméterek, felülírva az alábbi értékekkel
  - searchword = adidas
  - sinsay = true
  - hervis = false
  - sportissimo = false

  A teszt elküldi a /search endpointra a paraméterezett GET requestet, majd a beérkező HTML-t
  betölti a cheerio könyvtárat használva. A Sinsay webodlal nem ad vissza találatot az Adidas szóra.
  Ezután megnézi a következő CSS selectort használva `fieldset div.items`, hogy az értéke
  megegyezik-e az **emptyPlaceholderString** értékével.

## empty-string-searchword-test

  **Beállítások:**

  - véletlenszerűen generált paraméterek, felülírva az alábbi értékekkel
  - searchword = ''

  A teszt elküldi a /search endpointra a paraméterezett GET requestet, majd eltávolít bármilyen
  whitespace és \n karaktert majd ellenőrzni, hogy a válaszul kapott eredmény egy üres string.

## empty-searchword-test

  **Beállítások:**

  - véletlenszerűen generált paraméterek, felülírva az alábbi értékekkel
  - searchword = undefined

  A teszt elküldi a /search endpointra a paraméterezett GET requestet, majd eltávolít bármilyen
  whitespace és \n karaktert majd ellenőrzni, hogy a válaszul kapott eredmény egy üres string.

## gibberish-searchword-test

  **Beállítások:**

  - véletlenszerűen generált paraméterek, felülírva az alábbi értékekkel
  - searchword = aggrgeththeasdsdfbafvguvguasrf

  A teszt elküldi a /search endpointra a paraméterezett GET requestet, majd a beérkező HTML-t
  betölti a cheerio könyvtárat használva. Ezután megnézi a következő CSS selectort használva
  `fieldset div.items`, hogy az értéke megegyezik-e az **emptyPlaceholderString** értékével.

# search-response-html-tests

  **Beállítások:**

  - véletlenszerűen generált paraméterek
  - $ = a betöltött HTML response

  A teszt elküldi a /search endpointra a paraméterezett GET requestet, majd a beérkező HTML-t
  betölti a cheerio könyvtárat használva.

## results-count-test

  **Beállítások:**

  - expectedNumberOfSites = az engedélyezett weboldalak összege

  A teszt ellenőrzi hogy a $-n elvégzett CSS selector (`fieldset`) művelettel kigyűjtött weboldalak
  darabszáma megegyeik-e az **expectedNumberOfSites**-al.

## results-price-test

  A teszt ellenőrzni hogy a $-n elvégzett CSS selector (`span.chip`) müvelettel kigyűjtott számok
  a minPrice és a maxPrice között vannak, megengedő módon.

## price-order-test

  - prices = az összes termék ára megjelenési sorrendben
  - expectedNumberOfSites = keresett weboldalak száma

  A teszt kigyűjti a weboldalon szereplő árakat majd oldalankénti darabszám lépésközzel ellenőrzi, 
  hogy a tömbrészlet megfelelő módon van rendezve.
