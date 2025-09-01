import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Inscrip.css";

const Inscrip = () => {
  const [roles, setRoles] = useState([]);
  const [ecoles, setEcoles] = useState([]);

  const [user, setUser] = useState({
    nom_prenom: "",
    email: "",
    telephone: "",
    role_id: "",
    ecole_id: "",
    password_hash: "",
    confirmation: "",
  });

  const [message, setMessage] = useState("");
  const [messageL, setMessageL] = useState("");

  const navigate = useNavigate();

  // Charger les rôles et écoles au montage
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/roles`)
      .then(({ data }) => setRoles(data))
      .catch((err) => console.error(err));

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/ecoles/Super_Admin`)
      .then(({ data }) => setEcoles(data))
      .catch((err) => console.error(err));
  }, []);
  console.log(roles, ecoles)

  // Effacer les messages après 4 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (messageL) {
      const timer = setTimeout(() => setMessageL(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [messageL]);

  // Gestion des champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Soumission du formulaire
const handleRegisterSubmitLivreur = async (e) => {
  e.preventDefault();
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/utilisateurs/registerUser`,
      user,
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );

    // Récupérer les données de session directement après inscription
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/utilisateurs/me`,
      { withCredentials: true }
    );

    if (res.data.success) {
      // stocker éventuellement user dans le state global ou context
      navigate("/admin/Dashboard");
    } else {
      setMessageL("Erreur lors de la récupération de la session");
    }
  } catch (err) {
    setMessageL(err.response?.data?.message || "Erreur inconnue");
  }
};


  return (
    <div className="all">
      <div className="acc-header">
        <div className="logo">
          <Link to="/">
            <img src="/assets/logo/logo.png" alt="logo" />
          </Link>
        </div>

        <div className="insc-conn">
          <div className="lient_co">
                    <Link to="/connect">Connexion</Link>
                  </div>
        </div>
      </div>

      <div className="giga">
        <div className="giga-form">
          <div className="all-form djolo">
            <div className="lpm">
              <h1>Veuillez remplir tous les champs</h1>
              <form className="lploki" onSubmit={handleRegisterSubmitLivreur}>
                <div className="tgh">
                  {/* Nom et Téléphone */}
                  <div className="meute">
                    <div className="btn1">
                      <label htmlFor="livreur-nom">Nom Complet</label>
                      <i className="bi bi-person-fill"></i>
                      <input
                        type="text"
                        name="nom_prenom"
                        id="livreur-nom"
                        placeholder="Kouakou florence ylane sonia"
                        value={user.nom_prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="btn1">
                      <label htmlFor="livreur-telephone">Téléphone</label>
                      <i className="bi bi-telephone-fill"></i>
                      <input
                        type="tel"
                        name="telephone"
                        id="livreur-telephone"
                        placeholder="0102030405"
                        value={user.telephone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Rôle et École */}
                  <div className="meute">
                    <div className="btn1">
                      <label htmlFor="role">Je suis</label>
                      <select
                        name="role_id"
                        id="role"
                        value={user.role_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner un rôle --</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="btn1">
                      <label htmlFor="ecole">École</label>

                      <select
                        name="ecole_id"
                        id="ecole"
                        value={user.ecole_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner une école --</option>
                        {ecoles.map((ecole) => (
                          <option key={ecole.id} value={ecole.id}>
                            {ecole.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="seul">
                    <div className="btn14">
                      <label htmlFor="livreur-email">Email</label>
                      <i className="bi bi-envelope-fill"></i>
                      <input
                        type="email"
                        name="email"
                        id="livreur-email"
                        placeholder="abcde1234@gmail.com"
                        value={user.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="meute">
                    <div className="btn1">
                      <label htmlFor="livreur-password_hash">Mot de passe</label>
                      <i className="bi bi-lock-fill"></i>
                      <input
                        type="password"
                        name="password_hash"
                        id="livreur-password_hash"
                        value={user.password_hash}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="btn1">
                      <label htmlFor="livreur-confirmation">
                        Confirmer le mot de passe
                      </label>
                      <i className="bi bi-lock-fill"></i>
                      <input
                        type="password"
                        name="confirmation"
                        id="livreur-confirmation"
                        value={user.confirmation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Bouton et message */}
                  <div className="btn2">
                    <input type="submit" value="S'enregistrer" />
                  </div>
              
                  {messageL && <p className="Message3rrorIsert">{messageL}</p>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscrip;
