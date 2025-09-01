const db = require("../config/db");

// 🔸 Obtenir toutes les notes (filtré par ecole_id)
exports.getNotes = (req, res) => {
  const { ecole_id } = req.query;
  const { classId, apprenantId } = req.params;

  if (!ecole_id) return res.status(400).json({ message: "ecole_id requis" });

  let sql = `
    SELECT n.*, a.nom, a.prenom, a.classroom_id
    FROM notes n
    JOIN apprenants a ON n.apprenant_id = a.id
    JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.ecole_id = ?
  `;
  const params = [ecole_id];

  if (classId) {
    sql += " AND a.classroom_id = ?";
    params.push(classId);
  }

  if (apprenantId) {
    sql += " AND n.apprenant_id = ?";
    params.push(apprenantId);
  }

  sql += " ORDER BY n.date_note DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json(results);
  });
};

// 🔸 Ajouter une notes
exports.createNote = (req, res) => {
  const { apprenant_id, matiere, valeur, coefficient, date_note, enseignant_id, commentaire } = req.body;
  if (!apprenant_id || !matiere || valeur == null) {
    return res.status(400).json({ message: "Champs requis manquants777" });
  }

  const sql = `
    INSERT INTO notes
    (apprenant_id, matiere, valeur, coefficient, date_note, enseignant_id, commentaire)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    apprenant_id, matiere, valeur, coefficient || 1, date_note || null, enseignant_id || null, commentaire || ""
  ], (err) => {
    if (err) return res.status(500).json({ message: "Erreur à l'insertion", err });
    res.status(201).json({ message: "Notes ajoutée avec succès" });
  });
};

// 🔸 Modifier une notes
exports.updateNote = (req, res) => {
  const { id } = req.params;
  const { matiere, valeur, coefficient, date_note, commentaire } = req.body;

  const sql = `
    UPDATE notes
    SET matiere = ?, valeur = ?, coefficient = ?, date_note = ?, commentaire = ?
    WHERE id = ?
  `;
  db.query(sql, [matiere, valeur, coefficient || 1, date_note || null, commentaire || "", id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour", err });
    res.json({ message: "Notes mise à jour avec succès" });
  });
};

// 🔸 Supprimer une notes
exports.deleteNote = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM notes WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur suppression", err });
    res.json({ message: "Notes supprimée avec succès" });
  });
};
