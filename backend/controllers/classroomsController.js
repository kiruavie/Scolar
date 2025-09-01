const Classrooms = require("../models/Classrooms");

// ✅ Toutes les classes de l'école
exports.getClassrooms = (req, res) => {
  const ecole_id = req.user?.school_chif || req.query.ecole_id; // récupéré via auth ou query
  if (!ecole_id) return res.status(400).json({ message: "ecole_id requis" });

  Classrooms.getAllByEcole(ecole_id, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des classes:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
};

// ✅ Classes par niveau
exports.getClassroomsByNiveau = (req, res) => {
  const { niveau } = req.params;
  const ecole_id = req.user?.school_chif || req.query.ecole_id;

  if (!ecole_id) return res.status(400).json({ message: "ecole_id requis" });

  Classrooms.getByNiveau(ecole_id, niveau, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des classes par niveau:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
};


// Créer une classe
exports.createClassroom = (req, res) => {
  Classrooms.create(req.body, (err, result) => {
    if (err) {
      console.error("Erreur lors de la création de la classe:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ success: true, message: "Classe créée", id: result.insertId });
  });
};

// Mettre à jour une classe
exports.updateClassroom = (req, res) => {
  const { id } = req.params;
  Classrooms.update(id, req.body, (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de la classe:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    if (result.affectedRows === 0) return res.status(404).json({ message: "Classe non trouvée" });
    res.json({ success: true, message: "Classe mise à jour" });
  });
};


exports.deleteClassroom = (req, res) => {
  const { id } = req.params;
  Classrooms.delete(id, (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression de la classe:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Classe non trouvée" });
    res.json({ success: true, message: "Classe supprimée" });
  });
};


// Compter les classes de l'école de l'utilisateur connecté
exports.countClassrooms = (req, res) => {
  const ecole_id = req.query.ecole_id; // récupéré depuis la query
  if (!ecole_id) return res.status(400).json({ message: "ecole_id requis" });

  Classrooms.countByEcole(ecole_id, (err, result) => {
    if (err) {
      console.error("Erreur lors du comptage des classes:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ totalClass: result.total });
  });
};


