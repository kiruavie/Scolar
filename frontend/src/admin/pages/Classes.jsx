import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Lheader/Header";
// import HeaderEdu from "../Lheader/HeaderEdu";
// import HeaderEns from "../Lheader/HeaderEns";
import HeaderSec from "../Lheader/HeaderSec";

import "../styles/barre.css";
import "../styles/classes.css";

const ClassroomsPage = () => {
  const [classes, setClasses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nom: "",
    niveau: "",
    capacity: "",
    ecole_id: "",
    // enseignant_principal_id: "",
  });

  const navigate = useNavigate();

  // Effacer les messages automatiquement
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Charger utilisateur courant
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/utilisateurs/me`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setUser(res.data.utilisateurs);

        // ✅ Mets à jour le formData avec l'ecole_id de l'utilisateur
        setFormData((prev) => ({
          ...prev,
          ecole_id: res.data.utilisateurs.school_chif, 
        }));
      } else {
        navigate("/connect");
      }
    } catch (err) {
      console.error(err);
      navigate("/connect");
    } finally {
      setLoading(false);
    }
  };
  fetchUser();
}, [navigate]);




// Charger toutes les classes de l'école de l'utilisateur
useEffect(() => {
  if (!user) return; // attendre que user soit chargé

  axios
    .get(`${import.meta.env.VITE_API_URL}/api/classrooms`, {
      params: { ecole_id: user.school_chif }, // filtre par ecole_id
      withCredentials: true,
    })
    .then(({ data }) => setClasses(Array.isArray(data) ? data : []))
    .catch((err) => console.error("Erreur classes :", err));
}, [user]); // dépendance sur user



  // Charger toutes les classes par niveau

const fetchClasses = async (niveau = "") => {
  if (!user) return; 
  try {
    let url = `${import.meta.env.VITE_API_URL}/api/classrooms`;
    if (niveau) url += `/niveau/${niveau}`;

    const res = await axios.get(url, {
      params: { ecole_id: user.school_chif }, // ✅ envoie ecole_id
      withCredentials: true,
    });

    setClasses(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Erreur lors du chargement des classes :", err);
    setClasses([]);
  }
};


  useEffect(() => {
    fetchClasses(selectedNiveau);
  }, [selectedNiveau]);

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // ✅ Toujours forcer l'ecole_id depuis le user connecté
    const dataToSend = { ...formData, ecole_id: user.school_chif };

    let res;
    if (isEditing && editId) {
      res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/classrooms/${editId}`,
        dataToSend
      );
      setIsEditing(false);
      setEditId(null);
    } else {
      res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/classrooms`,
        dataToSend
      );
    }
    setMessage(res.data.message || "Action réussie");
    fetchClasses(selectedNiveau);

    // Réinitialiser le formulaire avec l’ecole_id fixé
    setFormData({
      nom: "",
      niveau: "",
      capacity: "",
      ecole_id: user.school_chif,
    });
  } catch (err) {
    console.error(err);
    setMessage(err.response?.data?.message || "Erreur serveur");
  }
};

  const handleEdit = (classe) => {
    setFormData({
      nom: classe.nom || "",
      niveau: classe.niveau || "",
      capacity: classe.capacity || "",
      ecole_id: user.school_chif || "",
      // enseignant_principal_id: classe.enseignant_principal_id || "",
    });
    setIsEditing(true);
    setEditId(classe.id);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };


  // Reset formulaire
  const handleCancel = () => {
    setFormData({
      nom: "",
      niveau: "",
      capacity:  "",
      ecole_id: user.school_chif,
    });
    setIsEditing(false);
    setEditId(null);
    setSelectedNiveau(""); // reset élève sélectionné
  };



  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/classrooms/${deleteId}`
      );
      fetchClasses(selectedNiveau);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return null;

  const Sharingan = Number(user?.identifiant);

  return (
    <>


       {Sharingan === 3 && (
        <>
          <div className="mes-barre">
            <HeaderSec user={user} />
          </div>
          <div className="main-content-classes">
            <div className="selection-classes">
              <div className="form-group">
                <label>Niveau</label>
                <select
                  value={selectedNiveau}
                  onChange={(e) => setSelectedNiveau(e.target.value)}
                >
                  <option value="">-- Tous les niveaux --</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Secondaire">Secondaire</option>
                  <option value="Lycée">Lycée</option>
                </select>
              </div>
            </div>

            <div className="all-classes">
              <div className="gauche">
                <h2>{isEditing ? "Modifier une classe" : "Ajouter une classe"}</h2>
                <form onSubmit={handleSubmit} className="form-container">

                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Niveau</label>
                    <select
                      name="niveau"
                      value={formData.niveau}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="Primaire">Primaire</option>
                      <option value="Secondaire">Secondaire</option>
                      <option value="Lycée">Lycée</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Capacité</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      
                    />
                  </div>


                  {/* <div className="form-group">
                    <label>ID Enseignant Principal  </label>
                    <input
                      type="number"
                      name="enseignant_principal_id"
                      value={formData.enseignant_principal_id}
                      onChange={handleChange}
                    />
                  </div> */}

                  <button type="submit" className="btn btn-primary">
                    {isEditing ? "Mettre à jour" : "Enregistrer"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn btn-secondary ml-2"
                      onClick={handleCancel}
                    >
                      Annuler
                    </button>
                  )}
                  {message && <p className="Message3rror">{message}</p>}
                </form>
              </div>

              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette classe ?</p>
                      <button
                        onClick={confirmDelete}
                        className="btn btn-danger"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="btn btn-secondary"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                <div className="liste">
                  <table className="table table-striped mt-4">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Niveau</th>
                        {/* <th>ID Enseignant</th> */}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(classes) && classes.length > 0 ? (
                        classes.map((c) => (
                          <tr key={c.id}>
                            <td>{c.nom}</td>
                            <td>{c.niveau}</td>
                            {/* <td>{c.enseignant_principal_id || "—"}</td> */}
                            <td>
                              <button
                                className="btn btn-warning"
                                onClick={() => handleEdit(c)}
                              >
                                Modifier
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteClick(c.id)}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center" }}>
                            Aucune classe trouvée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}


       {Sharingan === 4 && (
        <>
          <div className="mes-barre">
            <Header user={user} />
          </div>
          <div className="main-content-classes">
            <div className="selection-classes">

              <div className="form-group">
                <label>Niveau</label>
                <select
                  value={selectedNiveau}
                  onChange={(e) => setSelectedNiveau(e.target.value)}
                >
                  <option value="">-- Tous les niveaux --</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Secondaire">Secondaire</option>
                  <option value="Lycée">Lycée</option>
                </select>
              </div>

            </div>

            <div className="all-classes">
              <div className="gauche">
                <h2>{isEditing ? "Modifier une classe" : "Ajouter une classe"}</h2>

                <form onSubmit={handleSubmit} className="form-container">
                  
                  <div className="team-classes">
                      <div className="form-group">
                      <label>Nom</label>
                      <input
                        type="text"
                        name="nom"
                        placeholder="6eme1"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Niveau</label>
                      <select
                        name="niveau"
                        value={formData.niveau}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="Primaire">Primaire</option>
                        <option value="Secondaire">Secondaire</option>
                        <option value="Lycée">Lycée</option>
                      </select>
                    </div>
                  </div>

                  {/* <div className="form-group">
                    <label>Capacité</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      
                    />
                  </div> */}


                  {/* <div className="form-group">
                    <label>ID Enseignant Principal  </label>
                    <input
                      type="number"
                      name="enseignant_principal_id"
                      value={formData.enseignant_principal_id}
                      onChange={handleChange}
                    />
                  </div> */}

                  <div className="envoie">
                      <button type="submit" className="btn-envoie btn-primary">
                      {isEditing ? "Mettre à jour" : "Enregistrer"}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn-envoie btn-secondary ml-2"
                        onClick={handleCancel}
                      >
                        Annuler
                      </button>
                    )}
                  </div>

                  {message && <p className="Message3rror">{message}</p>}
                </form>
              </div>

              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette classe ?</p>
                      <button
                        onClick={confirmDelete}
                        className="btn btn-danger"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="btn btn-secondary"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                <div className="liste">
                  <div className="liste-classes">
  {Array.isArray(classes) && classes.length > 0 ? (
    classes.map((c) => (
      <div key={c.id} className="classe-card">
        <p><strong>Nom:</strong> {c.nom}</p>
        <p><strong>Niveau:</strong> {c.niveau}</p>

        <div className="classe-actions">
          <button
            className="btn btn-warning"
            onClick={() => handleEdit(c)}
          >
            Modifier
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDeleteClick(c.id)}
          >
            Supprimer
          </button>
        </div>
      </div>
    ))
  ) : (
    <p style={{ textAlign: "center", width: "100%" }}>
      Aucune classe trouvée
    </p>
  )}
</div>

                </div>
              </div>
            </div>
          </div>
        </>
      )}


    </>
  );
};

export default ClassroomsPage;
