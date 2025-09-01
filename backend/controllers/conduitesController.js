// controllers/conduitesController.js
const db = require("../config/db");

exports.getAllConduites = (req, res) => {
  const { ecole_id } = req.query; // filtre par école

  let sql = `
    SELECT s.*, a.nom, a.prenom, a.classroom_id 
    FROM conduites s
    JOIN apprenants a ON s.apprenant_id = a.id
  `;

  const params = [];

  if (ecole_id) {
    sql += " WHERE s.ecoles_id = ?";
    params.push(ecole_id);
  }

  sql += " ORDER BY s.creation DESC"; // ⚡ champ correct

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Erreur SQL getAllConduites:", err);
      return res.status(500).json({ message: "Erreur serveur", err });
    }
    res.json(results);
  });
};




// 🔸 conduites par classe
exports.getConduitesByClass = (req, res) => {
  const { classId } = req.params;
  const sql = `
    SELECT s.*, a.nom, a.prenom, a.classroom_id 
    FROM conduites s 
    JOIN apprenants a ON s.apprenant_id = a.id 
    WHERE a.classroom_id = ? 
    ORDER BY s.creation DESC
  `;
  db.query(sql, [classId], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json(results);
  });
};

// 🔸 conduites par apprenant
exports.getConduitesByApprenant = (req, res) => {
  const { apprenantId } = req.params;
  const sql = `
    SELECT s.*, a.nom, a.prenom, a.classroom_id 
    FROM conduites s 
    JOIN apprenants a ON s.apprenant_id = a.id 
    WHERE s.apprenant_id = ? 
    ORDER BY s.creation DESC
  `;
  db.query(sql, [apprenantId], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json(results);
  });
};

// 🔸 Ajouter une conduite
exports.createConduite = (req, res) => {
  const { apprenant_id, ecoles_id, note, observation, emetteur_id } = req.body;

  if (!apprenant_id || !note || !emetteur_id || !ecoles_id) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  const sql = `
    INSERT INTO conduites (apprenant_id, ecoles_id, note, observation, creation, emetteur_id)
    VALUES (?, ?, ?, ?, NOW(), ?)
  `;

  db.query(sql, [apprenant_id, ecoles_id, note, observation, emetteur_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur à l'insertion", err });
    res.status(201).json({ message: "conduite enregistrée avec succès." });
  });
};

// 🔸 Modifier une conduite
exports.updateConduite = (req, res) => {
  const { id } = req.params;
  const { apprenant_id, note, observation } = req.body;

  const sql = `
    UPDATE conduites 
    SET apprenant_id = ?, note = ?, observation = ? 
    WHERE id = ?
  `;
  db.query(sql, [apprenant_id, note, observation, id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour", err });
    res.json({ message: "conduite mise à jour avec succès." });
  });
};

// 🔸 Supprimer une conduite
exports.deleteConduite = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM conduites WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur suppression", err });
    res.json({ message: "conduite supprimée avec succès." });
  });
};
