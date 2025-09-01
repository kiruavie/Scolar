// backend/routes/apprenantsRoutes.js
const express = require("express");
const router = express.Router();
const apprenantsController = require("../controllers/apprenantsController");

// Créer un apprenant
router.post("/", apprenantsController.createApprenant);

// Récupérer tous les apprenants
router.get("/", apprenantsController.getAllApprenants);

// Récupérer les apprenants par classe
router.get("/classroom/:classroom_id", apprenantsController.getApprenantsByClass);


// Mettre à jour un apprenant
router.put("/:id", apprenantsController.updateApprenant);

// Supprimer un apprenant
router.delete("/:id", apprenantsController.deleteApprenant);

// Compter tous les apprenants
router.get("/count", apprenantsController.countApprenants);

// Compter tous les apprenants les plus sanctionnes
router.get("/top-sanctions", apprenantsController.getTopApprenantsSanctions);

router.get("/top", apprenantsController.getTopPresences);
module.exports = router;
