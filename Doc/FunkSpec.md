# Funckionális Specifikáció

A rendszer egy online platform, amely lehetővé teszi ruházati termékek több webáruházból történő
keresését, szűrését. A felhasználó más keresését is el tudja érni és megtekinteni a találatokat.
Emellett, egyes termékeket a kedvencek közé tudja sorolni, hogy ha a jövőben mégis meg szeretné vásárolni, akkor ne kelljen újra keresnie.
A cél, hogy a felhasználó gyorsan megtalálja a számára megfelelő terméket a legjobb áron, anélkül hogy több áruház oldalát kellene böngésznie.
Ráadásul, tudjon értékelni az adott oldalt az élményeivel kapcsolatban, esetleg csillagozni is ami idővel elnyeri a megbízható bolt kitüntetést.

## Felhasználói szerepkörök

- Vendég felhasználó: belépés nélkül kereshet és böngészhet
- Regisztrált felhasználó: elmentheti a kereséseket, kedvenceket

## Részletes funkcióleírások

1. Keresés
A felhasználó kulcsszavak (pl.: póló, kabát) alapján kereshet terméket. Emellett tetszés szerint tud választani mennyi találatot adjon vissza a kereső és melyik oldal mutasson eredményt.

- Bemenet: Szöveges kulcsszó
- Kimenet: találati lista termékekkel
- Hibaágak: 
    - Ha nincs találat, akkor megpróbálja újraindítani a keresést a rendszer
    - Ha újra próbálkozás esetén sincs eredmény akkor, egy "No results" üzenetet lát a felhasználó 
    - Ha a kereső nem tud elindulni, akkor "Sudden error occured, please try again later." üzenetet lát a felhasználó 

2. Szűrés 
A felhasználó szűrheti a találatokat ár, méret alapján és rendezheti őket ár szerint csökkenően és növekvően. A rendszer biztosít egy alapértelmezett beállítást, hogy ha a felhasználó nem kíván semmilyen szűrőt használni. 

- Bemenet: kiválasztott szűrési feltételek
- Kimenet: szűrt és rendezett találati lista

3. Kedvencek
A regisztrált felhasználó, ha nem biztos vásárlási szándékában akkor, elmentheti a kedvencek közé, ami képpel együtt elmenti az adott terméket a kedvencek fül közé. A kedvencekhez bármikor hozzáfér a felhasználó és minden felhasználónak egyedi kedvencek fül tartozik.

- Bemenet: A termék kártyán található csillag gombra rákattint
- Kimenet: A kedvencek fülben megjelenő termék
- Megszorítás: Egy felhasználónak maximum 20 kedvence lehet egyidejűleg

4. Termék részleteinek megtekintése 
A felhasználó részletes adatokat lát a termékről (pl.: nagyított kép, leírás méretek, ár és elérhetőség).

- Bemenet: termékenként részletek gombra rákattint 
- Kimenet: termék adatlap

5. Navigálás a forráshoz
A felhasználó átirányítható az eredeti webáruház termékoldalára ahol megvásárolhatja a kívánt terméket. 

- Bemenet: a részletekből vagy a találatokból a képre kattint
- Kimenet: új böngészőfülön megnyíló webáruház.

6. Regisztrálás
A felhasználó új fiókot hozhat létre az alkalmazásban.

- Bemenet: adatok: e-mail cím, felhasználónév, jelszó(minimum 8 karakter) 

Folyamat:
1. Felhasználó megnyitja a "Create User" oldalt
2. Kitölti az adatokat
3. Rendszer ellenőrzi:
    - e-mail formátuma helyes
    - e-mail még nincs a rendszerben
    - felhasználó még nincs a rendszerben
    - Jelszó megfelel a követelményeknek
4. Rendszer elmenti az adatokat
5. A felhasználót automatikusan bejelentkeztetve folytathatja teendőit

- Kimenet: Új fiók létrejön, a felhasználó mostantól bejelentkezhet.

Hibaágak:
    - Ha az e-mail címe nem felel meg a formátumnak, akkor az üzenet:"This e-mail address format is incorrect"
    - Ha az e-mail cím már foglalt, akkor az üzenet:"This e-mail address is already in use!"
    - Ha a felhasználónév már foglalt, akkor az üzenet: "This username is already in use!"
    - Ha a jelszó nem felel meg a követelmenyeknek, akkor az üzenet: "The password length is too short"

7. Bejelentkezés
A regisztrált felhasználó betud jelentkezni a fiókjába. 

-   Bemenet: felhasználó helyes adatai
-   Kimenet: sikeres bejelentkezésnél tovább írányítja a kereső oldalra
-   Hibaágak:
    - Ha helytelen a jelszó vagy a felhasználó, akkor az üzenet: "The username or password doesn't match"

8. Előzmények
A felhasználóak eltudják érni más felhasználóak kereséit.

-   Bemenet: adott keresési mező rákattintása
-   Kimenet: adott keresési találatok

9. Értékelések
A felhasználó tud szövegesen és csillagokkal webárúházat értékelni. 

- Bemenet: szöveg vagy csillag
- Kimenet: adott értékelési típus megjelenítése a webáruház alatt

## Use Case-ek 

#### UC1 - Termék keresése
1. A felhasználó beírja a kulcsszót a keresőmezőbe
2. A felhasználó tud szűrőt beállítani és rendezni ár szerint
2. A rendszer elkezdi a keresést a kulcsszóval
3. A rendszer megjeleníti a találatokat listanézetben

#### UC2 - Termék adatainak megtekintése
1. A felhasználó rákattint egy találatra
2. A rendszer betölti és megjeleníti a termék részletes adatlapját.

#### UC3 - Webáruház navigálás
1. A felhasználó részletek vagy a képre kattint
2. A rendszer továbbítja a forgalmazó webáruház oldalára ahol meg tudja vásárolni

#### UC4 - Kedvencekhez hozzáadás
1. A regisztrált felhasználó keress egy termékre és talál egy szimpatikus terméket
2. A termékkártyáknál a csillagra kattintva elmenti a kedvencekhez az adott terméket

#### UC5 - Kedvencekhez navigálás
1. A regisztrált felhasználó ikonjánál rákattint a "favorites" menüponthoz 
2. A rendszer elnavigálja a kedvencekhez

#### UC6 - Regisztrálás
1. A felhasználó rákattint a "Create User" gombra, ami tovább irányítja a regisztrációs felületre
2. A felületen megadja az adatait
3. A rendszer ellenőrzi az adatokat, ha hibás visszadobja
4. Sikeres regisztrációnál a rendszer visszaviszi a keresés mezőhöz a felhasználót

#### UC7 - Bejelentkezés
1. A regisztrált felhasználó belép az oldalra
2. A felhasználó rákattint a "login" fülre
3. Megadja az adatait
4. A rendszer ellenőrzi sikerességét
5. A rendszer helyes adatok megadása esetén tovább lépteti a felhasználót a keresési oldalra, ellentétes esetben visszadobja.

#### UC8 - Előzmények
1. A felhasználó a keresések mező mellett láthatja az előző felhasználóak kereséseit
2. Rákattintva megmutatja az eredményeket

#### UC9 - Értékelés
1. A felhasználó minden weboldal mellett tud értékelést tenni szövegesen is meg csilaggal is.
2. A rendszer elmenti az értékeléseket
3. A rendszer megmutatja az értékelést weboldalanként lista nézetben

#### UC10 - Nyelv
1. A felhasználó tud választani 2 nyelv közül a weboldalon. Angol vagy Magyar
2. Kiválasztja az adott ikont és a weboldal átvált az adott nyelvezetre. 


## Felhasználó felület (UI)

1. Kereső oldal
- Keresőmező
- Szűrési gomb
- Szűrési lista (min/max ár mezők, méret mező, áruház blacklist checkbox, mennyi találati vissza mező)
- Találati lista: kép + ár

2. Termék részletek oldal
- Nagy kép
- Leírás
- Árlistázás
- Továbbító gomb

3. Kedvencek oldal
- Elmentett képek listanézetben + árral
- Törlési lehetőség

4. Regisztrációs oldal
- Felhasználónév mező
- E-mail cím mező
- Jelszó mező
- Regisztrációs gomb

5. Bejelentkezés oldal
- Felhasználónév mező
- Jelszó mező
- Bejelentkezés gomb

6. Értékelések oldal
- Weboldalak listanézetben
- Értékelések felhasználónévvel
- Csillagértékelések -> megbízható jelvény

# TODO
UI terveket be lehet ide rakni, ha kész vannak!


## Adatmodell
- Weboldalak (weboldalNév, találtKépek -> (url,href,src))

## Nem funkcionális követelmények 
- Teljesítmény: a keresés maximum 20 másodpercet vesz igénybe
- Megbízhatóság: ha egy áruház nem elérhető, vagy nem talált eredményt akkor is adjon a többi találatról eredményt
- Használhatóság: reszponzív működés mobilon és weben