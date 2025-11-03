**Beállítások:**

- emptyPlaceholderString = Failed to find products for this website!
- noUsername = no username provided
- noPassword = no password provided
- noEmail = no email provided
- badUsername = username taken
- badEmail = email taken
- incorrectUsername = invalid username
- incorrectPassword = invalid password

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

# registration-login-user-tests

  **Beállítások**

  - username = test-user-bob
  - email = test-user-bob@test.com
  - password = test-C1jzovFk6bU2

  A tesztek előtt kitöröljük a username:`username` felhasználót.

  A tesztek után kitöröljük a username:`username` felhasználót.

## register-test-user-bob

  Elküldünk egy POST requestet a /register endpointra a beállított értékekkel,
  majd megnézzük, hogy tényleg létezik-e ilyen user a táblában.

## login-user-bob

  Elküldünk egy POST requestet a /login endpointra a beállított értékekkel és
  kikapcsoljuk az automatikus redirect follow-ot, majd megnézzük hogy a response
  status kódja 302, amit a weboldal sikeres bejelentkezés esetén küld.

## check-if-bob-is-logged-in

  Elküldünk egy POST requestet a /login endpointra a beállított értékekkel és
  kikapcsoljuk az automatikus redirect follow-ot, majd megnézzük a Set-Cookiek
  között az Authorize értékét, amit továbbküldünk a / endpointra egy GET
  requestként. Eztuán ellenőrizzük hogy a div#account element a helyes username
  értéket tartalmazza.

# registration-edgecases-tests

## no-username-provided

  **Beállítások**

  - username =
  - email = test-user-bob@test.com
  - password = test-C1jzovFk6bU2

  Elküldünk egy POST requestet a /login endpointra a beállított értékekkel, majd
  ellenőrizzük hogy a #error-message element tartalma megegyezik-e a `noUsername`
  értékével.

## no-password-provided

  **Beállítások**

  - username = test-user-bob
  - email = test-user-bob@test.com
  - password =

  Elküldünk egy POST requestet a /login endpointra a beállított értékekkel, majd
  ellenőrizzük hogy a #error-message element tartalma megegyezik-e a `noPassword`
  értékével.

## no-email-provided

  **Beállítások**

  - username = test-user-bob
  - email =
  - password = test-C1jzovFk6bU2

  Elküldünk egy POST requestet a /login endpointra a beállított értékekkel, majd
  ellenőrizzük hogy a #error-message element tartalma megegyezik-e a `noEmail`
  értékével.

# taken-username-or-email-tests

  **Beállítások**

  - username = test-user-bob
  - email = test-user-bob@test.com
  - password = test-C1jzovFk6bU2

  A tesztek előtt létrehozunk egy user-t a beállított értékekkel.
  A tesztek után kitöröljük egy user-t a beállított értékekkel.

## taken-username

  **Beállítások**

  - password = test-C1jzovFk6bU21

  Elküldünk egy POST requestet a /register endpointra a beállított értékekkel, majd
  ellenőrizzük hogy a #error-message értéke egyezik a `badUsername` értékével.

## taken-email

  **Beállítások**

  - email = atest-user-bob@test.com

  Elküldünk egy POST requestet a /register endpointra a beállított értékekkel, majd
  ellenőrizzük hogy a #error-message értéke egyezik a `badEmail` értékével.

# login-edgecases-tests

  **Beállítások**

  - username = test-user-bob
  - email = test-user-bob@test.com
  - password = test-C1jzovFk6bU2

## incorrect-password

  **Beállítások**

  - password = test-C1jzovFk6bU21

  Elküldünk egy POST requestet a /login endpointra a beállított értékekkel, majd
  ellenőrizzük hogy a #error-message értéke egyezik a `incorrectPassword`
  értékével.

## incorrect-username

  **Beállítások**

  - username = test-user-bob1

  Elküldünk egy POST requestet a /login endpointra a beállított értékekkel, majd
  ellenőrizzük hogy a #error-message értéke egyezik a `incorrectUsername`
  értékével.

# history-tests

  A teszt előtt regisztrálunk egy teszt felhasználót, akinek a `userid` és a
  webszerver által generált autentikációs sütijét (`auth`) elmentjük.

  Minden teszt után töröljük a teszt felhasználó összes **history** rekordját.

  A tesztek végén eltávolítjuk a teszt felhasználót.

  **Beállítások**

  - userid: A tesztek előtt regisztrált felhasználó `id` mező értéke
  - auth: A tesztek előtt regisztrált felhasználó számára generált autentikációs
  süti

## save-successful

  A teszt első lépéseként lekérjük a meglévő `history` rekordokat, majd
  elküldünk egy POST requestet a **/history** endpointra véletlen generált
  paraméterekkel, majd ismét lekérjük a `history` rekordokat és ellenőrizzük,
  hogy a második lekérdezés darabszáma eggyel nagyobb.

## shows-after-save

  Generálunk egy példa terméket, amit utána elküldünk a **/history** endpointra
  egy POST request formájában, majd ellenőrizzük hogy a teszt felhasználó
  `histrory` rekordjai tartalmazzák-e a generált terméket.

## can-be-deleted

  A teszt előtt elküldünk egy POST requestet a **/history** endpointra, majd
  lekérünk egy rekordot a `history` táblából, amely rekord `src` mezőjét eküldjük
  egy DELETE requesttel a **/history** endpointra, ezután ellenőrizzük hogy
  valóban eltávolítottuk-e a teszt felhasználó `history` rekordjaiból.

## max-10-history

  Elküldünk 15 POST requestet véletlen generált paraméterekkel a **/history**
  endpointra, majd ellenőrizzük hogy a teszt felhasználónak nincs több mint 10
  darab rekordja a `history` táblában.

## disallows-duplicates

  Lekérjük a teszt felhasználó összes rekordját a `history` táblából, majd
  generálunk egy véletlenszerű terméket amit kétszer elküldünk egy POST request
  formájában a **/history** endpointra, végül ismételten lekérjük a felhasználó
  összes rekordját és ellenőrizzük, hogy a második állapot darabszáma csak eggyel
  nagyobb.

# favourites-tests

  A teszt előtt regisztrálunk egy teszt felhasználót, akinek a `userid` és a
  webszerver által generált autentikációs sütijét (`auth`) elmentjük.

  Minden teszt után töröljük a teszt felhasználó összes **favourites** rekordját.

  A tesztek végén eltávolítjuk a teszt felhasználót.

  **Beállítások**

  - userid: A tesztek előtt regisztrált felhasználó `id` mező értéke
  - auth: A tesztek előtt regisztrált felhasználó számára generált autentikációs
  süti

## successfully-adds-to-favourites

  A teszt előtt lekérdezzük a meglévő rekordokat a `favourites` táblából, majd
  elküldünk egy POST requestet a **/favourites** endpointra egy véletlenszerűen
  generált példatermékkel, majd ismét lekérdezzük az összes a rekordokat és
  ellenőrizzük hogy eggyel nagyobb a darabszáma.

## successfully-deletes-from-favourites

  A teszt előtt lekérdezzük a meglévő rekordokat a `favourites` táblából, majd
  elküldünk egy POST requestet a **/favourites** endpointra egy véletlenszerűen
  generált példatermékkel, majd lekérdezünk egy rekordot a `favourites` táblából,
  majd elküldünk egy DELETE requestet a **/favourites** endpointra a lekérdezett
  termékkel együtt, majd ellenőrizzük hogy a `favourites` tábla rekordjainak száma
  nem változott.

## added-product-matches-shows-product

  **Beállítások**

  - product: egy véletlenszerűen generált termék

  Elküldünk egy POST requestet a **/favourites** endpointra a `product`
  paramétereivel, majd elküldünk egy GET requestet a **/favourites** endpointra és
  megvizsgáljuk hogy a visszaküldött HTML válasz tartalmazza-e a `product`-ot.

## only-logged-user-can-add-to-favourites

  Elküldünk egy POST requestet a **/favourites** endpointra bármi féle
  autentikációs süti nélkül, majd ellenőrizzük hogy a beérkezett válasz indok
  értéke megegyezik-e a `unauthorized` szöveggel.

## maximum-10-favourites

  Elküldünk 15 POST requestet a **/favourites** endpointra véletlenszerűen
  generált termékek paramétereivel, majd ellenőrizzük hogy a `favourites` tábla
  10 darab rekordot tartalmaz.

# reviews-tests

  A teszt előtt regisztrálunk egy teszt felhasználót, akinek a `userid` és a
  webszerver által generált autentikációs sütijét (`auth`) elmentjük.

  Minden teszt után töröljük a teszt felhasználó összes **reviews** rekordját.

  A tesztek végén eltávolítjuk a teszt felhasználót.

  **Beállítások**

  - userid: A tesztek előtt regisztrált felhasználó `id` mező értéke
  - auth: A tesztek előtt regisztrált felhasználó számára generált autentikációs
  süti

## save-successful

  A tesztek előtt lekérdezzük a felhasználó összes rekordját a `reviews` táblából,
  majd elküldünk egy POST requestet a **/reviews** endpointra, egy véletlenszerűen
  generált review értékekkel, majd ellenőrizzük hogy a felhasználó rekordjainak
  darabszáma eggyel nagyobb.

## star-succesful

  **Beállítások**

  - review: Egy előre beállított értékekkel rendelkező példa review

  Elküldünk egy POST requestet a review paramétereivel, majd elküldünk egy GET
  requestet és ellenőrizzük hogy a felhasználó által hagyott review tartalmazza-e
  a reviewban elküldött quality értéknek megfelelő darab csillagot.

## name-visible

  **Beállítások**

  - review: Egy előre beállított értékekkel rendelkező példa review

  Elküldünk egy POST requestet a review paramétereivel, majd elküldünk egy GET
  requestet és ellenőrizzük hogy a felhasználó által hagyott review tartalmazza-e
  a felhasználó nevét.


## trusted-site-visible

Elküldünk 6 darab POST requestet a **/reviews** endpointra, majd ellenőrizzük
hogy a review.vendor példa weboldal tartalmazza-e a .trused-site osztály
tartalmazza-e a 'Trused site' stringet.

## only-logged-in-user-can-create-review

Elküldünk egy POST requestet bérmi féle autentikációs süti nélkül majd 
ellenőrizzük, hogy a válaszul beérkezett JSON reason mező értéke megegyezik-e a
'unauthorized' stringgel.
