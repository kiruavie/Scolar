const express = require("express");
const router = express.Router();
const classroomsController = require("../controllers/classroomsController");



router.get("/count", classroomsController.countClassrooms);



// Toutes les classes
router.get("/", classroomsController.getClassrooms);

// Classes par niveau
router.get("/niveau/:niveau", classroomsController.getClassroomsByNiveau);

// Créer une classe
router.post("/", classroomsController.createClassroom);

// Mettre à jour une classe
router.put("/:id", classroomsController.updateClassroom);

// Supprimer une classe
router.delete("/:id", classroomsController.deleteClassroom);



module.exports = router;
