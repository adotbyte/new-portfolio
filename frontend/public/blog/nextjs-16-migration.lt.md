# Kaip išsprendžiau Next.js 16 migracijos galvos skausmus

Mano portfelis ilgą laiką veikė su sena Next.js versija. Ji veikė nepriekaištingai, bet aš žinojau, kad reikia atsinaujinti. Pagrindinė priežastis buvo **saugumas**. Mano darbe saugumas yra prioritetas numeris vienas. Nors 100% apsaugos niekada nebūna, bet saugotis privaloma kiek įmanoma labiau. Todėl nusprendžiau atnaujinti savo aplikaciją į naujausią Next.js 16 versiją.

Tai nebuvo paprastas „vieno mygtuko“ sprendimas. Migracija atnešė keletą netikėtų kliūčių, kurias teko spręsti. Šiame straipsnyje papasakosiu, su kokiomis problemomis susidūriau ir kaip jas išsprendžiau.

## 1. Turbopack ir fetch problemos

Next.js 16 pagal nutylėjimą naudoja naują **Turbopack** kompiliatorių. Tai labai greitas įrankis, bet jis turi savo niuansų. Viena didžiausių problemų, su kuria susidūriau, buvo **fetch** kvietimai API maršrutuose.

Kai kurie mano API maršrutai (pvz., **/api/prometheus** ar **/api/homelab**) pradėjo mesti klaidą **HANGING_PROMISE_REJECTION**. Pasirodo, Next.js 16 su **cacheComponents** funkcija bando statiškai sugeneruoti šiuos maršrutus **build** metu, o tai trunka ilgai, kol laukiama atsakymo iš išorinių šaltinių.

**Sprendimas:** Šiuose API maršrutuose pridėjau **await connection()** iš **next/server**. Tai priverčia Next.js suprasti, kad šis maršrutas turi būti vykdomas tik užklausos metu, o ne statinio generavimo metu.

## 2. cacheComponents ir params problema

Kita klaida buvo susijusi su **cacheComponents** ir serverio komponentais. Next.js 16 reikalauja, kad **params** būtų nuskaitomi tik **Suspense** ribose. Mano **AboutMe** komponentas bandė nuskaityti **locale** per **getTranslations** ir **headers()**, o tai sukėlė klaidą.

**Sprendimas:** **AboutMe** komponentą apvyniojau į **<Suspense>** su **fallback** (skeleton) ir **params** nuskaitymą perkėliau į atskirą asinchroninę funkciją.

## 3. next-themes ir React 19

React 19, kuris ateina su Next.js 16, griežčiau tikrina, kurie komponentai gali naudoti **<script>** žymas. **next-themes** biblioteka naudojo inline **<script>**, todėl atsirado įspėjimas.

**Sprendimas:** Apgaubiau **ThemeProvider** ir pridėjau tikslinį **console.error** filtrą, kuris slopina tik šį konkretų įspėjimą. Tai leidžia išlaikyti temos perjungimo funkcionalumą be klaidų.

## 4. Tinklaraščio ir PDF generavimo iššūkiai

Migracijos metu taip pat teko atnaujinti PDF generavimo logiką. **jsPDF** biblioteka ne visada tinkamai palaiko lietuviškus simbolius, todėl teko įkelti specialų **.ttf** šriftą su **latin-ext** poaibiu. Taip pat teko pataisyti **ReactMarkdown** kodo blokų atvaizdavimą, kad jie atrodytų gražiai tiek šviesiame, tiek tamsiame fone.

## Rezultatas

Po kelių valandų darbo ir daugybės bandymų, mano portfelis sėkmingai veikia su Next.js 16. Dabar jis yra saugesnis, greitesnis ir modernesnis. Migracija buvo iššūkis, bet verta kiekvienos pastangos.

## Kuo galiu padėti jums?

Jei jūsų aplikacija vis dar veikia su sena Next.js versija, galiu padėti ją atnaujinti. Žinau, su kokiomis problemomis susidursite, ir galiu jas išspręsti greičiau nei tie, kurie su tuo susiduria pirmą kartą. Saugumas ir našumas yra mano prioritetai, todėl galiu užtikrinti, kad jūsų aplikacija būtų ne tik graži, bet ir saugi.

Susisiekime – mielai aptarsime jūsų projekto poreikius.