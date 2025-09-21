# Rendszerspecifikáció

A követelményspecifikációban megfogalmazott feladatok elkészítés több ütemben készül el. Az ütemterv első része az alábbiakat tartalmazza.

# A rendszerrel szemben támasztott általános követelmények

- A rendszert bárki használhatja, bárhonnan
- Reszponzív felület, webes funkciókhoz és andoridhoz
- Gyors keresés
- Keresési találat megegyezik a keresett darabbal

# Funkcionális követelmények

A felhasználó által elérhető funkciók

- Tud keresni több helyen egy oldalon keresztül
- Tudja módosítani a keresési módszert:
    - Kitudja választani melyik webáruházt érintse a kereső
    - Tud szűrni állítani prioritást **ár, méret** szerint
- A keresési találatokra át tud navigálni és megtudja vásárolni a terméket

# Felülettel szemben támasztott követelmények

- Web 
    - az elkészített prototípusnak megfelelő
- Android
    - A komponensek strukturáltan jelennek meg
    - A szűrő elérhető módon jelenik meg
    - A képek az adott eszköz arányos méretben jelenik meg


# Webscraping terv 

A weboldal fő funckiója, az adatgyűjtésen múlik. Az alábbi JSON strúktura alapján képzeljük el a kommunikációt a scraper és backend között. 

### Amit kap:

```
{
  "SearchedItem": "Blue Jeans",
  "IsFilteringEnabled": true,
  "IsWebsiteBlacklistEnabled": true,
  "IsPriorityEnabled": true,
  "Filters": {
    "Price": "< 12000 Ft",
    "Size": "L"
  },
  "BlacklistedWebsites": [
    "Website1",
    "Website2"
  ],
  "WebsitePriority": [
    "Website1",
    "Website2"
  ]
}
```

### Amit küld: 

```
{
   "Websites":[
      {
         "WebsiteName":"Website1",
         "FoundImages":[
            {
               "Item":"Blue jeans",
               "URl":"URL",
               "Price":8500
            }
         ]
      },
      {
         "WebsiteName":"Website2",
         "FoundImages":[
            {
               "Item":"Blue jeans",
               "URl":"URL",
               "Price":9000
            }
         ]
      }
   ]
}
```

### Müködés

- Környezet
    - Node.js

A webscrapinget világszerte legelterjedtebben JavaScript nyelven végzik, amelyhez hivatalos támogatás is rendelkezésre áll. A Node.js környezet kényelmesen használható, és számos olyan könyvtár érhető el hozzá, amelyek megkönnyítik az üzleti logika megvalósítását.


- Könyvtárak:
    - [Puppeteer](https://pptr.dev)
    - [Pupteteer-extra](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
    - [Puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
    - [Express](https://expressjs.com)

#### Terv

Egy Chromium alapú böngészőt használva, szimuláljuk az emberi cselekvést.Az adatgyüjtés szekvenciálisan fog történni O(n) idő komplexitásban, ahol n a feldogozandó weboldalak száma.

 A robot a következő lépéseket hajtja végre:

1. Belép a céloldalra
2. Beállítja a szükséges szűrőfeltételeket (amennyiben vannak)
3. Lekéri és elmenti az első találat adatait
4. Oldalanként folytatja a keresést a megadott tartományban
5. Az összegyűjtött találatokat visszaküldi a backend számára feldolgozásra


# Backend terv

A weboldal 3 különböző nézetből fog állni:
1. [Keresési nézet](assets/keresesi-nezet.png) — az alapértelmezett ablak, ami fogadja az ide látogató felhasználókat
1. [Találat nézet](assets/talalat-nezet.png) — a beállított feltételek illetve keresési kulcsszavak után a találatokat összesíti
1. [Termék nézet](assets/termek-nezet.png) — a keresési találtok közül az általunk kiválasztott termék részletes információit mutatja meg

### Működés

- Környezet
    - Node.js

Az oldal meglátogatása esetén a **Keresési nézettel** találkozik a felhasználó, ahol a keresési mező kitöltése és az esetleges feltételek beállítása után az adatokat átadjuk a webscraping részére, aminek a folyamat végeztével beérkező válasza alapján átíránytjuk a felhasználót a **Találat nézethez**.
Ebben a nézetben listázzuk a találatokat. Abban az esetben ha megtetszik egy termék vagy csak érdekli a felhasználót, a termékre való kattintással átléphet a **Termék nézetbe**, ahol részletesebb információkat talál az adott termékről.
