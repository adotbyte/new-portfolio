# Kaip automatizavau savo namų serverio priežiūrą su Ansible ir Pushover

Žinau, kad backup'as yra vienas svarbiausių dalykų IT pasaulyje. Deja, dauguma žmonių to nedaro, kol dar neįvyksta nelaimė. Aš pats ilgą laiką galvojau: „Reikės kada nors pasidaryti“, bet vis atidėliojau. Kol galiausiai supratau – jei noriu miegoti ramiai, turiu tai automatizuoti.

Tada sugalvojau pasidomėti, kas yra **Ansible**. Išgirdau šį pavadinimą, bet nežinojau, su kuo jį „valgo“. Pasirodo, tai galingas įrankis, leidžiantis automatizuoti serverio konfigūraciją ir valdymą. Su AI pagalba pasirašiau keletą scriptų, ir dabar galiu pasakyti vieną dalyką: **miegu ramiai**.

## Ką daro mano sistema?

Dabar mano serveris kiekvieną naktį, kai aš miegui, pats pasidaro backup'ą. Viskas vyksta automatiškai:

1. **Docker konfigūracijų ištraukimas**: Sistema surenka visus `docker-compose.yml` failus, duomenų bazių dump'us ir svarbiausias konfigūracijas.
2. **Archyvavimas**: Viskas supakuojama į vieną archyvą.
3. **Siuntimas į cloud**: Archyvas nusiunčiamas į Google Drive ir GitHub (priklausomai nuo to, ką backupiname).
4. **Pranešimai**: Per **Pushover** gaunu pranešimą į telefoną, ar viskas pavyko, ar reikia ką nors taisyti.
5. **Valymas**: Sistema automatiškai ištrina senesnius nei 7 dienų backup failus, kad neužkimštų disko.

## Kodėl Ansible?

Ansible man patiko dėl kelių priežasčių:

- **Nereikia diegti agentų**: Ansible veikia per SSH, todėl nereikia nieko papildomai diegti serveriuose.
- **Deklaratyvus**: Tu aprašai, *ką* nori gauti, o ne *kaip* tai padaryti. Tai labai palengvina gyvenimą.
- **Saugumas**: Kadangi viskas vyksta per SSH, nereikia atidarinėti papildomų prievadų.

## Ką tai man davė?

Šiandien aš nebesijaudinu dėl savo duomenų. Žinau, kad net jei diskas sugestų arba kas nors nutiktų su serveriu, turėsiu šviežią backup'ą, kurį galėsiu atkurti per kelias minutes.

Be to, dabar kiekvieną rytą tik pasitikrinu telefoną. Jei matau pranešimą „✅ Visas Backup sėkmingas!“, žinau, kad viskas gerai. Jei matau „❌ Klaida“, žinau, kad reikia įsikišti. Tai yra tas jausmas, kai sistema dirba už tave.

## Patarimas kitiems

Jei dar nedarote backup'ų – pradėkite šiandien. Nebūtina iš karto kurti sudėtingos Ansible sistemos. Pradėkite nuo paprasto scripto, kuris nukopijuoja svarbiausius failus į išorinį diską. Tada pridėkite automatinį paleidimą per `cron`. Ir galiausiai – pridėkite pranešimus, kad žinotumėte, jog viskas veikia.

Ansible ir Pushover yra puikūs įrankiai, kurie gali padėti tai padaryti profesionaliai. Ir patikėkite – tas ramybės jausmas, kai žinai, kad tavo duomenys saugūs, yra vertas kiekvienos investuotos valandos.