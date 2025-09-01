const express = require("express");
const router = express.Router();
const paiementsCtrl = require("../controllers/scolaritesController");

router.get("/", paiementsCtrl.getPaiements); // tous paiements (avec ecole_id en query)
router.get("/class/:classId", paiementsCtrl.getPaiements); // paiements par classe
router.get("/eleve/:apprenantId", paiementsCtrl.getPaiements); // paiements par élève
router.post("/", paiementsCtrl.createPaiement);
router.put("/:id", paiementsCtrl.updatePaiement);
router.delete("/:id", paiementsCtrl.deletePaiement);

module.exports = router;
