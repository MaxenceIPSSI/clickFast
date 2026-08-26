const { initialiserJeu, DUREE_PARTIE_MS, API_NATIONALE } = require("./script.js");

const FAUX_DOM = `
  <input id="username" type="text" />
  <p id="chrono">5.0 s</p>
  <div id="zone-jeu">
    <button id="button-clicker" type="button">
      <span id="score">0</span>
      <span class="label">Clique !</span>
    </button>
    <section id="classement" hidden>
      <ol id="classement-liste"></ol>
      <ol id="classement-national"></ol>
      <p id="message-envoi"></p>
      <p id="message-national"></p>
    </section>
  </div>
  <button id="button-rejouer" type="button" hidden>Rejouer</button>
`;

const bouton = () => document.getElementById("button-clicker");
const scoreAffiche = () => document.getElementById("score").textContent;
const chronoAffiche = () => document.getElementById("chrono").textContent;

function cliquer(fois = 1) {
  for (let i = 0; i < fois; i++) {
    bouton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
}

describe("ClickFast, le compteur et son chrono", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
    document.body.innerHTML = FAUX_DOM;
    initialiserJeu();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("au chargement, le score est a zero et le chrono affiche la duree complete", () => {
    expect(scoreAffiche()).toBe("0");
    expect(chronoAffiche()).toBe("5.0 s");
    expect(bouton().disabled).toBe(false);
  });

  test("chaque clic incremente le score", () => {
    cliquer();
    expect(scoreAffiche()).toBe("1");

    cliquer(4);
    expect(scoreAffiche()).toBe("5");
  });

  test("le chrono decompte a partir du premier clic", () => {
    expect(chronoAffiche()).toBe("5.0 s");

    cliquer();
    jest.advanceTimersByTime(2000);
    expect(chronoAffiche()).toBe("3.0 s");

    jest.advanceTimersByTime(1500);
    expect(chronoAffiche()).toBe("1.5 s");
  });

  test("le score ne bouge plus une fois le chrono termine", () => {
    cliquer(3);
    expect(scoreAffiche()).toBe("3");

    jest.advanceTimersByTime(DUREE_PARTIE_MS);

    cliquer(10);
    expect(scoreAffiche()).toBe("3");
    expect(bouton().disabled).toBe(true);
  });

  test("la fin de partie affiche le score final et le bouton rejouer", () => {
    cliquer(7);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);

    expect(chronoAffiche()).toBe("Terminé : 7 clics en 5 secondes");
    expect(document.getElementById("button-rejouer").hidden).toBe(false);
    expect(document.getElementById("classement").hidden).toBe(false);
  });

  test("rejouer remet le score a zero et rend le bouton cliquable", () => {
    cliquer(4);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);
    expect(scoreAffiche()).toBe("4");

    document
      .getElementById("button-rejouer")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(scoreAffiche()).toBe("0");
    expect(chronoAffiche()).toBe("5.0 s");
    expect(bouton().disabled).toBe(false);

    cliquer(2);
    expect(scoreAffiche()).toBe("2");
  });

  test("un clic arrive apres le delai n'est jamais comptabilise", () => {
    cliquer();
    jest.setSystemTime(Date.now() + DUREE_PARTIE_MS + 1);

    cliquer();

    expect(scoreAffiche()).toBe("1");
  });
});

describe("ClickFast, l'envoi du score", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = FAUX_DOM;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("sans pseudo, aucun score n'est envoye a l'API", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
    initialiserJeu();

    cliquer(3);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);

    const envois = global.fetch.mock.calls.filter((appel) => appel[1]?.method === "POST");
    expect(envois).toHaveLength(0);
  });

  test("avec un pseudo, le score part en POST vers l'API", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
    initialiserJeu();
    document.getElementById("username").value = "Maxence";

    cliquer(6);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);

    const envoi = global.fetch.mock.calls.find((appel) => appel[1]?.method === "POST");
    expect(envoi).toBeDefined();
    expect(envoi[0]).toContain("/api/scores");
    expect(JSON.parse(envoi[1].body)).toEqual({ username: "Maxence", score: 6 });
  });
});

describe("ClickFast, le classement national partage", () => {
  const appelsVers = (url, methode) =>
    global.fetch.mock.calls.filter(
      (appel) => appel[0].startsWith(url) && (appel[1]?.method ?? "GET") === methode
    );

  function bouchonner(scoresNationaux) {
    global.fetch = jest.fn((url, options) => {
      if (url.startsWith(API_NATIONALE) && (options?.method ?? "GET") === "GET") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(scoresNationaux) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = FAUX_DOM;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("un premier score part sur le classement national", async () => {
    bouchonner([]);
    initialiserJeu();
    document.getElementById("username").value = "Maxence";

    cliquer(12);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);
    await jest.runAllTimersAsync();

    const envois = appelsVers(API_NATIONALE, "POST");
    expect(envois).toHaveLength(1);
    const corps = JSON.parse(envois[0][1].body);
    expect(corps.username).toBe("Maxence");
    expect(corps.score).toBe(12);
    expect(corps.avatar).toBeDefined();
    expect(corps.website_url).toBeDefined();
  });

  test("un meilleur score remplace l'ancien : suppression puis envoi", async () => {
    bouchonner([
      { id: "1", username: "Maxence", score: 8 },
      { id: "2", username: "Quelqu-un-d-autre", score: 99 },
    ]);
    initialiserJeu();
    document.getElementById("username").value = "Maxence";

    cliquer(20);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);
    await jest.runAllTimersAsync();

    const suppressions = appelsVers(API_NATIONALE, "DELETE");
    expect(suppressions).toHaveLength(1);
    expect(suppressions[0][0]).toBe(`${API_NATIONALE}/1`);
    expect(appelsVers(API_NATIONALE, "POST")).toHaveLength(1);
  });

  test("un score moins bon ne touche a rien", async () => {
    bouchonner([{ id: "1", username: "Maxence", score: 40 }]);
    initialiserJeu();
    document.getElementById("username").value = "Maxence";

    cliquer(3);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);
    await jest.runAllTimersAsync();

    expect(appelsVers(API_NATIONALE, "DELETE")).toHaveLength(0);
    expect(appelsVers(API_NATIONALE, "POST")).toHaveLength(0);
    expect(document.getElementById("message-national").textContent).toContain("40");
  });

  test("le classement national est trie et limite aux dix meilleurs", async () => {
    const beaucoup = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      username: `Joueur${i}`,
      score: i,
    }));
    bouchonner(beaucoup);
    initialiserJeu();

    cliquer(1);
    jest.advanceTimersByTime(DUREE_PARTIE_MS);
    await jest.runAllTimersAsync();

    const lignes = document.querySelectorAll("#classement-national li");
    expect(lignes).toHaveLength(10);
    expect(lignes[0].textContent).toContain("Joueur14 — 14");
  });
});
