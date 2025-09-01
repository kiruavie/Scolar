const express = require("express");
const router = express.Router();
const conduitesController = require("../controllers/conduitesController");

// Toutes les conduites
router.get("/", conduitesController.getAllConduites);

// conduites par classe
router.get("/classroom/:classId", conduitesController.getConduitesByClass);

// conduites par élève
router.get("/apprenant/:apprenantId", conduitesController.getConduitesByApprenant);

// Ajouter
router.post("/", conduitesController.createConduite);

// Modifier
router.put("/:id", conduitesController.updateConduite);

// Supprimer
router.delete("/:id", conduitesController.deleteConduite);

module.exports = router;
