const db = require("../config/db");

// Récupérer toutes les matières d'une école
const Matieres = {
  getAll: (ecole_id, callback) => {
    db.query("SELECT * FROM matieres WHERE ecole_id = ?", [ecole_id], callback);
  },

  // Récupérer une matière par ID
  getById: (id, callback) => {
    db.query("SELECT * FROM matieres WHERE id = ?", [id], callback);
  },

  // Ajouter une matière
  create: (matiere, callback) => {
    db.query("INSERT INTO matieres SET ?", matiere, callback);
  },

  // Mettre à jour une matière
  update: (id, matiere, callback) => {
    db.query("UPDATE matieres SET ? WHERE id = ?", [matiere, id], callback);
  },

  // Supprimer une matière
  delete: (id, callback) => {
    db.query("DELETE FROM matieres WHERE id = ?", [id], callback);
  },
};

module.exports = Matieres;
