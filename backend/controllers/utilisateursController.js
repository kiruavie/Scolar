const db = require("../config/db");
const bcrypt = require("bcrypt");

// GET utilisateurs filtrés par rôle et matière
exports.getUtilisateursFiltered = (req, res) => {
  const { ecole_id, role_id, matiere_id } = req.query;

  let query = `
    SELECT 
      u.id, u.nom_prenom, u.email, u.telephone, u.role_id, u.matiere_id,
      r.nom AS role_nom,
      m.nom AS matiere_nom
    FROM utilisateurs u
    LEFT JOIN roles_utilisateur r ON u.role_id = r.id
    LEFT JOIN matieres m ON u.matiere_id = m.id
    WHERE u.ecole_id = ?
  `;
  const params = [ecole_id];

  if (role_id) {
    query += " AND u.role_id = ?";
    params.push(role_id);
  }
  if (matiere_id) {
    query += " AND u.matiere_id = ?";
    params.push(matiere_id);
  }

  db.query(query, params, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Erreur serveur" });
    res.json(Array.isArray(results) ? results : []);
  });
};

// Update utilisateur
exports.updateUtilisateur = async (req, res) => {
  const { id } = req.params;
  const {
    nom_prenom,
    email,
    telephone,
    role_id,
    ecole_id,
    matiere_id,
    password_hash,
    is_active,
  } = req.body;

  try {
    db.query(
      "SELECT * FROM utilisateurs WHERE id = ?",
      [id],
      async (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Erreur serveur" });
        if (results.length === 0)
          return res
            .status(404)
            .json({ success: false, message: "Utilisateur non trouvé" });

        let hashedPassword = results[0].password_hash;
        if (password_hash && password_hash.trim() !== "") {
          hashedPassword = await bcrypt.hash(password_hash, 10);
        }

        const updateQuery = `
        UPDATE utilisateurs 
        SET nom_prenom=?, email=?, telephone=?, role_id=?, ecole_id=?, matiere_id=?, password_hash=?, is_active=?
        WHERE id=?
      `;
        db.query(
          updateQuery,
          [
            nom_prenom,
            email,
            telephone,
            role_id,
            ecole_id,
            matiere_id,
            hashedPassword,
            is_active ?? 1,
            id,
          ],
          (err2) => {
            if (err2)
              return res
                .status(500)
                .json({ success: false, message: "Erreur update" });
            res.json({ success: true, message: "Utilisateur mis à jour" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Delete utilisateur
exports.deleteUtilisateur = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM utilisateurs WHERE id = ?", [id], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Erreur suppression" });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    res.json({ success: true, message: "Utilisateur supprimé avec succès" });
  });
};

// Liste utilisateurs par école
exports.getUtilisateursByEcole = (req, res) => {
  const { ecole_id } = req.params;
  const query = `
    SELECT u.*, r.nom AS role_nom, e.nom AS ecole_nom
    FROM utilisateurs u
    LEFT JOIN roles_utilisateur r ON u.role_id = r.id
    LEFT JOIN ecoles e ON u.ecole_id = e.id
    WHERE u.ecole_id = ?
  `;
  db.query(query, [ecole_id], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Erreur serveur" });
    res.json(results);
  });
};

// Inscription utilisateur
exports.register = async (req, res) => {
  let {
    nom_prenom,
    email,
    telephone,
    role_id,
    ecole_id,
    matiere_id,
    password_hash,
    confirmation,
  } = req.body;

  nom_prenom = nom_prenom?.trim();
  email = email?.trim();
  telephone = telephone?.trim();
  password_hash = password_hash?.trim();
  confirmation = confirmation?.trim();

  if (
    !nom_prenom ||
    !email ||
    !telephone ||
    !role_id ||
    !ecole_id ||
    !password_hash ||
    !confirmation
  )
    return res
      .status(400)
      .json({ success: false, message: "Veuillez remplir tous les champs" });

  if (!/^0\d{9}$/.test(telephone))
    return res
      .status(400)
      .json({ success: false, message: "Téléphone invalide" });

  if (password_hash !== confirmation)
    return res
      .status(401)
      .json({
        success: false,
        message: "Les mots de passe ne correspondent pas",
      });

  try {
    db.query(
      "SELECT nom_prenom, email, telephone FROM utilisateurs WHERE nom_prenom=? OR email=? OR telephone=?",
      [nom_prenom, email, telephone],
      async (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Erreur doublons" });
        if (results.length > 0) {
          for (const row of results) {
            if (row.email === email)
              return res
                .status(409)
                .json({ success: false, message: "Email déjà utilisé" });
            if (row.telephone === telephone)
              return res
                .status(409)
                .json({ success: false, message: "Téléphone déjà utilisé" });
            if (row.nom_prenom === nom_prenom)
              return res
                .status(409)
                .json({ success: false, message: "Nom déjà utilisé" });
          }
        }

        const hashedPassword = await bcrypt.hash(password_hash, 10);
        const insertQuery = `INSERT INTO utilisateurs (nom_prenom, email, telephone, role_id, ecole_id, matiere_id, password_hash, isOnline)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)`;
        db.query(
          insertQuery,
          [
            nom_prenom,
            email,
            telephone,
            role_id,
            ecole_id,
            matiere_id || null,
            hashedPassword,
          ],
          (err2, result) => {
            if (err2)
              return res
                .status(500)
                .json({ success: false, message: "Erreur inscription" });
            res.json({ success: true, message: "Inscription réussie" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Connexion
exports.login = (req, res) => {
  const { email, password_hash } = req.body;
  if (!email || !password_hash)
    return res
      .status(400)
      .json({ success: false, message: "Champs manquants" });

  db.query(
    `
    SELECT u.id AS user_id, u.nom_prenom, u.telephone, u.email, u.role_id, u.password_hash, u.ecole_id AS user_ecole_id, u.matiere_id,
           e.nom AS nom_ecole, m.nom AS nom_matiere
    FROM utilisateurs u
    LEFT JOIN ecoles e ON u.ecole_id = e.id
    LEFT JOIN matieres m ON u.matiere_id = m.id
    WHERE u.email = ?
  `,
    [email],
    async (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Erreur serveur" });
      if (results.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "Email incorrect" });

      const user = results[0];
      const match = await bcrypt.compare(password_hash, user.password_hash);
      if (!match)
        return res
          .status(401)
          .json({ success: false, message: "Mot de passe incorrect" });

      db.query(
        "UPDATE utilisateurs SET isOnline=1 WHERE id=?",
        [user.user_id],
        (err2) => {
          if (err2)
            return res
              .status(500)
              .json({ success: false, message: "Erreur serveur" });

          req.session.utilisateurs = {
            id: user.user_id,
            nom_prenom: user.nom_prenom,
            telephone: user.telephone,
            identifiant: user.role_id,
            school_chif: user.user_ecole_id,
            school: user.nom_ecole,
            email: user.email,
            matiere: user.matiere_id,
            nom_matiere: user.nom_matiere,
          };
          req.session.isAuthenticated = true;

          res.json({
            success: true,
            message: "Connexion réussie",
            utilisateurs: req.session.utilisateurs,
          });
        }
      );
    }
  );
};

// Utilisateur actuel
exports.getCurrentUser = (req, res) => {
  if (req.session?.utilisateurs && req.session.isAuthenticated)
    return res.json({ success: true, utilisateurs: req.session.utilisateurs });
  return res
    .status(401)
    .json({ success: false, message: "Utilisateur non connecté" });
};


// Compteur les endeignants
exports.countUsersByRole = (req, res) => {
  const ecole_id = req.query.ecole_id; // récupéré depuis la query

  if (!ecole_id) {
    return res.status(400).json({ success: false, message: "ecole_id manquant" });
  }

  const sql = `SELECT COUNT(*) AS total 
               FROM utilisateurs 
               WHERE role_id = 2 AND ecole_id = ?`;

  db.query(sql, [ecole_id], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors du comptage des utilisateurs:", err);
      return res.status(500).json({ success: false, message: "Erreur serveur" });
    }

    res.status(200).json({ success: true, total: result[0].total });
  });
};
