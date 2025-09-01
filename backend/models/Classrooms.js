const db = require("../config/db");

const Classrooms = {};

// ✅ Récupérer toutes les classes d'une école
Classrooms.getAllByEcole = (ecole_id, callback) => {
  db.query("SELECT * FROM classrooms WHERE ecole_id = ?", [ecole_id], callback);
};

// ✅ Récupérer les classes d'une école par niveau
Classrooms.getByNiveau = (ecole_id, niveau, callback) => {
  db.query(
    "SELECT * FROM classrooms WHERE ecole_id = ? AND niveau = ?",
    [ecole_id, niveau],
    callback
  );
};

// ✅ Créer une classe
Classrooms.create = (data, callback) => {
  const { nom, niveau, capacity, ecole_id, enseignant_principal_id } = data;
  const query =
    "INSERT INTO classrooms (nom, niveau, capacity, ecole_id, enseignant_principal_id) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [nom, niveau, capacity, ecole_id, enseignant_principal_id], callback);
};

// ✅ Mettre à jour une classe
Classrooms.update = (id, data, callback) => {
  const { nom, niveau, capacity, ecole_id, enseignant_principal_id } = data;
  const query =
    "UPDATE classrooms SET nom = ?, niveau = ?, capacity = ?, ecole_id = ?, enseignant_principal_id = ? WHERE id = ?";
  db.query(query, [nom, niveau, capacity, ecole_id, enseignant_principal_id, id], callback);
};

// ✅ Supprimer une classe
Classrooms.delete = (id, callback) => {
  const query = "DELETE FROM classrooms WHERE id = ?";
  db.query(query, [id], callback);
};

  Classrooms.countByEcole = (ecole_id, callback) => {
    db.query(
      "SELECT COUNT(*) AS total FROM classrooms WHERE ecole_id = ?",
      [ecole_id],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]); // retourne { total: 12 }
      }
    );
};
module.exports = Classrooms;
