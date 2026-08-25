const app = require("./app");
const config = require("./config");
const { initialiserSchema } = require("./db");

const PORT = config.portApi;
const DELAI_RETENTATIVE_MS = 2000;

app.listen(PORT, () => {
  console.log(`scores-api en ecoute sur le port ${PORT}`);
});

async function preparerBase() {
  for (let tentative = 1; ; tentative++) {
    try {
      await initialiserSchema();
      console.log("schema pret");
      return;
    } catch (erreur) {
      console.error(`schema indisponible (tentative ${tentative}) : ${erreur.message}`);
      await new Promise((resoudre) => setTimeout(resoudre, DELAI_RETENTATIVE_MS));
    }
  }
}

preparerBase();
