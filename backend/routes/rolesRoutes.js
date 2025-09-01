//-------- ecolesRoles -----//

// backend/routes/rolesRoutes.js
const express = require("express");
const router = express.Router();
const roleController = require("../controllers/rolesController");

// GET /api/roles
router.get("/", roleController.getRoles);

module.exports = router;

