import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HeaderEdu from "../Lheader/HeaderEdu";
import HeaderEns from "../Lheader/HeaderEns";
import HeaderSec from "../Lheader/HeaderSec";

import "../styles/barre.css";
import "../styles/sanctions.css";

const Sanctions = () => {
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [sanctions, setSanctions] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedEleve, setSelectedEleve] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    apprenant_id: "",
    type: "",
    description: "",
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
    if (!user) return; // attendre que user soit chargé

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/classrooms`, {
        params: { ecole_id: user.school_chif }, // filtre par ecole_id
        withCredentials: true,
      })
      .then(({ data }) => setClasses(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erreur classes :", err));
  }, [user]); // dépendance sur user

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

  // ⚡ charger sanctions
  const fetchSanctions = useCallback(async () => {
    try {
      if (!user) return;
      let res;
      if (selectedEleve) {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sanctions/apprenant/${selectedEleve}`
        );
      } else if (selectedClass) {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sanctions/classroom/${selectedClass}`
        );
      } else {
        res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sanctions/ecole/${user.school_chif}` // <-- ajoute ton ecoleId ici
        );
      }
      setSanctions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setSanctions([]);
    }
  }, [selectedClass, selectedEleve, user]);

  useEffect(() => {
    fetchSanctions();
  }, [selectedClass, selectedEleve, fetchSanctions]);

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
          `${import.meta.env.VITE_API_URL}/api/sanctions/${editId}`,
          payload
        );
        setIsEditing(false);
        setEditId(null);
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/sanctions`,
          payload
        );
      }

      setMessage(res.data.message || "Action réussie");
      fetchSanctions();

      setFormData({ apprenant_id: "", type: "", description: "" });
      setSelectedEleve("");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  // ⚡ edit
  const handleEdit = (sanction) => {
    setFormData({
      apprenant_id: sanction.apprenant_id,
      type: sanction.type,
      description: sanction.description,
    });
    setSelectedClass(sanction.classroom_id);
    setSelectedEleve(sanction.apprenant_id);
    setIsEditing(true);
    setEditId(sanction.id);
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
        `${import.meta.env.VITE_API_URL}/api/sanctions/${deleteId}`
      );
      fetchSanctions();
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

          <div className="main-content-sanctions">
            {/* Filtres */}
            <div className="selection-classes">
              <div className="filters">
                <div className="team-sanctions">
                  <div className="form-group">
                    <label>Classe</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedEleve("");
                      }}
                    >
                      <option value="">-- Selectionner une classe --</option>
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
                      value={selectedEleve}
                      onChange={(e) => setSelectedEleve(e.target.value)}
                    >
                      <option value="">-- Selectionner un élève --</option>
                      {eleves.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nom} {e.prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="all-sanctions">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier une sanction" : "Nouvelle sanction"}
                </h2>

                <form onSubmit={handleSubmit} className="form-container">
                  <div className="team-sanctions">
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

                  <div className="team-sanctions">
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
                      <label>Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner un type --</option>
                        <option value="avertissement">Avertissement</option>
                        <option value="retenue">Retenue</option>
                        <option value="exclusion_temporaire">
                          Exclusion Temporaire
                        </option>
                        <option value="exclusion_definitive">
                          Exclusion Définitive
                        </option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="team-sanctions">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
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

              {/* Tableau sanctions */}
              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette sanction ?</p>
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
                  <div className="liste-sanctions">
  {Array.isArray(sanctions) && sanctions.length > 0 ? (
    sanctions.map((s) => (
      <div key={s.id} className="sanction-card">
        <div className="card shadow-lg border-0 rounded-3 h-100">
          <div className="card-body">
            <h3 className="card-title">
              {s.nom} {s.prenom}
            </h3>
            <p className="card-text">
              <strong>Type :</strong> {s.type}
            </p>
            <p className="card-text">
              <strong>Description :</strong> {s.description}
            </p>
           <p className="card-text">
  {" "}
  {s.date_sanction
    ? new Date(s.date_sanction).toLocaleDateString("fr-FR", {
        weekday: "long",  // jour en toutes lettres (ex: jeudi)
        day: "numeric",   // numéro du jour
        month: "long",    // mois en toutes lettres (ex: mars)
        year: "numeric",  // année
      })
    : "—"}
</p>

            <div className="sanction-actions">
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
    <div className="col-12 text-center">
      <p className="text-muted">Aucune sanction trouvée</p>
    </div>
  )}
</div>

                </div>
              </div>
            </div>
          </div>
        </>
      )}





      {Sharingan === 2 && (
        <>
          <div className="mes-barre">
            <HeaderEns user={user} />
          </div>

          <div className="main-content-sanctions">
            {/* Filtres */}
            <div className="selection-classes">
              <div className="filters">
                <div className="team-sanctions">
                  <div className="form-group">
                    <label>Classe</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedEleve("");
                      }}
                    >
                      <option value="">-- Selectionner une classe --</option>
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
                      value={selectedEleve}
                      onChange={(e) => setSelectedEleve(e.target.value)}
                    >
                      <option value="">-- Selectionner un élève --</option>
                      {eleves.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nom} {e.prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="all-sanctions">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier une sanction" : "Nouvelle sanction"}
                </h2>

                <form onSubmit={handleSubmit} className="form-container">
                  
                  <div className="team-sanctions">
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

                  <div className="team-sanctions">
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
                      <label>Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner un type --</option>
                        <option value="avertissement">Avertissement</option>
                        <option value="retenue">Retenue</option>
                        <option value="exclusion_temporaire">
                          Exclusion Temporaire
                        </option>
                        <option value="exclusion_definitive">
                          Exclusion Définitive
                        </option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="team-sanctions">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
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

              {/* Tableau sanctions */}
              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette sanction ?</p>
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
                  <div className="liste-sanctions">
  {Array.isArray(sanctions) && sanctions.length > 0 ? (
    sanctions.map((s) => (
      <div key={s.id} className="sanction-card">
        <div className="card shadow-lg border-0 rounded-3 h-100">
          <div className="card-body">
            <h3 className="card-title">
              {s.nom} {s.prenom}
            </h3>
            <p className="card-text">
              <strong>Type :</strong> {s.type}
            </p>
            <p className="card-text">
              <strong>Description :</strong> {s.description}
            </p>
           <p className="card-text">
  {" "}
  {s.date_sanction
    ? new Date(s.date_sanction).toLocaleDateString("fr-FR", {
        weekday: "long",  // jour en toutes lettres (ex: jeudi)
        day: "numeric",   // numéro du jour
        month: "long",    // mois en toutes lettres (ex: mars)
        year: "numeric",  // année
      })
    : "—"}
</p>

            <div className="sanction-actions">
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
    <div className="col-12 text-center">
      <p className="text-muted">Aucune sanction trouvée</p>
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
            <HeaderSec user={user} />
          </div>

          <div className="main-content-sanctions">
            {/* Filtres */}
            <div className="selection-classes">
              <div className="filters">
                <div className="team-sanctions">
                  <div className="form-group">
                    <label>Classe</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setSelectedEleve("");
                      }}
                    >
                      <option value="">-- Selectionner une classe --</option>
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
                      value={selectedEleve}
                      onChange={(e) => setSelectedEleve(e.target.value)}
                    >
                      <option value="">-- Selectionner un élève --</option>
                      {eleves.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nom} {e.prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="all-sanctions">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier une sanction" : "Nouvelle sanction"}
                </h2>

                <form onSubmit={handleSubmit} className="form-container">
                  <div className="team-sanctions">
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

                  <div className="team-sanctions">
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
                      <label>Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner un type --</option>
                        <option value="avertissement">Avertissement</option>
                        <option value="retenue">Retenue</option>
                        <option value="exclusion_temporaire">
                          Exclusion Temporaire
                        </option>
                        <option value="exclusion_definitive">
                          Exclusion Définitive
                        </option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="team-sanctions">
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
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

              {/* Tableau sanctions */}
              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette sanction ?</p>
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
                  <div className="liste-sanctions">
  {Array.isArray(sanctions) && sanctions.length > 0 ? (
    sanctions.map((s) => (
      <div key={s.id} className="sanction-card">
        <div className="card shadow-lg border-0 rounded-3 h-100">
          <div className="card-body">
            <h3 className="card-title">
              {s.nom} {s.prenom}
            </h3>
            <p className="card-text">
              <strong>Type :</strong> {s.type}
            </p>
            <p className="card-text">
              <strong>Description :</strong> {s.description}
            </p>
           <p className="card-text">
  {" "}
  {s.date_sanction
    ? new Date(s.date_sanction).toLocaleDateString("fr-FR", {
        weekday: "long",  // jour en toutes lettres (ex: jeudi)
        day: "numeric",   // numéro du jour
        month: "long",    // mois en toutes lettres (ex: mars)
        year: "numeric",  // année
      })
    : "—"}
</p>

            <div className="sanction-actions">
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
    <div className="col-12 text-center">
      <p className="text-muted">Aucune sanction trouvée</p>
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

export default Sanctions;
