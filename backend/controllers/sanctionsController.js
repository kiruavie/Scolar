// controllers/sanctionsController.js
const db = require("../config/db");

// 🔸 Obtenir toutes les sanctions d’une école
exports.getAllSanctions = (req, res) => {
  const { ecoleId } = req.params; // récupéré depuis l'URL /api/sanctions/ecole/:ecoleId
  if (!ecoleId) return res.status(400).json({ message: "ecoleId requis" });

  const sql = `
    SELECT s.*, a.nom, a.prenom, a.classroom_id 
    FROM sanctions s
    JOIN apprenants a ON s.apprenant_id = a.id
    WHERE s.ecoles_id = ?
    ORDER BY s.date_sanction DESC
  `;

  db.query(sql, [ecoleId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des sanctions:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
};




// 🔸 Sanctions par classe
exports.getSanctionsByClass = (req, res) => {
  const { classId } = req.params;
  const sql = `
    SELECT s.*, a.nom, a.prenom, a.classroom_id 
    FROM sanctions s 
    JOIN apprenants a ON s.apprenant_id = a.id 
    WHERE a.classroom_id = ? 
    ORDER BY s.date_sanction DESC
  `;
  db.query(sql, [classId], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json(results);
  });
};

// 🔸 Sanctions par apprenant
exports.getSanctionsByApprenant = (req, res) => {
  const { apprenantId } = req.params;
  const sql = `
    SELECT s.*, a.nom, a.prenom, a.classroom_id 
    FROM sanctions s 
    JOIN apprenants a ON s.apprenant_id = a.id 
    WHERE s.apprenant_id = ? 
    ORDER BY s.date_sanction DESC
  `;
  db.query(sql, [apprenantId], (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json(results);
  });
};

// 🔸 Ajouter une sanction
exports.createSanction = (req, res) => {
  const { apprenant_id, ecoles_id, type, description, emetteur_id } = req.body;

  if (!apprenant_id || !type || !emetteur_id || !ecoles_id) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  const sql = `
    INSERT INTO sanctions (apprenant_id, ecoles_id, type, description, date_sanction, emetteur_id)
    VALUES (?, ?, ?, ?, NOW(), ?)
  `;

  db.query(sql, [apprenant_id, ecoles_id, type, description, emetteur_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur à l'insertion", err });
    res.status(201).json({ message: "Sanction enregistrée avec succès." });
  });
};

// 🔸 Modifier une sanction
exports.updateSanction = (req, res) => {
  const { id } = req.params;
  const { apprenant_id, type, description } = req.body;

  const sql = `
    UPDATE sanctions 
    SET apprenant_id = ?, type = ?, description = ? 
    WHERE id = ?
  `;
  db.query(sql, [apprenant_id, type, description, id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur lors de la mise à jour", err });
    res.json({ message: "Sanction mise à jour avec succès." });
  });
};

// 🔸 Supprimer une sanction
exports.deleteSanction = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM sanctions WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur suppression", err });
    res.json({ message: "Sanction supprimée avec succès." });
  });
};
