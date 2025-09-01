import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderEdu from "../Lheader/HeaderEdu";
import HeaderEns from "../Lheader/HeaderEns";

import "../styles/barre.css";
import "../styles/presences.css";

const Presences = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const [eleves, setEleves] = useState([]);
  const [presences, setPresences] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedEleve, setSelectedEleve] = useState("");
  const [formData, setFormData] = useState({
    apprenant_id: "",
    date_presence: "",
    etat: "Absent",
    matiere: "",
    justifie: 0,
    commentaire: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  // Effacer messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  // ⚡ fetch utilisateur
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

  // ⚡ fetch classes
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/classrooms`, {
        params: { ecole_id: user.school_chif },
        withCredentials: true,
      })
      .then(({ data }) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setClasses([]));
  }, [user]);

  // ⚡ fetch élèves
  useEffect(() => {
    if (!selectedClass) {
      setEleves([]);
      return;
    }
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/apprenants/classroom/${selectedClass}`
      )
      .then(({ data }) => setEleves(Array.isArray(data) ? data : []))
      .catch(() => setEleves([]));
  }, [selectedClass]);

  // ⚡ fetch présences
  const fetchPresences = useCallback(() => {
    if (!user) return;
    let url = `${import.meta.env.VITE_API_URL}/api/presences`;
    if (selectedEleve) url += `/eleve/${selectedEleve}`;
    else if (selectedClass) url += `/class/${selectedClass}`;
    axios
      .get(url, {
        params: { ecole_id: user.school_chif },
        withCredentials: true,
      })
      .then(({ data }) => setPresences(Array.isArray(data) ? data : []))
      .catch(() => setPresences([]));
  }, [user, selectedClass, selectedEleve]);

  useEffect(() => {
    fetchPresences();
  }, [fetchPresences]);

  // ⚡ form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ⚡ submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
      ...formData,
      apprenant_id: formData.apprenant_id || selectedEleve,
      noted_by: user.id,
    };

    try {
      if (isEditing && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/presences/${editId}`,
          payload
        );
        setIsEditing(false);
        setEditId(null);
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/presences`,
          { ...payload, ecole_id: user.school_chif, matiere: user.nom_matiere }
        );
      }
      fetchPresences();
      setFormData({
        apprenant_id: "",
        date_presence: "",
        etat: "Absent",
        justifie: 0,
        commentaire: "",
      });
      setSelectedEleve("");
      setMessage("Action réussie");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  //Modification form

  const handleEdit = (p) => {
    setFormData({
      apprenant_id: p.apprenant_id,
      date_presence: p.date_presence?.slice(0, 16) || "",
      etat: p.etat,
      matiere: p.matiere,
      justifie: p.justifie,
      commentaire: p.commentaire || "",
    });
    setSelectedClass(p.classroom_id);
    setSelectedEleve(p.apprenant_id);
    setIsEditing(true);
    setEditId(p.id);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/presences/${deleteId}`
      );
      fetchPresences();
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
      {Sharingan === 1 && (
        <>
          <div className="mes-barre">
            <HeaderEdu user={user} />
          </div>
        </>
      )}

      {Sharingan === 2 && (
        <>
          <div className="mes-barre">
            <HeaderEns user={user} />
          </div>
          <div className="main-content-presences">
            <div className="all-presences">
              <div className="gauche">
                <div className="form-container">
                  <h3>
                    {isEditing ? "Modifier présence" : "Nouvelle présence"}
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="team-presences">
                      <div className="form-group">
                        <label>Élève</label>
                        <select
                          name="apprenant_id"
                          value={formData.apprenant_id || selectedEleve}
                          onChange={handleChange}
                          required
                        >
                          <option value="">-- Sélectionner un élève --</option>
                          {eleves.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.nom} {e.prenom}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Date et heure</label>
                        <input
                          type="datetime-local"
                          name="date_presence"
                          value={formData.date_presence}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="team-presences">
                      <div className="form-group">
                        <label>État</label>
                        <select
                          name="etat"
                          value={formData.etat}
                          onChange={handleChange}
                        >
                          {/* <option value="present">Présent</option> */}
                          <option value="Absent">Absent</option>
                          <option value="Retard">Retard</option>
                        </select>
                      </div>
                                            <div className="form-group">
                        <label>Justifié</label>
                        <input
                          type="checkbox"
                          name="justifie"
                          checked={formData.justifie}
                          onChange={handleChange}
                        />
                      </div>

                      {/* <div className="form-group">
                        <label>Matière</label>
                        <input
                          type="text"
                          name="matiere"
                          value={formData.matiere}
                          onChange={handleChange}
                          required
                        />
                      </div> */}
                    </div>

                    <div className="team-presences">
                      <div className="form-group">
                        <label>Commentaire</label>
                        <textarea
                          name="commentaire"
                          value={formData.commentaire}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="envoie">
                        <button type="submit" className="btn-envoie btn-primary">
                        {isEditing ? "Mettre à jour" : "Enregistrer"}
                      </button>
                    </div>

                    {message && <p className="Message3rror">{message}</p>}
                  </form>
                </div>
              </div>

              {/* Tableau */}
              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cet appel ?</p>
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
                {/* Filtre */}
                <div className="selection-classes">
                  <div className="filters">
                    <div className="team-presences">
                      <div className="form-group">
                        <label>Classe</label>
                        <select
                          value={selectedClass}
                          onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setSelectedEleve("");
                          }}
                        >
                          <option value="">
                            -- Sélectionner une classe --
                          </option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nom}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedClass && (
                        <div className="form-group">
                          <label>Élève</label>
                          <select
                            value={selectedEleve}
                            onChange={(e) => setSelectedEleve(e.target.value)}
                          >
                            <option value="">-- Tous les élèves --</option>
                            {eleves.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.nom} {e.prenom}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="liste">
                  <div className="liste-presences">
                    {presences.map((p) => (
                      <div key={p.id} className="presence-card">
                        <h3 className="presence-name">
                          {p.nom} {p.prenom}
                        </h3>
                        <p>
                          <strong>Date :</strong>{" "}
                          {new Date(p.date_presence).toLocaleString()}
                        </p>
                        <p>
                          <strong>Matière :</strong> {p.matiere}
                        </p>
                        <p>
                          <strong>État :</strong> {p.etat}
                        </p>
                        <p>
                          <strong>Justifié :</strong>{" "}
                          {p.justifie ? "Oui" : "Non"}
                        </p>
                        <p>
                          <strong>Commentaire :</strong> {p.commentaire || "Aucun"} 
                        </p>
                        <div className="presence-actions">
                          <button
                            className="btn-warning"
                            onClick={() => handleEdit(p)}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDeleteClick(p.id)}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
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

export default Presences;
