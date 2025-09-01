const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");

const classroomsRoutes = require("./routes/classroomsRoutes");
const ecolesRoutes = require("./routes/ecolesRoutes");
const rolesRoutes = require("./routes/rolesRoutes");
const utilisateurRoutes = require("./routes/utilisateursRoutes");
const apprenantsRoutes = require("./routes/apprenantsRoutes");
const sanctionsRoutes = require("./routes/sanctionsRoutes");
const conduitesRoutes = require("./routes/conduitesRoutes");
const matieresRoutes = require("./routes/matieresRoutes");
const scolaritesRoutes = require("./routes/scolaritesRoutes");
const presencesRoutes = require("./routes/presencesRoutes");
const notesRoutes = require("./routes/notesRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  session({
    secret: "475mmmpmkk",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(bodyParser.json());
app.use("/uploads", express.static("public/uploads"));

// Import des routes
app.use("/api/roles", rolesRoutes);
app.use("/api/ecoles", ecolesRoutes);
app.use("/api/apprenants", apprenantsRoutes);
app.use("/api/classrooms", classroomsRoutes);
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/utilisadestroy", utilisateurRoutes);
app.use("/api/sanctions", sanctionsRoutes);
app.use("/api/conduites", conduitesRoutes);
app.use("/api/matieres", matieresRoutes);
app.use("/api/scolarites", scolaritesRoutes);
app.use("/api/presences", presencesRoutes);
app.use("/api/notes", notesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur vitrine_ecole lancé sur ${PORT}`);
});
