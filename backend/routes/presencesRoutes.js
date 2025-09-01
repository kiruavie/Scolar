const express = require("express");
const router = express.Router();
const presencesCtrl = require("../controllers/presencesController");

router.get("/", presencesCtrl.getPresences); // toutes les présences (filtré par ecole_id)
router.get("/class/:classId", presencesCtrl.getPresences); // par classe
router.get("/eleve/:apprenantId", presencesCtrl.getPresences); // par élève

router.post("/", presencesCtrl.createPresence);
router.put("/:id", presencesCtrl.updatePresence);
router.delete("/:id", presencesCtrl.deletePresence);

module.exports = router;
