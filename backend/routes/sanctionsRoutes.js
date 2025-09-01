const express = require("express");
const router = express.Router();
const sanctionsController = require("../controllers/sanctionsController");

// Récupérer toutes les sanctions d'une école
router.get("/ecole/:ecoleId", sanctionsController.getAllSanctions);

// Sanctions par classe
router.get("/classroom/:classId", sanctionsController.getSanctionsByClass);

// Sanctions par élève
router.get("/apprenant/:apprenantId", sanctionsController.getSanctionsByApprenant);

// Ajouter
router.post("/", sanctionsController.createSanction);

// Modifier
router.put("/:id", sanctionsController.updateSanction);

// Supprimer
router.delete("/:id", sanctionsController.deleteSanction);

module.exports = router;
