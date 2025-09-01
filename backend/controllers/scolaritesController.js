const db = require("../config/db");

// 🔸 Obtenir tous les scolarites filtrés par classe ou élève
exports.getPaiements = (req, res) => {
  const { classId, apprenantId } = req.params;
  const { ecole_id } = req.query; // récupéré depuis le frontend

  if (!ecole_id) return res.status(400).json({ message: "ecole_id requis" });

  let sql = `
    SELECT p.*, a.nom, a.prenom, a.classroom_id
    FROM scolarites p
    JOIN apprenants a ON p.apprenant_id = a.id
    JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.ecole_id = ?
  `;
  const params = [ecole_id];

  if (classId) {
    sql += ` AND a.classroom_id = ?`;
    params.push(classId);
  }

  if (apprenantId) {
    sql += ` AND a.id = ?`;
    params.push(apprenantId);
  }

  sql += ` ORDER BY p.created_at DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Erreur serveur", err });
    res.json(results);
  });
};

// 🔸 Ajouter un paiement
exports.createPaiement = (req, res) => {
  const { apprenant_id, montant, Reste, Scolarite, annee_scolaire, created_by } = req.body;

  if (!apprenant_id || !montant || !Scolarite) {
    return res.status(400).json({ message: "Champs requis manquants." });
  }

  const sql = `
    INSERT INTO scolarites 
    (apprenant_id, montant, Reste, Scolarite, annee_scolaire, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [apprenant_id, montant, Reste, Scolarite, annee_scolaire, created_by || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur insertion", err });
      res.status(201).json({ message: "Paiement enregistré avec succès." });
    }
  );
};

// 🔸 Modifier un paiement
exports.updatePaiement = (req, res) => {
  const { id } = req.params;
  const { montant, Reste, Scolarite, annee_scolaire } = req.body;

  const sql = `
    UPDATE scolarites 
    SET montant = ?, Reste = ?, Scolarite = ?, annee_scolaire = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(sql, [montant, Reste, Scolarite, annee_scolaire, id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur mise à jour", err });
    res.json({ message: "Paiement mis à jour avec succès." });
  });
};

// 🔸 Supprimer un paiement
exports.deletePaiement = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM scolarites WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Erreur suppression", err });
    res.json({ message: "Paiement supprimé avec succès." });
  });
};
