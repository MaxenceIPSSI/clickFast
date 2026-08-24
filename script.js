// ClickFast : on compte les clics, mais seulement pendant les 5 secondes
// de la partie. Le chrono démarre au tout premier clic.

const DUREE_PARTIE_MS = 5000;

const elementScore = document.getElementById("score");
const elementChrono = document.getElementById("chrono");
const boutonClic = document.getElementById("button-clicker");
const boutonRejouer = document.getElementById("button-rejouer");

let score = 0;
let partieEnCours = false;
let finDePartie = 0;
let intervalChrono = null;

function afficherChrono(msRestants) {
  elementChrono.textContent = `${(msRestants / 1000).toFixed(1)} s`;
}

// État "prête à jouer" : score à zéro, chrono affiché mais pas encore lancé.
function reinitialiser() {
  score = 0;
  partieEnCours = false;
  elementScore.textContent = score;
  afficherChrono(DUREE_PARTIE_MS);
  boutonClic.disabled = false;
  boutonRejouer.hidden = true;
}

function demarrerPartie() {
  partieEnCours = true;
  finDePartie = Date.now() + DUREE_PARTIE_MS;
  intervalChrono = setInterval(mettreAJourChrono, 100);
}

function mettreAJourChrono() {
  const msRestants = Math.max(0, finDePartie - Date.now());
  afficherChrono(msRestants);
  if (msRestants === 0) {
    terminerPartie();
  }
}

function terminerPartie() {
  partieEnCours = false;
  clearInterval(intervalChrono);
  intervalChrono = null;
  // Le bouton est désactivé : passé le délai, plus aucun clic ne compte.
  boutonClic.disabled = true;
  boutonRejouer.hidden = false;
  elementChrono.textContent = `Terminé : ${score} clic${score > 1 ? "s" : ""} en 5 secondes`;
}

boutonClic.addEventListener("click", () => {
  // Le chrono ne tourne pas encore : ce clic-ci lance la partie, et compte.
  if (!partieEnCours) {
    demarrerPartie();
  }

  // Le chrono ne se réveille que toutes les 100 ms : on revérifie l'heure
  // ici pour qu'un clic arrivé après la fin ne soit jamais comptabilisé.
  if (Date.now() >= finDePartie) {
    terminerPartie();
    return;
  }

  score++;
  elementScore.textContent = score;
});

boutonRejouer.addEventListener("click", reinitialiser);

reinitialiser();
