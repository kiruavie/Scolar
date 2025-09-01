const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "vitrine_ecole"
});

db.connect((err) => {
  if (err) {
    console.error("Erreur connexion DB:", err);
    return;
  }
  console.log("✅ Connecté à MySQL vitrine_ecole");
});

module.exports = db;
