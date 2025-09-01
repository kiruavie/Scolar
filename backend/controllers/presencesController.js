const db = require("../config/db");

// 🔸 Obtenir toutes les présences (filtré par ecole_id)
exports.getPresences = (req, res) => {
  const { ecole_id } = req.query;
  const { classId, apprenantId } = req.params;

  if (!ecole_id) return res.status(400).json({ message: "ecole_id requis" });

  let sql = `
    SELECT p.*, a.nom, a.prenom, a.classroom_id
    FROM presences p
    JOIN apprenants a ON p.apprenant_id = a.id
    JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.ecole_id = ?
  `;
  const params = [ecole_id];

  if (classId) {
    sql += " AND a.classroom_id = ?";
    params.push(classId);
  }

  if (apprenantId) {
    sql += " AND p.apprenant_id = ?";
    params.push(apprenantId);
  }

  sql += " ORDER BY p.date_presence DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json(results);
  });
};

// 🔸 Ajouter une présence
exports.createPresence = (req, res) => {
  const { apprenant_id, date_presence, etat, matiere, justifie, noted_by, commentaire, ecole_id } = req.body;
  if (!apprenant_id || !date_presence || !matiere || !ecole_id) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  const sql = `
    INSERT INTO presences 
    (apprenant_id, date_presence, etat, matiere, justifie, noted_by, commentaire)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [apprenant_id, date_presence, etat || "present", matiere, justifie || 0, noted_by || null, commentaire || ""], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur à l'insertion", err });
    res.status(201).json({ message: "Présence enregistrée avec succès" });
  });
};

// 🔸 Modifier une présence
exports.updatePresence = (req, res) => {
  const { id } = req.params;
  const { etat, justifie, commentaire } = req.body;

  const sql = `
    UPDATE presences
    SET etat = ?, justifie = ?, commentaire = ?
    WHERE id = ?
  `; 
  db.query(sql, [etat, justifie, commentaire, id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour", err });
    res.json({ message: "Présence mise à jour avec succès" });
  });
};

// 🔸 Supprimer une présence
exports.deletePresence = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM presences WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur suppression", err });
    res.json({ message: "Présence supprimée avec succès" });
  });
};
