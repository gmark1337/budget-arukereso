# Cél

Egy weg ár-összehasonlító szolgáltatás, amely:

- webshopok termékeit és áraikat gyűjti
- gyors keresést és szűrést kínál
- akciófigyelést biztosít a felhasználónak
- más felhasználóak keresési találatait megtekinteni
- más nyelven beszélőek is tudják használni a weboldalt
- lehet véleményt írni az adott weboldalról
- elmenteni az adott terméket

# Fő komponensek

1. Web frontend (ejs sablonmotor/CSS) - keresés, szűrés, akciófigyelő, előzmények kezelése, account
2. API Gateway + Backend(Node.js + Express) - üzleti logika, authorization
3. Scrapers - webes scraping, termékek keresése(párhuzamos keresés, memóriában való tárolás)
4. Adatbázis - nem relációs adatbázis(mongoDb), felhasználóak, előzmények, kedvencek tárolása

# Architektőra

[ FELHASZNÁLÓ (böngésző)] -> [ FRONTEND ] -> EJS sablon (+CSS) -> [ BACKEND ] -> Express.js router, webscraping -> [ ADATBÁZIS ] -> MongoDB(Json struktúra) felhasználóak, előzmények, kedvencek tárolása

# Adatmodell

[UML](assets/adatbazis_terv.png)

## Users tábla

- userId -> ObjectId
- username -> string || Required, unique
- password -> string || Required, hashed
- email -> string || Required, unique

## Reviews tábla

- reviewId -> ObjectId
- userId -> ObjectId || Refer to Users.userId (1:n relation)
- stars -> int(1-5)
- message -> string

## Favorites tábla

- favoriteId -> ObjectId
- userId -> ObjectId || Refer to Users.userId(1:n)
- product
- addedAt -> Date

## History tábla

- historyId -> ObjectId
- userId -> ObjectId || Refer to Users.userId(1:n)
- product

## Product rész

- websiteName -> string
- foundImages -> array

## foundImages

- href -> url
- src -> url
- price -> string
- title -> string

# Fő oldalak és működés (+API endpoint)

| Oldal               | Útvonal                                                                                                        | Leírás                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Főoldal             | /                                                                                                              | Keresőmező, előzmények listája    |
| Keresési eredmények | /search?searchword=Kék felső                                                                                   | Találatok weboldalanként lebontva |
| Szűrési feltétel    | &minPrice=4000&maxPrice=16000&size=M&count=3&hervis=true&sinsay=false&sportissimo=true&aboutYou=true&order=asc | kereséshez alkalmazza a szűrést   |
| Bejelentkezés       | /login                                                                                                         | Bejelentkezési felület            |
| Regisztráció        | /register                                                                                                      | Regisztrációs felület             |
| Favorites           | /favorites                                                                                                     | Kedvencek felület                 |

# Tesztelés
- Unit + integrációs tesztek

# Sprintek 
1. Alapok - repo, dokumentumok, alap keresőrendszer, routing + minimális frontend
2. Optimalizálás, takarítás - kód tisztitás, dokumentumok javítása/pótlása, keresőrendszer optimalizálása, kerekebb API rendszer
3. Felhasználó/előzmények - adatbázis, bejelentkezés/regisztrációs felület + előzmények nézet