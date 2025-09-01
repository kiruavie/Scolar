const express = require("express");
const router = express.Router();
const notesCtrl = require("../controllers/notesController");

router.get("/", notesCtrl.getNotes);
router.get("/class/:classId", notesCtrl.getNotes);
router.get("/eleve/:apprenantId", notesCtrl.getNotes);

router.post("/", notesCtrl.createNote);
router.put("/:id", notesCtrl.updateNote);
router.delete("/:id", notesCtrl.deleteNote);

module.exports = router;
