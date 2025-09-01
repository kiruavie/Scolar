const express = require("express");
const router = express.Router();
const ecolesController = require("../controllers/ecolesController");

// Routes écoles
router.get("/me", ecolesController.getMyEcole);  // Pour info utilisateur
router.get("/", ecolesController.getEcoles);    // Pour React (GET tableau)

router.get("/Super_Admin", ecolesController.getEcolesAll);    // Pour React (GET tableau)

router.post("/", ecolesController.createEcole);
router.put("/:id", ecolesController.updateEcole);
router.delete("/:id", ecolesController.deleteEcole);

module.exports = router;
