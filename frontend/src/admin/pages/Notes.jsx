import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import HeaderEdu from "../Lheader/HeaderEdu";
import HeaderEns from "../Lheader/HeaderEns";
import "../styles/barre.css";
import "../styles/notes.css";

const NotesPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedEleve, setSelectedEleve] = useState("");

  const [formData, setFormData] = useState({
    apprenant_id: "",
    matiere: "",
    valeur: "",
    coefficient: "/20",
    date_note: "",
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
        if (res.data.success) setUser(res.data.utilisateurs);
        else navigate("/connect");
      } catch {
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

  // ⚡ fetch notes
  const fetchNotes = useCallback(() => {
    if (!user) return;
    let url = `${import.meta.env.VITE_API_URL}/api/notes`;
    if (selectedEleve) url += `/eleve/${selectedEleve}`;
    else if (selectedClass) url += `/class/${selectedClass}`;
    axios
      .get(url, {
        params: { ecole_id: user.school_chif },
        withCredentials: true,
      })
      .then(({ data }) => setNotes(Array.isArray(data) ? data : []))
      .catch(() => setNotes([]));
  }, [user, selectedClass, selectedEleve]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ⚡ form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ⚡ submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
      ...formData,
      apprenant_id: formData.apprenant_id || selectedEleve,
      enseignant_id: user.id,
    };

    try {
      if (isEditing && editId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/notes/${editId}`,
          payload
        );
        setIsEditing(false);
        setEditId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/notes`, {
          ...payload,
          ecole_id: user.school_chif,
          matiere: user.nom_matiere,
        });
      }
      fetchNotes();
      setFormData({
        apprenant_id: "",
        matiere: "",
        valeur: "",
        coefficient: "/20",
        date_note: "",
        commentaire: "",
      });
      setSelectedEleve("");
      setMessage("Action réussie");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  const handleEdit = (n) => {
    setFormData({
      apprenant_id: n.apprenant_id,
      matiere: n.matiere,
      valeur: n.valeur,
      coefficient: n.coefficient,
      date_note: n.date_note?.slice(0, 16) || "",
      commentaire: n.commentaire || "",
    });
    setSelectedClass(n.classroom_id);
    setSelectedEleve(n.apprenant_id);
    setIsEditing(true);
    setEditId(n.id);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/notes/${deleteId}`
      );
      fetchNotes();
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
      {Sharingan === 2 && (
        <>
          <div className="mes-barre">
            <HeaderEns user={user} />
          </div>
          <div className="main-content-notes">
            <div className="selection-classes">
              <div className="form-group">
                <label>Classe</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedEleve("");
                  }}
                >
                  <option value="">-- Choisir classe --</option>
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

            <div className="all-notes">
              <div className="gauche">
                <h2>{isEditing ? "Modifier une note" : "Ajouter une note"}</h2>

                <form onSubmit={handleSubmit} className="form-container">

                  <div className="team-notes">
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
                      <label>Valeur</label>
                      <input
                        type="number"
                        step="0.5"
                        name="valeur"
                        value={formData.valeur}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="team-notes">
                      <div className="form-group">
                      <label>Sur ???</label>
                      <input
                        type="text"
                        name="coefficient"
                        value={formData.coefficient}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="datetime-local"
                        name="date_note"
                        value={formData.date_note}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="team-notes">
                      <div className="form-group">
                      <label>Commentaire</label>
                      <textarea
                        name="commentaire"
                        value={formData.commentaire}
                        onChange={handleChange}
                      ></textarea>
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

              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette note ?</p>
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
                  <div className="liste-notes">
  {notes.length > 0 ? (
    notes.map((n) => (
      <div className="note-card" key={n.id}>
        <div className="card shadow-sm h-100">
          <div className="card-body">
            <h5 className="card-title">
              {n.nom} {n.prenom}
            </h5>
            <p className="card-text">
              <strong>Matière :</strong> {n.matiere} <br />
              <strong>Notes :</strong> {n.valeur}{n.coefficient} <br />
              <strong>Date :</strong>{" "}
              {n.date_note ? new Date(n.date_note).toLocaleString() : ""} <br />
              <strong>Commentaire :</strong> {n.commentaire}
            </p>
            <div className="note-actions">
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit(n)}
              >
                Modifier
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteClick(n.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-12">
      <div className="alert alert-info text-center">
        Aucune note trouvée
      </div>
    </div>
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

export default NotesPage;
