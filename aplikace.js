let aktualniSlovicko = {};
let aktualniMod = 'psani'; 
let aktualniJazyk = 'anglictina'; 
let smerZasCestiny = true; 
let aktualniLevel = 'zakladni_fraze'; 

let aktualniStreak = 0;
let nejlepsiStreak = localStorage.getItem("vocab_best_streak") ? parseInt(localStorage.getItem("vocab_best_streak")) : 0;

let blokovatZadani = false;

const zkratkyJazyku = {
    anglictina: "en",
    nemcina: "de",
    spanelstina: "es",
    nizozemstina: "nl",
    francouzstina: "fr",
    svedstina: "sv",
    rustina: "ru",
    italstina: "it"
};

function odstranDiakritiku(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function aktualizujSkoreRozhrani() {
    document.getElementById("current-streak").innerText = aktualniStreak;
    document.getElementById("best-streak").innerText = nejlepsiStreak;
}

function otocSmer() {
    if (blokovatZadani) return;
    smerZasCestiny = !smerZasCestiny;
    document.getElementById("instruction-text").innerText = smerZasCestiny ? "Přelož slovo:" : "Přelož do češtiny:";
    vygenerujSlovicko();
}

function zmenJazyk(e, novyJazyk) {
    if (e) e.preventDefault();
    if (blokovatZadani) return;
    aktualniJazyk = novyJazyk;
    vygenerujSlovicko();
}

function zmenMod(e, novyMod) {
    if (e) e.preventDefault(); 
    if (blokovatZadani) return;
    aktualniMod = novyMod;
    document.getElementById('input-mode-zone').classList.toggle('hidden', novyMod !== 'psani');
    document.getElementById('choice-mode-zone').classList.toggle('hidden', novyMod !== 'vyber');
    vygenerujSlovicko();
}

function zmenSekci(e, novaSekce) {
    if (e) e.preventDefault();
    if (blokovatZadani) return;
    aktualniLevel = novaSekce;
    vygenerujSlovicko();
}

function vygenerujSlovicko() {
    blokovatZadani = false;

    if (typeof centralniDatabaze === 'undefined' || !centralniDatabaze[aktualniLevel]) {
        document.getElementById("question-word").innerText = "Chyba databáze!";
        return;
    }

    const seznamSlovicek = centralniDatabaze[aktualniLevel];
    const nahodnyIndex = Math.floor(Math.random() * seznamSlovicek.length);
    aktualniSlovicko = seznamSlovicek[nahodnyIndex];
    
    const klicJazyka = zkratkyJazyku[aktualniJazyk];
    const ciziPreklad = aktualniSlovicko[klicJazyka];
    
    const otazka = smerZasCestiny ? aktualniSlovicko.cesky : ciziPreklad;
    const spravnyPreklad = smerZasCestiny ? ciziPreklad : aktualniSlovicko.cesky;
    
    document.getElementById("question-word").innerText = otazka;
    document.getElementById("english-input").value = "";
    document.getElementById("result-message").innerText = "";
    document.getElementById("result-message").className = "result";

    if (aktualniMod === 'vyber') {
        generujMoznosti(spravnyPreklad, klicJazyka, seznamSlovicek);
    }
}

function generujMoznosti(spravnaOdpoved, klicJazyka, seznamSlovicek) {
    let vsechnyMoznosti = seznamSlovicek.map(s => smerZasCestiny ? s[klicJazyka] : s.cesky);
    let spatneOdpovedi = vsechnyMoznosti.filter(slovo => slovo.toLowerCase() !== spravnaOdpoved.toLowerCase());
    
    spatneOdpovedi = [...new Set(spatneOdpovedi)];
    spatneOdpovedi.sort(() => Math.random() - 0.5);
    
    let vybraneMoznosti = spatneOdpovedi.slice(0, Math.min(3, spatneOdpovedi.length));
    vybraneMoznosti.push(spravnaOdpoved);
    vybraneMoznosti.sort(() => Math.random() - 0.5);
    
    const container = document.getElementById('options-container');
    container.innerHTML = ''; 
    
    vybraneMoznosti.forEach(moznost => {
        const tlacitko = document.createElement('button');
        tlacitko.innerText = moznost;
        tlacitko.className = 'option-btn';
        tlacitko.onclick = function() { overOdpoved(moznost.toLowerCase()); };
        container.appendChild(tlacitko);
    });
}

function checkWriteAnswer() {
    if (blokovatZadani) return;
    const inputPole = document.getElementById("english-input");
    const odpovedUzivatele = inputPole.value.trim().toLowerCase();
    overOdpoved(odpovedUzivatele);
}

function overOdpoved(odpoved) {
    if (blokovatZadani) return;
    
    const vysledekPole = document.getElementById("result-message");
    const klicJazyka = zkratkyJazyku[aktualniJazyk];
    const ciziPreklad = aktualniSlovicko[klicJazyka];
    const spravnaOdpoved = (smerZasCestiny ? ciziPreklad : aktualniSlovicko.cesky).toLowerCase();

    if (odpoved === "") {
        vysledekPole.innerText = "Nejdřív něco napiš!";
        return;
    }

    blokovatZadani = true;

    const cistaOdpovedUzivatele = odstranDiakritiku(odpoved);
    const cistaSpravnaOdpoved = odstranDiakritiku(spravnaOdpoved);

    if (cistaOdpovedUzivatele === cistaSpravnaOdpoved) {
        vysledekPole.innerText = "Správně! 🎉";
        vysledekPole.className = "result correct";
        aktualniStreak++;
        if (aktualniStreak > nejlepsiStreak) {
            nejlepsiStreak = aktualniStreak;
            localStorage.setItem("vocab_best_streak", nejlepsiStreak);
        }
        aktualizujSkoreRozhrani();
        setTimeout(vygenerujSlovicko, 400); // Rychlé skočení na další
    } else {
        const amazement = smerZasCestiny ? ciziPreklad : aktualniSlovicko.cesky;
        vysledekPole.innerText = `Chyba. Správně je: ${amazement}`;
        vysledekPole.className = "result wrong";
        aktualniStreak = 0;
        aktualizujSkoreRozhrani();
        setTimeout(vygenerujSlovicko, 1500); 
    }
}

// FUNKCE PRO TVÁ MINI TLAČÍTKA
function nevis() {
    if (blokovatZadani) return;
    const klicJazyka = zkratkyJazyku[aktualniJazyk];
    const spravnyPreklad = smerZasCestiny ? aktualniSlovicko[klicJazyka] : aktualniSlovicko.cesky;
    
    const vysledekPole = document.getElementById("result-message");
    vysledekPole.innerText = `Správná odpověď byla: ${spravnyPreklad}`;
    vysledekPole.className = "result wrong";
    
    aktualniStreak = 0;
    aktualizujSkoreRozhrani();
    blokovatZadani = true;
    setTimeout(vygenerujSlovicko, 1500);
}

function oznacUmim() {
    if (blokovatZadani) return;
    const vysledekPole = document.getElementById("result-message");
    vysledekPole.innerText = "Skvělé! Přičítám bod. 🚀";
    vysledekPole.className = "result correct";
    
    aktualniStreak++;
    if (aktualniStreak > nejlepsiStreak) {
        nejlepsiStreak = aktualniStreak;
        localStorage.setItem("vocab_best_streak", nejlepsiStreak);
    }
    aktualizujSkoreRozhrani();
    blokovatZadani = true;
    setTimeout(vygenerujSlovicko, 400);
}

function dalsiSlovicko() {
    if (blokovatZadani) return;
    vygenerujSlovicko();
}

document.getElementById("english-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && aktualniMod === 'psani') {
        checkWriteAnswer();
    }
});

// Start hry
aktualizujSkoreRozhrani();
vygenerujSlovicko();