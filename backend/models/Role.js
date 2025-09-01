//-------- Role -----//

// backend/models/Role.js
const db = require("../config/db");

const Role = {
  getAll: (callback) => {
    db.query("SELECT id, nom FROM roles_utilisateur", callback);
  },
};

module.exports = Role;
