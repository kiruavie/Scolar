const db = require("../config/db");

const Classrooms = {};

// ✅ Récupérer toutes les classes d'une école
Classrooms.getAllByEcole = (ecole_id, callback) => {
  db.query("SELECT * FROM sanctions WHERE ecole_id = ?", [ecole_id], callback);
};