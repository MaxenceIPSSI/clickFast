const express = require("express");
const cors = require("cors");

const { interroger } = require("./db");

const USERNAME_MAX = 30;
const SCORE_MAX = 1000;

const app = express();

app.use(cors());
app.use(express.json({ limit: "1kb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/scores", async (req, res, next) => {
  const { username, score } = req.body ?? {};

  if (typeof username !== "string" || username.trim().length === 0) {
    return res.status(400).json({ error: "username est obligatoire" });
  }
  if (username.trim().length > USERNAME_MAX) {
    return res
      .status(400)
      .json({ error: `username ne peut pas depasser ${USERNAME_MAX} caracteres` });
  }
  if (!Number.isInteger(score) || score < 0 || score > SCORE_MAX) {
    return res
      .status(400)
      .json({ error: `score doit etre un entier entre 0 et ${SCORE_MAX}` });
  }

  try {
    const { rows } = await interroger(
      "INSERT INTO scores (username, score) VALUES ($1, $2) RETURNING id, username, score, created_at",
      [username.trim(), score]
    );
    res.status(201).json(rows[0]);
  } catch (erreur) {
    next(erreur);
  }
});

app.get("/api/scores", async (req, res, next) => {
  try {
    const { rows } = await interroger(
      "SELECT username, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 10"
    );
    res.json(rows);
  } catch (erreur) {
    next(erreur);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "route inconnue" });
});

app.use((erreur, req, res, _next) => {
  if (erreur.type === "entity.parse.failed") {
    return res.status(400).json({ error: "corps de requete JSON invalide" });
  }
  if (erreur.type === "entity.too.large") {
    return res.status(400).json({ error: "corps de requete trop volumineux" });
  }

  console.error(`${req.method} ${req.originalUrl} -> ${erreur.code ?? ""} ${erreur.message}`);

  if (erreur.baseInjoignable) {
    return res
      .status(503)
      .json({ error: "la base de donnees est injoignable, reessayez dans un instant" });
  }

  res.status(500).json({ error: "erreur interne" });
});

module.exports = app;
