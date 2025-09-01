const Matieres = require("../models/Matieres");

// ✅ Lire toutes les matières de l'école
exports.getMatieres = (req, res) => {
  const { ecole_id } = req.query; // on passe ecole_id en query ou body

  if (!ecole_id) {
    return res.status(400).json({ message: "ecole_id est requis" });
  }

  Matieres.getAll(ecole_id, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json(results);
  });
};

// ✅ Lire une matière
exports.getMatiereById = (req, res) => {
  const { id } = req.params;

  Matieres.getById(id, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (results.length === 0) return res.status(404).json({ message: "Matière non trouvée" });
    res.json(results[0]);
  });
};

// ✅ Créer une matière
exports.createMatiere = (req, res) => {
  const { nom, coefficient, ecole_id } = req.body;

  if (!nom || !coefficient || !ecole_id) {
    return res.status(400).json({ message: "Nom, coefficient et ecole_id requis" });
  }

  const newMatiere = {
    nom,
    coefficient,
    ecole_id,
    creation: new Date(),
  };

  Matieres.create(newMatiere, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    res.json({ message: "Matière ajoutée", id: result.insertId });
  });
};

// ✅ Modifier une matière
exports.updateMatiere = (req, res) => {
  const { id } = req.params;
  const { nom, coefficient, ecole_id } = req.body;

  if (!nom || !coefficient || !ecole_id) {
    return res.status(400).json({ message: "Nom, coefficient et ecole_id requis" });
  }

  const updated = { nom, coefficient, ecole_id };

  Matieres.update(id, updated, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Matière non trouvée" });
    res.json({ message: "Matière mise à jour" });
  });
};

// ✅ Supprimer une matière
exports.deleteMatiere = (req, res) => {
  const { id } = req.params;

  Matieres.delete(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Matière non trouvée" });
    res.json({ message: "Matière supprimée" });
  });
};
