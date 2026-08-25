const { Pool } = require("pg");

const CODES_BASE_INJOIGNABLE = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "57P01",
  "57P03",
  "08003",
  "08006",
  "42P01",
]);

const pool = new Pool({
  host: "clickfast-db",
  port: 5432,
  user: "clickfast_user",
  password: "clickfast_pass",
  database: "clickfast_db",
  connectionTimeoutMillis: 3000,
});

pool.on("error", (erreur) => {
  console.error("erreur du pool postgres :", erreur.message);
});

async function interroger(texte, parametres) {
  try {
    return await pool.query(texte, parametres);
  } catch (erreur) {
    erreur.baseInjoignable =
      erreur.code === undefined || CODES_BASE_INJOIGNABLE.has(erreur.code);
    throw erreur;
  }
}

async function initialiserSchema() {
  await interroger(`
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      username VARCHAR(30) NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { interroger, initialiserSchema };
