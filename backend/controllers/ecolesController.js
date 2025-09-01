const db = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Config Multer pour upload photo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads/ecoles";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 📍 GET école de l'utilisateur connecté
exports.getMyEcole = (req, res) => {
  const ecole_id = req.session.utilisateurs?.school_chif;
  if (!ecole_id) return res.status(400).json({ success: false, message: "Utilisateur sans école" });

  const query = "SELECT * FROM ecoles WHERE id = ?";
  db.query(query, [ecole_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erreur serveur" });
    res.json(results); // renvoie tableau pour React
  });
};

// 📍 GET écoles (pour React)
exports.getEcoles = (req, res) => {
  const ecole_id = req.query.ecole_id || req.session.utilisateurs?.school_chif;
  if (!ecole_id) return res.status(400).json({ success: false, message: "École introuvable" });

  const query = "SELECT * FROM ecoles WHERE id = ?";
  db.query(query, [ecole_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Erreur serveur" });
    res.json(results);
  });
};

// 📍 GET écoles pour Super_Admin
exports.getEcolesAll = (req, res) => {
  const query = "SELECT * FROM ecoles";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: "Erreur serveur" 
      });
    }
    res.json(results);
  });
};


// 📍 CREATE école
exports.createEcole = [
  upload.single("photoProfil"),
  (req, res) => {
    const ecole_id_user = req.session.utilisateurs?.school_chif;
    if (ecole_id_user) return res.status(403).json({ success: false, message: "Vous ne pouvez pas créer une école" });

    const { nom, addresse, telephone_1, telephone_2, ville_id } = req.body;
    const photoProfil = req.file ? req.file.filename : null;

    if (!nom) return res.status(400).json({ success: false, message: "Le nom est obligatoire" });

    const insertQuery = `
      INSERT INTO ecoles (nom, addresse, telephone_1, telephone_2, ville_id, photoProfil)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertQuery,
      [nom, addresse || null, telephone_1 || null, telephone_2 || null, ville_id || null, photoProfil],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur lors de la création" });
        res.json({ success: true, message: "École créée avec succès", ecole_id: result.insertId });
      }
    );
  },
];

// 📍 UPDATE école
exports.updateEcole = [
  upload.single("photoProfil"),
  (req, res) => {
    const { id } = req.params;
    const { nom, addresse, telephone_1, telephone_2, ville_id } = req.body;
    const photoProfil = req.file ? req.file.filename : null;

    if (!nom) return res.status(400).json({ success: false, message: "Le nom est obligatoire" });

    let updateQuery = "UPDATE ecoles SET nom = ?, addresse = ?, telephone_1 = ?, telephone_2 = ?, ville_id = ?";
    const params = [nom, addresse || null, telephone_1 || null, telephone_2 || null, ville_id || null];

    if (photoProfil) {
      updateQuery += ", photoProfil = ?";
      params.push(photoProfil);
    }
    updateQuery += " WHERE id = ?";
    params.push(id);

    db.query(updateQuery, params, (err) => {
      if (err) return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour" });
      res.json({ success: true, message: "École mise à jour" });
    });
  },
];

// 📍 DELETE école
exports.deleteEcole = (req, res) => {
  const { id } = req.params;
  const deleteQuery = "DELETE FROM ecoles WHERE id = ?";
  db.query(deleteQuery, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Erreur lors de la suppression" });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "École non trouvée" });
    res.json({ success: true, message: "École supprimée" });
  });
};

module.exports.upload = upload;
