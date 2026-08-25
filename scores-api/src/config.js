const VARIABLES_REQUISES = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];

const manquantes = VARIABLES_REQUISES.filter((nom) => !process.env[nom]);

if (manquantes.length > 0) {
  console.error(
    `Demarrage impossible : variable(s) d'environnement manquante(s) -> ${manquantes.join(", ")}`
  );
  console.error("Copiez .env.example vers .env et renseignez ces cles.");
  process.exit(1);
}

const portBase = Number(process.env.DB_PORT);

if (!Number.isInteger(portBase) || portBase <= 0) {
  console.error(`Demarrage impossible : DB_PORT doit etre un entier, recu "${process.env.DB_PORT}"`);
  process.exit(1);
}

module.exports = {
  portApi: Number(process.env.PORT ?? 3000),
  base: {
    host: process.env.DB_HOST,
    port: portBase,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
