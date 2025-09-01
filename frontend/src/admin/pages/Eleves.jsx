import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Lheader/Header";
import HeaderSec from "../Lheader/HeaderSec";
import HeaderEdu from "../Lheader/HeaderEdu";

import "../styles/barre.css";
import "../styles/eleves.css";

const Eleves = () => {
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  // const [count, setCount] = useState(0);

  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); // utilisateur courant

  // 🔹 Nouvel état uniquement pour le formulaire élève
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    sexe: "",
    classroom_id: "",
    matricule: "",
    telephone_parent: "",
  });

  const navigate = useNavigate();

  // Effacer les messages après 4 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Charger les données de l'utilisateur courant
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/utilisateurs/me`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setUser(res.data.utilisateurs);
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

  // Charger tous les élèves de l'écoles de l'utillisateur
  const fetchEleves = useCallback(async () => {
    if (!user) return; // attendre que user soit chargé
    try {
      let res;
      if (selectedClass) {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/apprenants/classroom/${selectedClass}`
        );
      } else {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/apprenants?ecole_id=${user.school_chif}`,
          {
            withCredentials: true,
          }
        );
      }
      setEleves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur lors du chargement des élèves :", err);
      setEleves([]);
    }
  }, [selectedClass, user]);

  useEffect(() => {
    fetchEleves();
  }, [selectedClass, fetchEleves]);

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        classroom_id: selectedClass || formData.classroom_id,
      };

      let res;
      if (isEditing && editId) {
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/apprenants/${editId}`,
          payload
        );
        setIsEditing(false);
        setEditId(null);
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/apprenants`,
          payload
        );
      }

      // Affiche le message renvoyé par l'API
      setMessage(res.data.message || "Action réussie");

      fetchEleves();

      setFormData({
        nom: "",
        prenom: "",
        sexe: "",
        classroom_id: selectedClass,
        matricule: "",
        telephone_parent: "",
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  const handleEdit = (eleve) => {
    setFormData({
      nom: eleve.nom || "",
      prenom: eleve.prenom || "",
      sexe: eleve.sexe || "",
      classroom_id: eleve.classroom_id || "",
      matricule: eleve.matricule || "",
      telephone_parent: eleve.telephone_parent || "",
    });
    setSelectedClass(eleve.classroom_id || "");
    setIsEditing(true);
    setEditId(eleve.id);
  };

  //PopUp suppression
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
      prenom: "",
      sexe: "",
      classroom_id: "",
      matricule: "",
      telephone_parent: "",
    });
    setIsEditing(false);
    setEditId(null);
    setSelectedClass(""); // reset élève sélectionné
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/apprenants/${deleteId}`
      );
      fetchEleves();
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
      {Sharingan === 4 && (
        <>
          <div className="mes-barre">
            <Header user={user} />
          </div>
          <div className="main-content-eleves">
            <div className="all-eleves">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier un élève" : "Ajoutez vos élèves"}
                </h2>

                <form onSubmit={handleSubmit} className="form-container">
                  <div className="team-eleves">
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
                      <label>Prénom</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="team-eleves">
                    <div className="form-group">
                      <label>Sexe</label>
                      <select
                        name="sexe"
                        value={formData.sexe}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Classe</label>
                      <select
                        name="classroom_id"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        required
                      >
                        <option value="">-- Sélectionner une classe --</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="team-eleves">
                    <div className="form-group">
                      <label>Matricule</label>
                      <input
                        type="text"
                        name="matricule"
                        value={formData.matricule}
                        onChange={handleChange}
                        placeholder="Ex: ELV-2025-001"
                      />
                    </div>

                    <div className="form-group">
                      <label>Téléphone du parent</label>
                      <input
                        type="text"
                        name="telephone_parent"
                        value={formData.telephone_parent}
                        onChange={handleChange}
                        placeholder="Ex: 0102030405"
                      />
                    </div>
                  </div>

                  <div className="envoie">
                      <button type="submit" className="btn-envoie btn-primary">
                      {isEditing ? "Mettre à jour" : "Enregistrer"}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn-envoie2 btn-secondary ml-2"
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
                      <p>⚠️ Voulez-vous vraiment supprimer cet élève ?</p>
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

                <div className="selection-classes">
                  <div className="form-group">
                    <label>Classe</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="liste">
                  {Array.isArray(eleves) && eleves.length > 0 ? (
                    eleves.map((eleve) => {
                      const classe = classes.find(
                        (c) => c.id === eleve.classroom_id
                      );

                      return (
                        <div key={eleve.id} className="eleve-card">
                          <h4>
                            {eleve.nom} {eleve.prenom}
                          </h4>
                         <div className="name-sex">
                             <p>
                              <strong>Sexe:</strong> {eleve.sexe}
                            </p>
                            <p>
                              <strong>Classe:</strong> {classe ? classe.nom : "—"}
                            </p>
                         </div>
                          <div className="name-sex">
                              <p>
                              <strong>Inscrit le:</strong>{" "}
                              {eleve.created_at
                                ? new Date(eleve.created_at).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>

                          <div className="eleve-actions">
                            <button
                              className="btn btn-warning"
                              onClick={() => handleEdit(eleve)}
                            >
                              Modifier
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteClick(eleve.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ textAlign: "center", width: "100%" }}>
                      Aucun élève trouvé
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

{Sharingan === 3 && (
        <>
          <div className="mes-barre">
            <HeaderSec user={user} />
          </div>
          <div className="main-content-eleves">
            <div className="all-eleves">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier un élève" : "Ajoutez vos élèves"}
                </h2>

                <form onSubmit={handleSubmit} className="form-container">
                  <div className="team-eleves">
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
                      <label>Prénom</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="team-eleves">
                    <div className="form-group">
                      <label>Sexe</label>
                      <select
                        name="sexe"
                        value={formData.sexe}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Classe</label>
                      <select
                        name="classroom_id"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        required
                      >
                        <option value="">-- Sélectionner une classe --</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="team-eleves">
                    <div className="form-group">
                      <label>Matricule</label>
                      <input
                        type="text"
                        name="matricule"
                        value={formData.matricule}
                        onChange={handleChange}
                        placeholder="Ex: ELV-2025-001"
                      />
                    </div>

                    <div className="form-group">
                      <label>Téléphone du parent</label>
                      <input
                        type="text"
                        name="telephone_parent"
                        value={formData.telephone_parent}
                        onChange={handleChange}
                        placeholder="Ex: 0102030405"
                      />
                    </div>
                  </div>

                  <div className="envoie">
                      <button type="submit" className="btn-envoie btn-primary">
                      {isEditing ? "Mettre à jour" : "Enregistrer"}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn-envoie2 btn-secondary ml-2"
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
                      <p>⚠️ Voulez-vous vraiment supprimer cet élève ?</p>
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

                <div className="selection-classes">
                  <div className="form-group">
                    <label>Classe</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="liste">
                  {Array.isArray(eleves) && eleves.length > 0 ? (
                    eleves.map((eleve) => {
                      const classe = classes.find(
                        (c) => c.id === eleve.classroom_id
                      );

                      return (
                        <div key={eleve.id} className="eleve-card">
                          <h4>
                            {eleve.nom} {eleve.prenom}
                          </h4>
                         <div className="name-sex">
                             <p>
                              <strong>Sexe:</strong> {eleve.sexe}
                            </p>
                            <p>
                              <strong>Classe:</strong> {classe ? classe.nom : "—"}
                            </p>
                         </div>
                          <div className="name-sex">
                              <p>
                              <strong>Inscrit le:</strong>{" "}
                              {eleve.created_at
                                ? new Date(eleve.created_at).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>

                          <div className="eleve-actions">
                            <button
                              className="btn btn-warning"
                              onClick={() => handleEdit(eleve)}
                            >
                              Modifier
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteClick(eleve.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ textAlign: "center", width: "100%" }}>
                      Aucun élève trouvé
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}


      {Sharingan === 1 && (
        <>
          <div className="mes-barre">
            <HeaderEdu user={user} />
          </div>
          <div className="main-content-eleves">
            <div className="all-eleves">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier un élève" : "Ajoutez vos élèves"}
                </h2>

                <form onSubmit={handleSubmit} className="form-container">
                  <div className="team-eleves">
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
                      <label>Prénom</label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="team-eleves">
                    <div className="form-group">
                      <label>Sexe</label>
                      <select
                        name="sexe"
                        value={formData.sexe}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner --</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Classe</label>
                      <select
                        name="classroom_id"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        required
                      >
                        <option value="">-- Sélectionner une classe --</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="team-eleves">
                    <div className="form-group">
                      <label>Matricule</label>
                      <input
                        type="text"
                        name="matricule"
                        value={formData.matricule}
                        onChange={handleChange}
                        placeholder="Ex: ELV-2025-001"
                      />
                    </div>

                    <div className="form-group">
                      <label>Téléphone du parent</label>
                      <input
                        type="text"
                        name="telephone_parent"
                        value={formData.telephone_parent}
                        onChange={handleChange}
                        placeholder="Ex: 0102030405"
                      />
                    </div>
                  </div>

                  <div className="envoie">
                      <button type="submit" className="btn-envoie btn-primary">
                      {isEditing ? "Mettre à jour" : "Enregistrer"}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn-envoie2 btn-secondary ml-2"
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
                      <p>⚠️ Voulez-vous vraiment supprimer cet élève ?</p>
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

                <div className="selection-classes">
                  <div className="form-group">
                    <label>Classe</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="liste">
                  {Array.isArray(eleves) && eleves.length > 0 ? (
                    eleves.map((eleve) => {
                      const classe = classes.find(
                        (c) => c.id === eleve.classroom_id
                      );

                      return (
                        <div key={eleve.id} className="eleve-card">
                          <h4>
                            {eleve.nom} {eleve.prenom}
                          </h4>
                         <div className="name-sex">
                             <p>
                              <strong>Sexe:</strong> {eleve.sexe}
                            </p>
                            <p>
                              <strong>Classe:</strong> {classe ? classe.nom : "—"}
                            </p>
                         </div>
                          <div className="name-sex">
                              <p>
                              <strong>Inscrit le:</strong>{" "}
                              {eleve.created_at
                                ? new Date(eleve.created_at).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>

                          <div className="eleve-actions">
                            <button
                              className="btn btn-warning"
                              onClick={() => handleEdit(eleve)}
                            >
                              Modifier
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteClick(eleve.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ textAlign: "center", width: "100%" }}>
                      Aucun élève trouvé
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Eleves;
