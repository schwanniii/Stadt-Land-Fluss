var alleBuchstaben = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var reelleRunde = -1; 
var rundeZuZeigen = 0;
var timerSecondsTotal = 120;
var maxTimerSeconds = 120;
let timerAktiv;
let aktuelleKategorie = null;
import { daten } from "./daten.js";
let audioCtx = null;

window.onload = function(){
    if(localStorage.getItem("aktuellesSpiel") != null){
        alleBuchstaben = JSON.parse(localStorage.getItem("aktuellesSpiel"));
    } else {
        shuffle(alleBuchstaben);
    }
    if(localStorage.getItem("rundeZuZeigenSpeichern") != null){
        rundeZuZeigen = JSON.parse(localStorage.getItem("rundeZuZeigenSpeichern"));
    } else {
        rundeZuZeigen = 0;
    }
    if(localStorage.getItem("reelleRundeSpeichern") != null){
        reelleRunde = JSON.parse(localStorage.getItem("reelleRundeSpeichern"));
    } else {
        reelleRunde = -1;
    }
    
    buchstabenUpdaten();
    updateWievieleAusgewaehltAnzeige();
    updateNeuesSpielButtonVisuals();
    document.getElementById("span_Anzeige_reelleRunde").innerText = rundeZuZeigen + 1;
    setupPresets();
    generateDropdown();
    buildOrbit();
    setupDropdownToggle();
    updateBeispiele(); // Initialer Check für Titel-Sichtbarkeit
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateNeuesSpielButtonVisuals() {
    const btn = document.getElementById("button_neuesSpiel");
    const hatSchonGespielt = localStorage.getItem("hatSchonGespielt");
    
    if (!hatSchonGespielt && reelleRunde === -1) {
        btn.classList.add("glitter-btn");
    } else {
        btn.classList.remove("glitter-btn");
    }
}

function buchstabenUpdaten(){
    document.getElementById("span_Anzeige_reelleRunde").innerText = rundeZuZeigen + 1;

    var ergebnisAnzeige = [
        document.getElementById("p_Anzeige_buchstabe1"), document.getElementById("p_Anzeige_buchstabe2"),
        document.getElementById("p_Anzeige_buchstabe3"), document.getElementById("p_Anzeige_buchstabe4"), 
        document.getElementById("p_Anzeige_buchstabe5")
    ];

    for (let i = -2; i <= 2; i++) {
        let index = rundeZuZeigen + i;
        let feld = ergebnisAnzeige[i + 2];
        if(!feld) continue;

        feld.classList.remove("aktuelles_Feld");

        if (index < 0 || index >= alleBuchstaben.length) {
            feld.innerText = "";
        } else if (index > reelleRunde) {
            feld.innerText = "?";
        } else {
            feld.innerText = alleBuchstaben[index];
            if(index === reelleRunde){
                feld.classList.add("aktuelles_Feld");
            }
        }
    }
}

// Zentralisierte Funktion: Steuert Beispiele UND die Sichtbarkeit der Überschrift
function updateBeispiele(){
    // Findet die Sektion über die Klasse statt über eine ID
    const gesamtSektion = document.querySelector(".section3");
    const titelAnzeige = document.getElementById("div_AktiveKategorieTitel");
    const container = document.getElementById("div_Beispiele");

    // Versteckt die gesamte Sektion, solange noch keine Runde gespielt wurde
    if (reelleRunde === -1) {
        if (gesamtSektion) gesamtSektion.style.display = "none";
        return; 
    } else {
        if (gesamtSektion) gesamtSektion.style.display = "block"; 
    }

    // Wenn keine Kategorie aktiv ist oder in die Zukunft geblättert wurde, Titel leeren
    if(!aktuelleKategorie || rundeZuZeigen > reelleRunde || !alleBuchstaben[rundeZuZeigen]) {
        titelAnzeige.style.display = "none";
        container.replaceChildren();
        return;
    }
    
    titelAnzeige.innerText = aktuelleKategorie;
    titelAnzeige.style.display = "block";
    
    const buchstabeKey = alleBuchstaben[rundeZuZeigen].toLowerCase();
    container.replaceChildren();
    
    // Beispiele aus der daten.js laden
    if(daten[buchstabeKey] && daten[buchstabeKey][aktuelleKategorie.toLowerCase()]){
        const beispieleArray = daten[buchstabeKey][aktuelleKategorie.toLowerCase()];
        beispieleArray.forEach(beispiel => {
            const p = document.createElement("p");
            p.textContent = beispiel;
            container.appendChild(p);
        });
    } else {
        container.innerText = "Keine Beispiele gefunden.";
    }
}

function rad(weiter){
    if(weiter === true && rundeZuZeigen < (alleBuchstaben.length - 1)){
        if(rundeZuZeigen === reelleRunde){
            zeigeSicherheitsabfrage();
            return;
        }else{
            rundeZuZeigen++;
        }
    } else if(weiter === false && rundeZuZeigen > 0){
        rundeZuZeigen--;
    }
    
    localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen));
    updateBeispiele();
    buchstabenUpdaten();
}

function zeigeSicherheitsabfrage() {
    document.getElementById("modal_sicherheitsabfrage").style.display = "flex";
}
document.getElementById("btn_confirm_ja").addEventListener("click", () => {
    document.getElementById("modal_sicherheitsabfrage").style.display = "none";
    starteAktiveRundeFlow();
});
document.getElementById("btn_confirm_nein").addEventListener("click", () => {
    document.getElementById("modal_sicherheitsabfrage").style.display = "none";
});

function starteAktiveRundeFlow() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    let naechsteRundeIndex = reelleRunde + 1;
    if (naechsteRundeIndex >= alleBuchstaben.length) {
        alert("Alle ausgewählten Buchstaben wurden bereits gespielt!");
        return;
    }

    localStorage.setItem("hatSchonGespielt", "true");

    reelleRunde = naechsteRundeIndex;
    rundeZuZeigen = reelleRunde;
    
    localStorage.setItem("reelleRundeSpeichern", JSON.stringify(reelleRunde));
    localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen));
    updateNeuesSpielButtonVisuals();

    // Beispiele und Titel beim Start einer neuen Runde komplett zurücksetzen
    aktuelleKategorie = null;
    updateBeispiele();

    document.getElementById("seite_main").style.display = "none";

    const overlay = document.getElementById("overlay_aktive_runde");
    const countdownEl = document.getElementById("countdown_spannung");
    const contentEl = document.getElementById("aktive_runde_content");
    
    overlay.style.display = "flex";
    countdownEl.style.display = "flex";
    contentEl.style.display = "none";
    
    let inputTime = parseFloat(document.getElementById("input_Stoppuhr_Zeit").value);
    if (isNaN(inputTime) || inputTime <= 0) inputTime = 2;
    timerSecondsTotal = Math.round(inputTime * 60);
    maxTimerSeconds = timerSecondsTotal;
    
    let countdownZaehler = 3;
    countdownEl.innerText = countdownZaehler;
    
    let countdownInterval = setInterval(() => {
        countdownZaehler--;
        if (countdownZaehler > 0) {
            countdownEl.innerText = countdownZaehler;
        } else {
            clearInterval(countdownInterval);
            countdownEl.style.display = "none";
            contentEl.style.display = "flex";
            
            const aktuellerBuchstabe = alleBuchstaben[reelleRunde];
            document.querySelectorAll(".current-round-letter").forEach(el => {
                el.innerText = aktuellerBuchstabe;
            });
            
            StoppuhrUpdatenAnzeige();
            timerAktiv = setInterval(StoppuhrTicker, 1000);
        }
    }, 1000);
}

function StoppuhrTicker() {
    timerSecondsTotal--;
    StoppuhrUpdatenAnzeige();

    if(timerSecondsTotal <= 0){
        clearInterval(timerAktiv);
        wecker();
        zeigeRundenEndeStatus();
    }
}

function StoppuhrUpdatenAnzeige() {
    let mins = Math.trunc(timerSecondsTotal / 60);
    let secs = timerSecondsTotal % 60;
    let displayMins = mins < 10 ? "0" + mins : mins;
    let displaySecs = secs < 10 ? "0" + secs : secs;
    document.getElementById("p_Anzeige_Stoppuhr").innerText = displayMins + ":" + displaySecs;
    
    const circle = document.querySelector(".timer-circle-progress");
    const pct = Math.max(0, timerSecondsTotal / maxTimerSeconds);
    const offset = 534 - (pct * 534);
    circle.style.strokeDashoffset = offset;
}

function zeigeRundenEndeStatus() {
    const overlay = document.getElementById("overlay_aktive_runde");
    overlay.classList.add("overlay-alarm");
    
    const beendenBtn = document.getElementById("button_manuellStoppuhrBeenden");
    beendenBtn.innerText = "Overlay schließen";
    beendenBtn.style.backgroundColor = "var(--accent-primary)";
}

function beendeAktiveRunde() {
    clearInterval(timerAktiv);
    
    const overlay = document.getElementById("overlay_aktive_runde");
    overlay.classList.remove("overlay-alarm");
    overlay.style.display = "none";
    
    const beendenBtn = document.getElementById("button_manuellStoppuhrBeenden");
    beendenBtn.innerText = "Runde vorzeitig beenden";
    beendenBtn.style.backgroundColor = "";
    
    document.getElementById("seite_main").style.display = "flex";
    
    document.getElementById("span_Anzeige_reelleRunde").innerText = rundeZuZeigen + 1;
    buchstabenUpdaten();
    updateBeispiele();
}

function setupPresets() {
    const presets = document.querySelectorAll(".preset-btn");
    const inputZeit = document.getElementById("input_Stoppuhr_Zeit");

    presets.forEach(btn => {
        if (btn.dataset.time === "2" || btn.dataset.time === "2.0") {
            btn.classList.add("active");
            if (inputZeit) inputZeit.value = btn.dataset.time;
        }
    });

    presets.forEach(btn => {
        btn.addEventListener("click", (e) => {
            presets.forEach(p => p.classList.remove("active"));
            e.target.classList.add("active");
            if (inputZeit) inputZeit.value = e.target.dataset.time;
        });
    });

    if (inputZeit) {
        inputZeit.addEventListener("input", () => {
            presets.forEach(p => p.classList.remove("active"));
        });
    }
}

function wecker() {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 2);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
}

function setupDropdownToggle() {
    const btn = document.getElementById("btn_dropdown_toggle");
    const content = document.getElementById("dropdownContent");
    
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        content.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        content.classList.remove("show");
    });
}

function generateDropdown() {
    const dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.replaceChildren();
    const kategorien = ["Stadt", "Land", "Fluss", "Tier", "Pflanze", "Beruf"];

    kategorien.forEach(kategorie => {
        const spanTag = document.createElement("span");
        spanTag.textContent = kategorie;
        spanTag.addEventListener("click", (e) => {
            e.stopPropagation();
            aktuelleKategorie = kategorie;
            updateBeispiele();
            dropdownContent.classList.remove("show");
        });
        dropdownContent.appendChild(spanTag);
    });
}

function buildOrbit() {
    const container = document.getElementById('orbit-buchstaben-container');
    if(!container) return;
    container.replaceChildren();
    const temporaereBuchstaben = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

    temporaereBuchstaben.forEach((buchstabe, index) => {
        const btn = document.createElement('button');
        btn.textContent = buchstabe;
        btn.classList.add('fliegender-buchstabe');

        if (!alleBuchstaben.includes(buchstabe)) {
            btn.classList.add('abgewaehlt');
        }

        const winkel = ((index / 26) * 2 * Math.PI) - (Math.PI / 2);
        const radiusX = 35 + Math.random() * 5;
        const radiusY = 35 + Math.random() * 5;

        btn.style.left = `${50 + Math.cos(winkel) * radiusX}%`;
        btn.style.top = `${50 + Math.sin(winkel) * radiusY}%`;
        btn.style.transform = 'translate(-50%, -50%)';
        
        btn.animate([
            { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
            { transform: 'translate(-50%, -50%) translate(3px, -2px)' },
            { transform: 'translate(-50%, -50%) translate(-2px, 3px)' },
            { transform: 'translate(-50%, -50%) translate(0px, 0px)' }
        ], {
            duration: (4 + Math.random() * 3) * 1000,
            iterations: Infinity,
            direction: 'alternate',
            easing: 'ease-in-out'
        });

        btn.addEventListener('click', () => {
            btn.classList.toggle('abgewaehlt');
        });
        container.appendChild(btn);
    });
}

function holeAusgewählteBuchstaben(){
    return Array.from(document.querySelectorAll('.fliegender-buchstabe:not(.abgewaehlt)')).map(btn => btn.textContent);
}

function updateWievieleAusgewaehltAnzeige() {
    const len = alleBuchstaben.length;
    document.getElementById("p_wievieleBuchstabenAusgewählt").innerText = len === 1 ? "1 Buchstabe ausgewählt" : len + " Buchstaben ausgewählt";
}

// Event Listeners
document.getElementById("p_aktuelleRunde").addEventListener("click", starteAktiveRundeFlow);
document.getElementById("button_manuellStoppuhrBeenden").addEventListener("click", beendeAktiveRunde);

document.getElementById("p_Anzeige_buchstabe1").addEventListener("click", () => rad(false));
document.getElementById("p_Anzeige_buchstabe2").addEventListener("click", () => rad(false));
document.getElementById("p_Anzeige_buchstabe4").addEventListener("click", () => rad(true));
document.getElementById("p_Anzeige_buchstabe5").addEventListener("click", () => rad(true));

document.getElementById("button_neuesSpiel").addEventListener("click", () => {
    localStorage.setItem("hatSchonGespielt", "true");
    updateNeuesSpielButtonVisuals();
    
    document.getElementById("seite_main").style.display = "none";
    document.getElementById("seite_buchstaben_auswählen").style.display = "flex";
});

document.getElementById("btn_zur_seite_main").addEventListener("click", () => {
    const gewaehlt = holeAusgewählteBuchstaben();
    if(gewaehlt.length === 0){
        alert("Bitte wähle mindestens einen Buchstaben aus.");
        return;
    }
    alleBuchstaben = gewaehlt;
    shuffle(alleBuchstaben);
    localStorage.setItem("aktuellesSpiel", JSON.stringify(alleBuchstaben));
    
    reelleRunde = -1;
    rundeZuZeigen = 0;
    localStorage.setItem("reelleRundeSpeichern", JSON.stringify(reelleRunde));
    localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen));
    
    // Beispiele und Titel auch bei neuer Buchstabenauswahl komplett zurücksetzen
    aktuelleKategorie = null;
    updateBeispiele();
    
    document.getElementById("span_Anzeige_reelleRunde").innerText = "1";
    updateWievieleAusgewaehltAnzeige();
    updateNeuesSpielButtonVisuals();
    buchstabenUpdaten();
    
    document.getElementById("seite_buchstaben_auswählen").style.display = "none";
    document.getElementById("seite_main").style.display = "flex";
});

document.getElementById("btn_auswahl_zuruecksetzen").addEventListener("click", () => {
    document.querySelectorAll('.fliegender-buchstabe').forEach(btn => {
        btn.classList.remove('abgewaehlt');
    });
});