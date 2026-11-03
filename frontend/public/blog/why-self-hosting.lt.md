# Kodėl pasirinkau savarankišką prieglobstį (self-hosting) ir ką tai man davė

Mano pirmasis kompiuteris atsirado namuose 2001 metais, o internetas – 2003-iaisiais. Nuo pat pirmos dienos tas „interneto“ pasaulis mane taip užkabino, kad norėjau suprasti, kaip viskas veikia „po kapotu“. Jau tada, žiūrėdamas į seną stalinį kompiuterį, svajojau jį paversti serveriu. Tiesa, elektros kaina tuo metu atrodė per daug bauginanti, todėl svajonė liko stalčiuje.

Tačiau noras niekur nedingo. Kai tik išgirdau apie *Raspberry Pi*, supratau – štai mano šansas. Tai atrodė kaip tobulas projektas: mažas, tylus, taupus. Vis dėlto, tik 2025 metų vasarį aš galutinai supratau, kad man to tikrai reikia. Ir ne šiaip, o iškart su 16GB RAM versija bei NVMe palaikymu. Taip namuose atsirado „avietė“ su dviem 2TB NVMe diskais.

Prasidėjo mano asmeninė kelionė į **self-hosting** (savarankišką prieglobstį).

## Nuo ko pradėjau?

Mano pagrindinis tikslas buvo išmokti naudoti **Docker** ir **Cloudflare Tunnels**. Norėjau, kad visos mano paslaugos būtų izoliuotos, lengvai atnaujinamos ir saugiai pasiekiamos iš interneto, neatidarant nereikalingų prievadų. Tai buvo tarsi naujas žaidimas, kuriame kiekvienas žingsnis atverdavo vis daugiau galimybių.

Bet tada įvyko tai, ko visiškai nesitikėjau. Atsiradus AI įrankiams (tokiam kaip Claude), aš pradėjau ne tik naudotis svetimomis aplikacijomis, bet ir **kurti savo**. Tai buvo dar viena svajonė – programuoti. Anksčiau ji atrodė per sunki, nes įsivaizdavau, kad kiekvieną klaidą teks debug'inti valandų valandas per Google paiešką.

## Ką tai man davė?

Šiandien, žiūrėdamas atgal, matau, kad savarankiškas prieglobstis man davė kur kas daugiau nei tik veikiantį serverį:

1. **Supratimą, kaip veikia internetas.** Nuo DNS, SSL iki reverse proxy ir Cloudflare Zero Trust. Dabar aš nebe „vartotojas“, o žmogus, kuris supranta, kas vyksta už kiekvieno paspaudimo.
2. **Drąsą eksperimentuoti.** Kai žinai, kad gali viską atkurti (jei turi backup'us), nebebijai nieko sugadinti. Tai leidžia mokytis iš klaidų.
3. **Naują požiūrį į AI.** Supratau, kad AI nėra tik „atsakymų mašina“. Tai yra įrankis, kuris gali padėti peržengti tas ribas, kurios anksčiau atrodė neįveikiamos. Šiandien aš rašau kodą, kurį prieš metus būčiau laikęs neįmanomu.
4. **Pasitikėjimą savimi.** Nors mano kelias prasidėjo nuo „noriu pažiūrėti, kaip veikia Docker“, šiandien aš turiu automatizuotus backup'us, monitoringą ir savo sukurtą AI agentą, kuris gyvena mano portfelyje.

## Ką noriu pasakyti kitiems?

Jei tu dvejoji, ar verta pradėti, ar tau „per sunku“ – žinok, kad aš irgi taip galvojau. Svarbiausia yra pradėti nuo mažo žingsnio. Nusipirkai Raspberry Pi? Puiku. Įsidiek Docker. Paleisk vieną konteinerį. Tada antrą. Ir taip po truputį.

Šiandien mano namų laboratorija veikia 24/7. Ji pati save prižiūri, daro backup'us ir net siunčia man pranešimus, jei kas nors nepavyksta. Tai nėra magija. Tai tiesiog žingsnis po žingsnio nueitas kelias.

Ir patikėk – tas kelias yra vertas kiekvienos valandos.