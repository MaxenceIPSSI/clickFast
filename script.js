// Une fois que le HTML ressemble à ce que vous voulez : 
// 1. Faire une variable count, qui stockera le nombre de clics
// 2. Faire un eventListener sur le bouton

const DUREE_PARTIE_MS = 5000;

let elementScore;
let elementChrono;
let boutonClic;
let boutonRejouer;
let champPseudo;
let sectionClassement;
let listeClassement;
let messageEnvoi;

let score = 0;
let partieEnCours = false;
let partieTerminee = false;
let finDePartie = 0;
let intervalChrono = null;

function urlApi() {
  return `http://${window.location.hostname}:3000`;
}

function afficherChrono(msRestants) {
  elementChrono.textContent = `${(msRestants / 1000).toFixed(1)} s`;
}

function reinitialiser() {
  score = 0;
  partieEnCours = false;
  partieTerminee = false;
  clearInterval(intervalChrono);
  intervalChrono = null;
  elementScore.textContent = score;
  afficherChrono(DUREE_PARTIE_MS);
  boutonClic.disabled = false;
  boutonClic.hidden = false;
  boutonRejouer.hidden = true;
  sectionClassement.hidden = true;
  messageEnvoi.textContent = "";
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
  if (!partieEnCours) {
    return;
  }

  partieEnCours = false;
  partieTerminee = true;
  clearInterval(intervalChrono);
  intervalChrono = null;
  boutonClic.disabled = true;
  boutonClic.hidden = true;
  boutonRejouer.hidden = false;
  sectionClassement.hidden = false;
  elementChrono.textContent = `Terminé : ${score} clic${score > 1 ? "s" : ""} en 5 secondes`;

  enregistrerPuisAfficher();
}

async function enregistrerPuisAfficher() {
  await envoyerScore();
  await chargerClassement();
}

async function envoyerScore() {
  const username = champPseudo.value.trim();

  if (username.length === 0) {
    messageEnvoi.textContent = "Entre un pseudo avant de jouer pour apparaître au classement.";
    return;
  }

  try {
    const reponse = await fetch(`${urlApi()}/api/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, score }),
    });

    if (!reponse.ok) {
      const corps = await reponse.json().catch(() => ({}));
      messageEnvoi.textContent = `Score non enregistré : ${corps.error ?? `erreur ${reponse.status}`}`;
      return;
    }

    messageEnvoi.textContent = `Score enregistré pour ${username}.`;
  } catch {
    messageEnvoi.textContent = "Score non enregistré : l'API est injoignable.";
  }
}

async function chargerClassement() {
  try {
    const reponse = await fetch(`${urlApi()}/api/scores`);

    if (!reponse.ok) {
      throw new Error(`erreur ${reponse.status}`);
    }

    const scores = await reponse.json();
    listeClassement.replaceChildren();

    if (scores.length === 0) {
      const vide = document.createElement("li");
      vide.textContent = "Aucun score enregistré pour l'instant.";
      listeClassement.appendChild(vide);
      return;
    }

    for (const ligne of scores) {
      const element = document.createElement("li");
      element.textContent = `${ligne.username} — ${ligne.score}`;
      listeClassement.appendChild(element);
    }
  } catch {
    listeClassement.replaceChildren();
    const erreur = document.createElement("li");
    erreur.textContent = "Classement indisponible, l'API ne répond pas.";
    listeClassement.appendChild(erreur);
  }
}

function auClic() {
  if (partieTerminee) {
    return;
  }

  if (!partieEnCours) {
    demarrerPartie();
  }

  if (Date.now() >= finDePartie) {
    terminerPartie();
    return;
  }

  score++;
  elementScore.textContent = score;
}

function initialiserJeu() {
  elementScore = document.getElementById("score");
  elementChrono = document.getElementById("chrono");
  boutonClic = document.getElementById("button-clicker");
  boutonRejouer = document.getElementById("button-rejouer");
  champPseudo = document.getElementById("username");
  sectionClassement = document.getElementById("classement");
  listeClassement = document.getElementById("classement-liste");
  messageEnvoi = document.getElementById("message-envoi");

  boutonClic.addEventListener("click", auClic);
  boutonRejouer.addEventListener("click", reinitialiser);

  reinitialiser();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { initialiserJeu, DUREE_PARTIE_MS };
} else {
  initialiserJeu();
}
