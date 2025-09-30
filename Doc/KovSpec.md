# Jelenlegi helyzet leírása:

A világgazdaság jelenlegi helyzete és meg nem mondom melyik politikai párt miatt, az emberek pénztárcája zsugorodik össze, míg rohamosan nőnek vele szemben az árak. Az online vásárlás ugyan rohamosan terjed és soha nem látott népszerűségnek örvend, azonban a megfelelő termék megtalálása a legjobb áron sok időt és energiát igényel. A felhasználók gyakran több órát töltenek különböző webáruházak böngészésével, ami frusztráló és nehézkes folyamat. **Ez a "turkálás" folyamat mértéktelenül lecsökkenthető és leegyszerűsíthető egy célzott kereső használatával**, így a vásárlók gyorsan és kényelmesen találhatják meg a számukra legkedvezőbb ajánlatot.  

# Megrendelői igényspecifikáció (megrendelő által megfogalmazott igények, célok, követelmények):

## Megrendelői vízió (Vágyálom):
Egy olyan felhasználóbarát online platform, amely elsődleges kiindulóponttá válik mindenki számára, aki ruházati terméket szeretne vásárolni az interneten. Néhány kattintással megtalálhatja a számára tökéletes terméket, összehasonlítva több webáruház ajánlataival, és biztos lehet abban, hogy a legjobb ár-érték arányú döntést hozza.

## Megrendelői cél: 
1. Biztosítani, hogy a vásárlók gyorsan, egyszerűen és kényelmesen találják meg számukra a ruházati terméket.
2. Egyetlen felületen történjen az webáruházak közötti összehasonlítás.
3. Az árak, kínálat egy helyen, könnyen szűrhető formájában jelenjen meg.
4. Kevésbé ismert webáruházak népszerűségének és forgalmának növelése.
5. Kialakítani egy hosszú távú rendszert, amely fenntartható bevételt termeljen hirdetések és jutalékok révén.
6. A felhasználók eltudják menteni kedvenc termékeiket.
7. Megtudják tekinteni más felhasználóaknak a kereséseit.

## Megrendelői követelmény:
1. Az alkalmazásban a termékek kereshetőek legyenek kulcsszavak és kategóriák alapján (pl. póló, kabát).
2. A felhasználó számára legyen elérhető a találatok mező ahol több oldal találatát láthatja. 
3. Termék részletes adatainak megtekintése.
4. Alapvető partnerinformációk a webáruház nevéről, logójáról és webcíméről.
5. Tudjon regisztrálni a felhasználó.
6. Betudjon lépni a fiókjába a felhasználó.
7. Eltudja menteni az adott terméket amit majd később is eltud érni.
8. Újra tudja índitani a keresést ha elbukik. 

## Funkcionális követelmények

A felhasználó által elérhető funkciók

- Tud keresni több helyen egy oldalon keresztül
- Tudja módosítani a keresési módszert:
    - Kitudja választani melyik webáruházt érintse a kereső
    - Tud szűrni minimum és maximum ár szerint 
    - Tud szűrni méret szerint
    - Betudja állítani mennyi találatot mutasson weboldalanként a kereső
- A keresési találatokra át tud navigálni és megtudja vásárolni a terméket
- Megtudja tekinteni a termékek részletes adatait
- Létre tud hozni egy új felhasználót
- Betud jelentkezni a fiókjába
- Eltudja érni a kedvencek menüt ha regisztrált felhasználó
- Tud terméket hozzáadni a kedvencekhez
- Tud terméket kivenni a kedvencek közül 
- Eltudja érni az előző keresések elemeit
- Megtudja jeleníteni az elmúlt kereséseket


## A rendszerrel szemben támasztott általános követelmények

- A rendszert bárki használhatja, bárhonnan
- Reszponzív felület, webes funkciókhoz és andoridhoz
- Gyors keresés
- Keresési találat megegyezik a keresett darabbal


## Felülettel szemben támasztott követelmények

- Web 
    - az elkészített prototípusnak megfelelő
- Android
    - A komponensek strukturáltan jelennek meg
    - A szűrő elérhető módon jelenik meg
    - A képek az adott eszköz arányos méretben jelenik meg

- Használhatóság
    - Reszponzív dizájn mobilon, tableten, weben.
    - Könnyen elérhető szűrési opciók.

- Biztonság
    - Adatok titkosított tárolása (pl. jelszavak hash-elve).
    - HTTPS kötelező.

- Megbízhatóság
    - Ha egy áruház nem elérhető, a többi eredményt akkor is mutassa.
    - Hibás keresés esetén legyen újrapróbálási lehetőség.
   
- Fenntarthatóság:
    - Kód legyen moduláris, bővíthető új webáruházak integrációjára.

## Részletes követelmények:

**K01 Adatgyűjtés** Áruházak kínálatának felderítése web scraping segítségével.  
**K02 Keresés** A felhasználók képesek a kínálat között keresi.  
**K03 Szűrés** A felhasználók képesek bizonyos kulcsszavak használatával a kínálat szűrésére.  
**K04 Termék részletek** Az oldal megjeleníti a termékek részleteit.  
**K05 Termék forrása** Az egyes termékek jól látható módon megjelölt forrással vannak ellátva.  
**K06 Rendezés** A felhasználó képes a termékeket különböző szempontok szerint rendezni.  
**K07 Árak összehasonlítása** Az oldal képes az egyes termékek árait összehasonlítani.
**K08 Regisztráció/Bejelentkezés** felhasználónév, email és jelszó, jelszó követelményekkel.    
**K09 Kedvencek kezelése** termék hozzáadás/eltávolítás, kedvencek menü.
**K10 Keresési előzmények** megjelenítése, törlés lehetősége.


## Felhasználói esetek

UC1 - Termék keresése
UC2 - Termék adatainak megtekintése
UC3 - Webáruház navigálás
UC4 - Kedvencekhez hozzáadás
UC5 - Kedvencekhez navigálás
UC6 - Regisztrálás
UC7 - Bejelentkezés
UC8 - Előzmények


## Fogalomtár:

1. **Web scraping**: Adatgyűjtés weboldalakról automatizált szkriptek segítségével.
2. **Reszponzív felület**: olyan webes felület, amely alkalmazkodik a különböző képernyőméretekhez.
