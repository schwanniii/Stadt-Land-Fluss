var alleBuchstaben = Array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z");
var reelleRunde = 0;
var rundeZuZeigen = 0;
var ShowTimerMinutes;
var timerSecondsTotal;
var ShowTimerSeconds;
let timerAktiv;
let aktuelleKategorie;
import { daten } from "./daten.js";





window.onload = function(){ //gespeicherte werte übernehmen
    if(localStorage.getItem("aktuellesSpiel") != null){
        alleBuchstaben = JSON.parse(localStorage.getItem("aktuellesSpiel"));
    } else {
        alleBuchstaben = new Array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"); //zurücksetzen

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
        reelleRunde = 0;
    }
    


    buchstabenUpdaten();

    zeitAnzeigen();

    document.getElementById("span_Anzeige_reelleRunde").innerText = "(" + (reelleRunde + 1) + ")"; //runde updaten + anzeigen




    // console.log(JSON.parse(localStorage.getItem("aktuellesSpiel"))); //testen
    // console.log(JSON.parse(localStorage.getItem("rundeZuZeigenSpeichern"))); //testen
    // console.log("real: " + JSON.parse(localStorage.getItem("reelleRundeSpeichern"))); //testen
}






function changeBackgroundColor(color){
    document.body.style.background = color;
}

function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {

      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

function buchstabenUpdaten(){

    var ergebnisAnzeige = [document.getElementById("p_Anzeige_buchstabe1"), document.getElementById("p_Anzeige_buchstabe2"),
        document.getElementById("p_Anzeige_buchstabe3"), document.getElementById("p_Anzeige_buchstabe4"), document.getElementById("p_Anzeige_buchstabe5")]; //alle referenzen


    for (let i = -2; i <= 2; i++) { //buchstaben updaten
        let index = rundeZuZeigen + i;
        let feld = ergebnisAnzeige[i + 2]; //das jeweilige Feld

        feld.classList.remove("aktuelles_Feld");

        if (index < 0 || index >= alleBuchstaben.length) {
            feld.innerText = ""; // Verhindert Fehler, falls Index außerhalb des Arrays
        } else if (index > reelleRunde) {
            feld.innerText = "?"; // Falls noch nicht freigeschaltet
        } else {
            feld.innerText = alleBuchstaben[index]; // Normale Anzeige

            if(index === reelleRunde){ //klasse adden
                feld.classList.add("aktuelles_Feld");
            }
        }
    }
}

function updateBeispiele(){
    if(!aktuelleKategorie){
        return;
    }

    let kategorie = aktuelleKategorie;
    const container = document.getElementById("div_Beispiele");
    const beispieleArray = daten[alleBuchstaben[rundeZuZeigen].toLowerCase()][kategorie.toLowerCase()];

    container.replaceChildren();

    if (beispieleArray && beispieleArray.length > 0) {
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
    if(weiter === true && rundeZuZeigen < (alleBuchstaben.length - 1)){ //runden updaten
        if(rundeZuZeigen === reelleRunde){
            reelleRunde++;
            localStorage.setItem("reelleRundeSpeichern", JSON.stringify(reelleRunde)); //reelleRunde speichern
            rundeZuZeigen++;
            localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen)); //rundeZuZeigen speichern
        }else{
            rundeZuZeigen++;
            localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen)); //rundeZuZeigen speichern
        }
    } else if(weiter === false && rundeZuZeigen > 0){
        rundeZuZeigen--;
        localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen)); //rundeZuZeigen speichern
    }

    updateBeispiele();
 
    document.getElementById("div_Beispiele").replaceChildren(); //alle beispiele unten entfernen
    
    buchstabenUpdaten();



    // console.log("reelleRunde: " + reelleRunde);
    // console.log("rundeZuZeigen: " + rundeZuZeigen);

    // console.log("weiter: " + weiter);

    
    document.getElementById("span_Anzeige_reelleRunde").innerText = "(" + (reelleRunde + 1) + ")"; //runde updaten + anzeigen
}

function aktuelleRunde(){ //zur aktuellen Runde springen
    rundeZuZeigen = reelleRunde;
    localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen));

    buchstabenUpdaten();
}

function neuesSpielStarten(){
    document.getElementById("div_Beispiele").replaceChildren(); //alle beispiele unten entfernen

    reelleRunde = 0;
    localStorage.setItem("reelleRundeSpeichern", JSON.stringify(reelleRunde)); //reelleRunde speichern
    rundeZuZeigen = 0;
    localStorage.setItem("rundeZuZeigenSpeichern", JSON.stringify(rundeZuZeigen)); //rundeZuZeigen speichern

    document.getElementById("span_Anzeige_reelleRunde").innerText = "(1)"; //runde updaten zurücksetzen

    buchstabenUpdaten();
}





function StoppuhrAuslösen(){
    changeBackgroundColor("white");

    if(document.getElementById("input_Stoppuhr_Zeit").value > 0){
    ShowTimerMinutes = document.getElementById("input_Stoppuhr_Zeit").value; //timer Minuten insgesamt
    } else{
    ShowTimerMinutes = 2;
    }

    timerSecondsTotal = ShowTimerMinutes * 60; //timer Sekunden insgesamt

    timerSecondsTotal++ //für die erste sekunde anzeigen
    StoppuhrUpdaten();

    if(timerAktiv === undefined){
    timerAktiv = setInterval(StoppuhrUpdaten, 1000); //timer aktivieren (kann nur einmal ausgeführt werden)
    }
}

function StoppuhrUpdaten(){
    timerSecondsTotal--;
    ShowTimerMinutes = Math.trunc(timerSecondsTotal / 60);
    ShowTimerSeconds = timerSecondsTotal - (ShowTimerMinutes * 60); //showTimerMinutes und showTimerSeconds

    if(ShowTimerMinutes <= 0 && ShowTimerSeconds <= 0){ //wenn beides = 0, reset
        clearInterval(timerAktiv);
        timerAktiv = undefined;
        changeBackgroundColor("orange");
        wecker();
    }

    if(ShowTimerMinutes < 10){
        ShowTimerMinutes = "0" + ShowTimerMinutes; //2:0 -> 02:00
    }
    if(ShowTimerSeconds < 10){
        ShowTimerSeconds = "0" + ShowTimerSeconds;
    }

    document.getElementById("p_Anzeige_Stoppuhr").innerText = ShowTimerMinutes + " : " + ShowTimerSeconds; //zeit anzeigen

    //console.log(ShowTimerMinutes, ShowTimerSeconds, timerSecondsTotal, timerAktiv); //testen
}

function StoppuhrBeenden(){ //alles resetten
    clearInterval(timerAktiv);

    timerAktiv = undefined;

    changeBackgroundColor("white");

    zeitAnzeigen();
}

function zeitAnzeigen(){
    if(document.getElementById("input_Stoppuhr_Zeit").value > 0){
        ShowTimerMinutes = document.getElementById("input_Stoppuhr_Zeit").value; //timer Minuten insgesamt
        } else{
        ShowTimerMinutes = 2;
        }
    
    timerSecondsTotal = ShowTimerMinutes * 60; //timer Sekunden insgesamt

    ShowTimerMinutes = Math.trunc(timerSecondsTotal / 60);
    ShowTimerSeconds = timerSecondsTotal - (ShowTimerMinutes * 60); //showTimerMinutes und showTimerSeconds

    if(ShowTimerMinutes < 10){
        ShowTimerMinutes = "0" + ShowTimerMinutes; //2:0 -> 02:00
    }
    if(ShowTimerSeconds < 10){
        ShowTimerSeconds = "0" + ShowTimerSeconds;
    }
    
    document.getElementById("p_Anzeige_Stoppuhr").innerText = ShowTimerMinutes + " : " + ShowTimerSeconds; //zeit anzeigen
}

function wecker() {
    let context = new (window.AudioContext || window.webkitAudioContext)();
    
    function spieleTon(frequenz, dauer, lautstaerke, fadeDauer) {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = "sine"; // Sanfter Klang (Sinuswelle)
        oscillator.frequency.setValueAtTime(frequenz, context.currentTime); // Frequenz einstellen
        gainNode.gain.setValueAtTime(lautstaerke, context.currentTime); // Lautstärke einstellen

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(context.currentTime); // Ton starten
        oscillator.stop(context.currentTime + dauer); // Ton stoppen nach der Dauer

        // Fade-out Effekt: Lautstärke langsam reduzieren
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + fadeDauer); // Fade out über die gegebene Zeit
    }

    spieleTon(440, 3, 1, 2); 
}


const kategorien = ["Stadt", "Land", "Fluss", "Tier", "Pflanze", "Beruf"];

function generateDropdown() {
    const dropdownContent = document.getElementById("dropdownContent");

    kategorien.forEach(function(kategorie) {
        const spanTag = document.createElement("span");
        spanTag.textContent = kategorie;

        spanTag.addEventListener("click", function(){
            aktuelleKategorie = kategorie;

            updateBeispiele();
        });

        dropdownContent.appendChild(spanTag);

    });
} // dropdown menü erstellen ( kategorien zum auswählen )

generateDropdown();

// Buchstaben generieren für das Orbit
const container = document.getElementById('orbit-buchstaben-container');

alleBuchstaben = new Array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z");

alleBuchstaben.forEach((buchstabe, index) => {
    const btn = document.createElement('button');
    btn.textContent = buchstabe;
    btn.classList.add('fliegender-buchstabe');

    const winkel = ((index / 26) * 2 * Math.PI) - (Math.PI / 2);
    const radiusX = 40 + Math.random() * 5; // Nutzt max. 45% der Bildschirmbreite nach links/rechts
    const radiusY = 40 + Math.random() * 5; // Nutzt max. 45% der Bildschirmhöhe nach oben/unten

    // Position absolut krisensicher in Prozent berechnen
    const xProzent = 50 + Math.cos(winkel) * radiusX;
    const yProzent = 50 + Math.sin(winkel) * radiusY;

    btn.style.left = `${xProzent}%`;
    btn.style.top = `${yProzent}%`;
    btn.style.transform = 'translate(-50%, -50%)'; // Zentriert den Button perfekt auf seinem Punkt
    
    // Wir erstellen eine sanfte, individuelle Kreis-Bewegung via CSS-Variable oder direktem Keyframe-Ersatz
    btn.style.animation = 'none'; // Schaltet das alte CSS-Schwanken aus
    
    // Ein leichtes, organisches Zittern/Kreisen simulieren:
    const zufallZeit = 4 + Math.random() * 4; // 4 bis 8 Sekunden für eine sanfte Bewegung
    btn.animate([
        { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
        { transform: 'translate(-50%, -50%) translate(4px, -3px)' },
        { transform: 'translate(-50%, -50%) translate(2px, 4px)' },
        { transform: 'translate(-50%, -50%) translate(-4px, 2px)' },
        { transform: 'translate(-50%, -50%) translate(0px, 0px)' }
    ], {
        duration: zufallZeit * 1000,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
    });

    btn.addEventListener('click', () => {
        btn.classList.toggle('abgewaehlt');
    });

    container.appendChild(btn);
});


function holeAusgewählteBuchstaben(){
    return Array.from(document.querySelectorAll('.fliegender-buchstabe:not(.abgewaehlt)'))
                .map(btn => btn.textContent);
}


function seiteWechseln(zielSeite){
    const seiten = document.getElementsByClassName("unterseite");

    for(let i = 0; i < seiten.length; i++){
        seiten[i].style.display = "none"; //alle seiten verstecken
    }

    document.getElementById(zielSeite).style.display = "flex"; //zielseite anzeigen
}









document.getElementById("button_neuesSpiel").addEventListener("click", function(){
    let bestaetigung = confirm("neues Spiel starten und zur Buchstabenauswahl navigieren?");

    if(bestaetigung){
        seiteWechseln("seite_buchstaben_auswählen");
    }
});

document.getElementById("btn_zur_seite_main").addEventListener("click", function(){
    alleBuchstaben = holeAusgewählteBuchstaben();
    console.log(alleBuchstaben);
    if(alleBuchstaben.length === 0){
        alert("Bitte wähle mindestens einen Buchstaben aus.");
        return;
    } else if(alleBuchstaben.length === 1){
        document.getElementById("p_wievieleBuchstabenAusgewählt").innerText = "1 Buchstabe ausgewählt";
    } else if(alleBuchstaben.length > 1 && alleBuchstaben.length <= 26){
        document.getElementById("p_wievieleBuchstabenAusgewählt").innerText = alleBuchstaben.length + " Buchstaben ausgewählt";
    }
    shuffle(alleBuchstaben);
    localStorage.setItem("aktuellesSpiel", JSON.stringify(alleBuchstaben));

    seiteWechseln("seite_main");
    neuesSpielStarten();
});


document.getElementById("p_Anzeige_buchstabe1").addEventListener("click", () => rad(false));
document.getElementById("p_Anzeige_buchstabe2").addEventListener("click", () => rad(false));
document.getElementById("p_Anzeige_buchstabe4").addEventListener("click", () => rad(true));
document.getElementById("p_Anzeige_buchstabe5").addEventListener("click", () => rad(true));

document.getElementById("p_aktuelleRunde").addEventListener("click", aktuelleRunde);

document.getElementById("input_Stoppuhr_Zeit").addEventListener("input", function() { zeitAnzeigen(), StoppuhrBeenden(), updateBeispiele() });
document.getElementById("button_Stoppuhr_auslösen").addEventListener("click", StoppuhrAuslösen);
document.getElementById("button_manuellStoppuhrBeenden").addEventListener("click", StoppuhrBeenden);