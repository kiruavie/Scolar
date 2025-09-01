const db = require("../config/db");

// Ajouter un apprenant
exports.createApprenant = (req, res) => {
  const { nom, prenom, sexe, classroom_id, matricule, telephone_parent } =
    req.body;

  const sql = `
    INSERT INTO apprenants 
    (nom, prenom, sexe, classroom_id, matricule, telephone_parent) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nom, prenom, sexe, classroom_id, matricule, telephone_parent],
    (err, result) => {
      if (err) {
        console.error("Erreur insertion:", err);
        return res
          .status(500)
          .json({ success: false, message: "Erreur serveur" });
      }

      res.status(201).json({
        success: true,
        message: "Elève ajouté avec succès",
        apprenantId: result.insertId,
      });
    }
  );
};

// Récupérer tous les apprenants
exports.getAllApprenants = (req, res) => {
  const ecoleId = req.user?.ecole_id || req.query.ecole_id;

  if (!ecoleId) {
    return res
      .status(400)
      .json({ success: false, message: "ecole_id manquant" });
  }

  const sql = `
    SELECT a.* 
    FROM apprenants a
    INNER JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.ecole_id = ?
    ORDER BY a.nom ASC
  `;

  db.query(sql, [ecoleId], (err, rows) => {
    if (err) {
      console.error("Erreur récupération apprenants:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erreur serveur" });
    }

    res.status(200).json(rows);
  });
};


// les apprenants les plus sanctionner

exports.getTopApprenantsSanctions = (req, res) => {
  const ecoleId = req.user?.ecole_id || req.query.ecole_id;

  if (!ecoleId) {
    return res
      .status(400)
      .json({ success: false, message: "ecole_id manquant" });
  }

  const sql = `
    SELECT 
      a.id, 
      a.nom, 
      a.prenom, 
      c.nom AS classe,       -- 🔹 on récupère le nom de la classe
      COUNT(s.id) AS total_sanctions
    FROM apprenants a
    INNER JOIN classrooms c ON a.classroom_id = c.id
    LEFT JOIN sanctions s ON s.apprenant_id = a.id
    WHERE c.ecole_id = ?
    GROUP BY a.id, a.nom, a.prenom, c.nom
    ORDER BY total_sanctions DESC
    LIMIT 5
  `;

  db.query(sql, [ecoleId], (err, rows) => {
    if (err) {
      console.error("Erreur récupération top apprenants:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erreur serveur" });
    }

    res.status(200).json(rows);
  });
};


// les apprenants les plus absent 
exports.getTopPresences = (req, res) => {
  const ecoleId = req.user?.ecole_id || req.query.ecole_id;

  if (!ecoleId) {
    return res.status(400).json({ success: false, message: "ecole_id manquant" });
  }

  const sql = `
    SELECT 
      a.id, a.nom, a.prenom, c.nom AS classe,
      SUM(CASE WHEN p.etat = 'Absent' THEN 1 ELSE 0 END) AS total_absences,
      SUM(CASE WHEN p.etat = 'Retard' THEN 1 ELSE 0 END) AS total_retards
    FROM apprenants a
    INNER JOIN classrooms c ON a.classroom_id = c.id
    LEFT JOIN presences p ON p.apprenant_id = a.id
    WHERE c.ecole_id = ?
    GROUP BY a.id, a.nom, a.prenom, c.nom
    ORDER BY total_absences DESC, total_retards DESC
    LIMIT 5
  `;

  db.query(sql, [ecoleId], (err, rows) => {
    if (err) {
      console.error("Erreur récupération top présences:", err);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
    res.json(rows);
  });
};


// Compter le nombre total d'apprenants

exports.countApprenants = (req, res) => {
  const ecole_id = req.query.ecole_id; // récupéré depuis la query

  if (!ecole_id) {
    return res
      .status(400)
      .json({ success: false, message: "ecole_id manquant" });
  }

  const sql = `SELECT COUNT(*) AS total FROM apprenants a
               INNER JOIN classrooms c ON a.classroom_id = c.id
               WHERE c.ecole_id = ?`;

  db.query(sql, [ecole_id], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors du comptage des apprenants:", err);
      return res
        .status(500)
        .json({ success: false, message: "Erreur serveur" });
    }

    res.status(200).json({ success: true, total: result[0].total });
  });
};

// ✅ Récupérer les apprenants par ID de classe
exports.getApprenantsByClass = (req, res) => {
  const { classroom_id } = req.params;
  const sql =
    "SELECT * FROM apprenants WHERE classroom_id = ? ORDER BY nom ASC";
  db.query(sql, [classroom_id], (err, results) => {
    if (err) {
      console.error("Erreur:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
};

// Mettre à jour un apprenant
exports.updateApprenant = (req, res) => {
  const { id } = req.params;
  const { nom, prenom, sexe, classroom_id, matricule, telephone_parent } =
    req.body;

  if (!nom || !prenom || !sexe || !classroom_id) {
    return res
      .status(400)
      .json({ success: false, message: "Champs manquants" });
  }

  const sql =
    "UPDATE apprenants SET nom = ?, prenom = ?, sexe = ?, classroom_id = ?, matricule = ?, telephone_parent = ? WHERE id = ?";
  db.query(
    sql,
    [nom, prenom, sexe, classroom_id, matricule, telephone_parent, id],
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });

      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Apprenant non trouvé" });
      }

      res.json({ success: true, message: "Apprenant mis à jour" });
    }
  );
};

// Supprimer un apprenant
exports.deleteApprenant = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM apprenants WHERE id = ?", [id], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Apprenant non trouvé" });
    }

    res.json({
      success: true,
      message: "Apprenant supprimé",
    });
  });
};
