# Kaip atlaisvinau 440 GB disko vietos Docker serveryje

Kai mano namų serveris pradėjo rodyti, kad disko užimtumas siekia beveik 500 GB, aš sutrikau. Mano galvoje tai nesisiejo su realybe: juk serveris skirtas konfigūracijoms, o ne sunkiems failams. Turėjau tik keletą **docker-compose.yml** failų ir bėgančius konteinerius. Kur dingo visa vieta?

Šiandien papasakosiu, kaip su AI pagalba išsiaiškinau tikrąją kaltininkę, kodėl standartinės Linux komandos „užstrigdavo“ ir kaip aš priverčiau Docker sistemą pačią prižiūrėti savo šiukšles.

### Problema: Kai „švarus“ serveris tampa šiukšlynu
Mano serveris veikia su NVMe SSD disku, todėl lėtumo problemų neturėjau. Tačiau kai 

```bash
df -h
```
parodė, kad diske užimta šimtai gigabaitų, supratau, kad kažkas negerai.

Mano pirmoji mintis buvo rasti didžiausius failus. Standartinė komanda tam yra 

```bash
du (disk usage)
```
Deja, mano atveju ji tapo tikru galvos skausmu. Bandydamas suskaičiuoti viso disko apimtį su 


```bash
du -h --max-depth=1 /
```
aš tiesiog laukiau. Ir laukiau. Ir laukiau. Komanda tiesiog „pakibo“.

Pasirodo, šakninis katalogas turėjo daugybę mažų failų (Docker sluoksnių, sisteminių procesų), todėl du bandymas viską perskaičiuoti buvo beviltiškas.

### Sprendimas: ncdu ir AI pagalba
Kadangi laikas buvo brangus, o aš norėjau greito atsakymo, pasitelkiau savo AI asistentą. Jis pasiūlė vietoj du naudoti ncdu – interaktyvų įrankį, kuris veikia žymiai greičiau ir leidžia naršyti po katalogus kaip failų tvarkyklėje.

Komanda buvo paprasta:
```bash
sudo apt install ncdu -y
sudo ncdu /
```
Atsidaręs interaktyvų meniu, aš greitai pamačiau štai ką:

```text
485.0 GiB [####################] /var
```
Nuėjęs giliau, radau tikrąją problemos priežastį:

```text
/var/lib/docker/overlay2   481.6 GiB
```
Pasirodo, kad Docker build cache (tarpiniai sluoksniai, kuriuos Docker sukuria kurdamas image'us) užėmė beveik visą disko vietą. Kadangi aš dažnai kuriu naujus konteinerius ir perleidžiu senus, Docker „tyliai“ kaupė šias šiukšles, manydamas, kad jos pravers ateityje.

Kaip tai sutvarkiau?
Docker turi specialų įrankį šiam cache'ui valyti. Nereikia trinti jokių failų rankiniu būdu (kas galėtų sugadinti sistemą) – užtenka vienos komandos:


```bash
docker builder prune -a -f
```
Po šios komandos disko užimtumas akimirksniu nukrito nuo **27% (496 GB)** iki **3% (52 GB)**. Atlaisvinau daugiau nei **440 GB** vietos, kuri man visiškai nereikalinga!

### Kaip užkirsti kelią tam ateičiai?
Išvalyti cache vieną kartą yra gerai, bet aš norėjau, kad tai nepasikartotų. Kadangi naudoju **cron** savo serverio automatizavimui, pridėjau savaitinę užduotį, kuri išvalys Docker build cache automatiškai:

```bash
# Atidarome cron failą
crontab -e

# Pridedame eilutę (kiekvieną sekmadienį 4:00 ryto)
0 4 * * 0 docker builder prune -a -f >> /var/log/docker_cleanup.log 2>&1
```
Be to, nustačiau Docker logų rotaciją, kad patys konteinerių logai neišaugtų iki begalybės. Tam reikia sukurti failą **/etc/docker/daemon.json**:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Ir perkrauti Docker servisą:

```bash
sudo systemctl restart docker
```

### Pamokos
1. **du** nėra universalus įrankis. Jei turite daug smulkių failų (ypač Docker aplinkoje), geriau naudoti **ncdu**.

2. **Docker kaupia daugiau, nei manote.** Jei dažnai statote image'us, build cache gali išaugti iki šimtų gigabaitų.

3. **Automatizacija yra raktas.** Vietoj to, kad kas mėnesį valyčiau rankiniu būdu, dabar tai daro **cron**.

Šiandien mano serveris vėl kvėpuoja laisvai, o aš žinau, kad po savaitės jis vėl bus švarus. Jei ir jūs naudojate Docker namų serveriui, patikrinkite savo overlay2 dydį – galbūt ten slepiasi keli šimtai gigabaitų, apie kuriuos net neįtarėte.