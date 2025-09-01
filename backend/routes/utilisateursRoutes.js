const express = require('express');
const router = express.Router();
const db = require('../config/db');
const controller = require('../controllers/utilisateursController');

 


// Auth

router.post('/loginUser', controller.login);

router.post('/registerUser', controller.register);

router.get("/me", controller.getCurrentUser);



router.put("/:id", controller.updateUtilisateur);
router.delete("/:id", controller.deleteUtilisateur);

// Filtrer par école
router.get("/ecole/:ecole_id", controller.getUtilisateursByEcole);


// Route pour récupérer les utilisateurs filtrés
router.get(
  "/filtered", // si tu veux protéger la route
  controller.getUtilisateursFiltered
);



// Compter les utilisateurs role_id = 2 par ecole
router.get("/count-role2", controller.countUsersByRole);



// router.post('/registerUser', upload.single('pp'), controller.register);
router.get('/logout', (req, res) => {
    console.log("🧪 Route /logout appelée");
  const user = req.session?.utilisateurs?.id;

  if (!user) return res.redirect('/');

  db.query('UPDATE utilisateurs SET isOnline = 0 WHERE id = ?', [user], (err) => {
    if (err) {
      console.error('Erreur mise à jour isOnline utilisateur :', err);
      return res.redirect('/admin/pages/Dashboard');
    }
    // 🔐 On détruit uniquement la session livreur
    delete req.session.utilisateurs;
    delete req.session.isAuthenticated;
    
req.session.destroy((err) => {
  if (err) {
    console.error('Erreur de session :', err);
    return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }

  res.clearCookie('connect.sid', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax'
  });

  return res.json({ message: 'Déconnecté avec succès' });
});

  });
});

module.exports = router;