const express = require("express");
const router = express.Router();
const matieresController = require("../controllers/matieresController");

// Toutes les routes
router.get("/", matieresController.getMatieres);
router.get("/:id", matieresController.getMatiereById);
router.post("/", matieresController.createMatiere);
router.put("/:id", matieresController.updateMatiere);
router.delete("/:id", matieresController.deleteMatiere);

module.exports = router;
