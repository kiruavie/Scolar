//-------- Ecole -----//

const db = require("../config/db");

// Récupérer toutes les écoles
const Ecole = {
  getAll: (callback) => {
    db.query("SELECT id, nom FROM ecoles", callback);
  },
};

module.exports = Ecole;
