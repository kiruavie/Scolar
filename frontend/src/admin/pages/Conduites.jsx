import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HeaderEdu from "../Lheader/HeaderEdu";
import HeaderEns from "../Lheader/HeaderEns";

import "../styles/barre.css";
import "../styles/conduites.css";

const Conduites = () => {
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [conduites, setConduites] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedEleve, setSelectedEleve] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    apprenant_id: "",
    note: "",
    observation: "",

  });

  const navigate = useNavigate();

  // ⚡ effacer message après 3s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ⚡ charger utilisateur courant
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

  // ⚡ charger classes
useEffect(() => {
  if (!user?.school_chif) return;

  axios
    .get(`${import.meta.env.VITE_API_URL}/api/classrooms`, {
      params: { ecole_id: user.school_chif }, // <-- obligatoire
      withCredentials: true,
    })
    .then(({ data }) => setClasses(data))
    .catch((err) => console.error(err));
}, [user]);


  // ⚡ charger élèves de la classe
  const fetchEleves = useCallback(async () => {
    if (!selectedClass) {
      setEleves([]);
      return;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/apprenants/classroom/${selectedClass}`
      );
      setEleves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setEleves([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchEleves();
  }, [selectedClass, fetchEleves]);

  // ⚡ charger conduites
  const fetchConduites = useCallback(async () => {
    try {
      let res;
      if (selectedEleve) {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/conduites/apprenant/${selectedEleve}`
        );
      } else if (selectedClass) {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/conduites/classroom/${selectedClass}`
        );
      } else {
        res = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/conduites`,
  { params: { ecole_id: user.school_chif } } // 👈 Ajout du filtre
);

      }
      setConduites(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setConduites([]);
    }
  }, [selectedClass, selectedEleve, user]);

  useEffect(() => {
    if (!user) return;
    fetchConduites();
  }, [selectedClass, selectedEleve, fetchConduites, user]);




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





  // ⚡ form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ⚡ submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        apprenant_id: formData.apprenant_id || selectedEleve,
        ecoles_id: user?.school_chif,
        emetteur_id: user?.id,
      };

      let res;
      if (isEditing && editId) {
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/conduites/${editId}`,
          payload
        );
        setIsEditing(false);
        setEditId(null);
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/conduites`,
          payload
        );
      }

      setMessage(res.data.message || "Action réussie");
      fetchConduites();

      setFormData({ apprenant_id: "", note: "", observation: "" });
      setSelectedEleve("");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  // ⚡ edit
  const handleEdit = (conduite) => {
    setFormData({
      apprenant_id: conduite.apprenant_id,
      note: conduite.note,
      observation: conduite.observation,
    });
    setSelectedClass(conduite.classroom_id);
    setSelectedEleve(conduite.apprenant_id);
    setIsEditing(true);
    setEditId(conduite.id);
  };

  // ⚡ delete
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/conduites/${deleteId}`
      );
      fetchConduites();
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

          <div className="main-content-conduites">
            {/* Filtres */}
            <div className="selection-classes">
              <div className="filters">
                 <div className="team-conduites">
                       <div className="form-group">
                      <label>Classe</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setSelectedEleve("");
                        }}
                      >
                        
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* {selectedClass && ( */}
                      <div className="form-group">
                        <label>Élève</label>
                        <select
                          value={selectedEleve}
                          onChange={(e) => setSelectedEleve(e.target.value)}
                        >
                          <option value="">-- Selectionner un élèves --</option>
                          {eleves.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.nom} {e.prenom}
                            </option>
                          ))}
                        </select>
                      </div>
                    {/* )} */}
                 </div>
                </div>
            </div>

            {/* Formulaire */}
            <div className="all-conduites">
              <div className="gauche">
                <h2>{isEditing ? "Modifier une conduite" : "Nouvelle conduite"}</h2>

                <form onSubmit={handleSubmit} className="form-container">

                  <div className="team-conduites">
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
                  </div>

                  <div className="team-conduites">
                      <div className="form-group">
                      <label>Note</label>
                      <input type="text"
                      name="note"
                        value={formData.note}
                        onChange={handleChange}
                        required />
                    </div>
                  </div>

                  <div className="team-conduites">
                      <div className="form-group">
                      <label>observation</label>
                      <textarea
                        name="observation"
                        value={formData.observation}
                        onChange={handleChange}
                        rows="4"
                      />
                    </div>
                  </div>

                  <div className="envoie">
                      <button note="submit" className="btn-envoie btn-primary">
                      {isEditing ? "Mettre à jour" : "Enregistrer"}
                    </button>
                  </div>
                  {message && <p className="Message3rror">{message}</p>}
                </form>
              </div>

              {/* Tableau conduites */}
              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette conduite ?</p>
                      <button onClick={confirmDelete} className="btn btn-danger">
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
                 <div className="liste-conduites">
  {Array.isArray(conduites) && conduites.length > 0 ? (
    conduites.map((s) => (
      <div className="conduite-card" key={s.id}>
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h5 className="card-title">
              {s.nom} {s.prenom}
            </h5>
            <p className="card-text">
              <strong>Note :</strong> {s.note}
            </p>
            <p className="card-text">
              <strong>Observation :</strong> {s.observation}
            </p>
            <p className="card-text text-muted">
              <strong>Date :</strong>{" "}
              {s.creation
                ? new Date(s.creation).toLocaleDateString()
                : "—"}
            </p>
            <div className="conduite-actions">
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit(s)}
              >
                Modifier
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteClick(s.id)}
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
        Aucune conduite trouvée
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

      {Sharingan === 3 && (
        <>
          <div className="mes-barre">
            <HeaderEns user={user} />
          </div>

          <div className="main-content-conduites">
            {/* Filtres */}
            <div className="selection-classes">
              <div className="filters">
                 <div className="team-conduites">
                       <div className="form-group">
                      <label>Classe</label>
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setSelectedEleve("");
                        }}
                      >
                        
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* {selectedClass && ( */}
                      <div className="form-group">
                        <label>Élève</label>
                        <select
                          value={selectedEleve}
                          onChange={(e) => setSelectedEleve(e.target.value)}
                        >
                          <option value="">-- Selectionner un élèves --</option>
                          {eleves.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.nom} {e.prenom}
                            </option>
                          ))}
                        </select>
                      </div>
                    {/* )} */}
                 </div>
                </div>
            </div>

            {/* Formulaire */}
            <div className="all-conduites">
              <div className="gauche">
                <h2>{isEditing ? "Modifier une conduite" : "Nouvelle conduite"}</h2>

                <form onSubmit={handleSubmit} className="form-container">

                  <div className="team-conduites">
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
                  </div>

                  <div className="team-conduites">
                      <div className="form-group">
                      <label>Note</label>
                      <input type="text"
                      name="note"
                        value={formData.note}
                        onChange={handleChange}
                        required />
                    </div>
                  </div>

                  <div className="team-conduites">
                      <div className="form-group">
                      <label>observation</label>
                      <textarea
                        name="observation"
                        value={formData.observation}
                        onChange={handleChange}
                        rows="4"
                      />
                    </div>
                  </div>

                  <div className="envoie">
                      <button note="submit" className="btn-envoie btn-primary">
                      {isEditing ? "Mettre à jour" : "Enregistrer"}
                    </button>
                  </div>
                  {message && <p className="Message3rror">{message}</p>}
                </form>
              </div>

              {/* Tableau conduites */}
              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette conduite ?</p>
                      <button onClick={confirmDelete} className="btn btn-danger">
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
                 <div className="liste-conduites">
  {Array.isArray(conduites) && conduites.length > 0 ? (
    conduites.map((s) => (
      <div className="conduite-card" key={s.id}>
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <h5 className="card-title">
              {s.nom} {s.prenom}
            </h5>
            <p className="card-text">
              <strong>Note :</strong> {s.note}
            </p>
            <p className="card-text">
              <strong>Observation :</strong> {s.observation}
            </p>
            <p className="card-text text-muted">
              <strong>Date :</strong>{" "}
              {s.creation
                ? new Date(s.creation).toLocaleDateString()
                : "—"}
            </p>
            <div className="conduite-actions">
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit(s)}
              >
                Modifier
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteClick(s.id)}
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
        Aucune conduite trouvée
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

export default Conduites;
