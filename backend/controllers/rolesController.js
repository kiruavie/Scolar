//-------- rolesController -----//

// backend/controllers/rolesController.js
const Role = require("../models/Role");

exports.getRoles = (req, res) => {
  Role.getAll((err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des rôles:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results); // renvoie un tableau
  });
};

