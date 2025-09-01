import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderSec from "../Lheader/HeaderSec";
import Header from "../Lheader/Header";
import "../styles/barre.css";
import "../styles/scolarites.css";

const Scolarites = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eleves, setEleves] = useState([]);
  const [scolarites, setPaiements] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedEleve, setSelectedEleve] = useState("");
  const [formData, setFormData] = useState({
    apprenant_id: "",
    montant: "",
    Reste: "",
    Scolarite: "",
    annee_scolaire: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  // 🔹 Popup suppression
  const [showPopup, setShowPopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Effacer messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Charger l'utilisateur courant
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

  // Charger classes de l'école
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/classrooms`, {
        params: { ecole_id: user.school_chif },
        withCredentials: true,
      })
      .then(({ data }) => setClasses(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [user]);

  // Charger élèves de la classe sélectionnée
  useEffect(() => {
    if (!selectedClass) return setEleves([]);
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/apprenants/classroom/${selectedClass}`
      )
      .then(({ data }) => setEleves(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedClass]);

  // Charger scolarites selon classe ou élève
  const fetchPaiements = useCallback(() => {
    if (!user) return;

    let url = `${import.meta.env.VITE_API_URL}/api/scolarites`;
    if (selectedEleve) url += `/eleve/${selectedEleve}`;
    else if (selectedClass) url += `/class/${selectedClass}`;

    axios
      .get(url, {
        params: { ecole_id: user.school_chif }, // 🔹 important
        withCredentials: true,
      })
      .then(({ data }) => setPaiements(Array.isArray(data) ? data : []))
      .catch(() => setPaiements([]));
  }, [user, selectedClass, selectedEleve]);

  useEffect(() => {
    fetchPaiements();
  }, [fetchPaiements]);

  // Formulaire change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        ...formData,
        apprenant_id: formData.apprenant_id || selectedEleve,
      };

      let res;
      if (isEditing && editId) {
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/scolarites/${editId}`,
          payload
        );
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/scolarites`,
          payload
        );
      }

      // ✅ Utiliser le message envoyé par le backend
      setMessage(
        res.data.message ||
          (isEditing ? "Paiement mis à jour !" : "Paiement ajouté !")
      );

      // Réinitialiser le formulaire
      setFormData({
        apprenant_id: "",
        montant: "",
        Reste: "",
        Scolarite: "",
        annee_scolaire: "",
      });
      setIsEditing(false);
      setEditId(null);

      fetchPaiements();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Erreur lors de l'enregistrement"
      );
    }
  };

  // Edit paiement
  const handleEdit = (p) => {
    setFormData({ ...p });
    setSelectedClass(p.classroom_id);
    setSelectedEleve(p.apprenant_id);
    setIsEditing(true);
    setEditId(p.id);
  };

  // Reset formulaire
  const handleCancel = () => {
    setFormData({
      apprenant_id: "",
      montant: "",
      Reste: "",
      Scolarite: "",
      annee_scolaire: "",
    });
    setIsEditing(false);
    setEditId(null);
    setSelectedEleve(""); // reset élève sélectionné
  };

  // Delete paiement (ouvre popup)
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowPopup(true);
  };

  // Confirmer suppression
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/scolarites/${deleteId}`
      );
      fetchPaiements();
    } catch (err) {
      console.error(err);
    } finally {
      setShowPopup(false);
      setDeleteId(null);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return null;

  const Sharingan = Number(user?.identifiant);

  return (
    <>
      {/* POPUP SUPPRESSION (GLOBAL, POUR 3 ET 4) */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirmation</h3>
            <p>Voulez-vous vraiment supprimer ce paiement ?</p>
            <div className="popup-buttons">
              <button className="btn btn-success" onClick={confirmDelete}>
                Oui
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowPopup(false)}
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {Sharingan === 4 && (
        <>
          <Header user={user} />
          <div className="main-content-eleves">
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
                  <option value="">-- Sélectionner une classe --</option>
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
            {/* POPUP SUPPRESSION */}

            {/* {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirmation</h3>
            <p>Voulez-vous vraiment supprimer ce paiement ?</p>
            <div className="popup-buttons">
              <button className="btn btn-success" onClick={confirmDelete}>
                Oui
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowPopup(false)}
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )} */}
            <div className="all-eleves">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier un paiement" : "Nouveau paiement"}
                </h2>
                <form onSubmit={handleSubmit} className="form-container">
                  <div className="team-scolarites">
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

                  <div className="team-scolarites">
                    <div className="form-group">
                      <label>Montant</label>
                      <input
                        type="number"
                        name="montant"
                        value={formData.montant}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Reste</label>
                      <input
                        type="text"
                        name="Reste"
                        value={formData.Reste}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="team-scolarites">
                    <div className="form-group">
                      <label>Scolarité</label>
                      <input
                        type="text"
                        name="Scolarite"
                        value={formData.Scolarite}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Année scolaire</label>
                      <input
                        type="text"
                        name="annee_scolaire"
                        value={formData.annee_scolaire}
                        onChange={handleChange}
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
                <div className="liste-scolarites">
  {scolarites.length ? (
    scolarites.map((p) => (
      <div key={p.id} className="scolarite-card">
        <h4>
          {p.nom} {p.prenom}
        </h4>

        <div className="scolarite-info">
          <p><strong>Montant payé:</strong> {p.montant} Fcfa</p>
          <p><strong>Reste:</strong> {p.Reste} Fcfa</p>
          <p><strong>Total Scolarité:</strong> {p.Scolarite} Fcfa</p>
          <p><strong>Année scolaire:</strong> {p.annee_scolaire}</p>
        </div>

        <div className="scolarite-actions">
          <button
            className="btn btn-warning"
            onClick={() => handleEdit(p)}
          >
            Modifier
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDeleteClick(p.id)}
          >
            Supprimer
          </button>
        </div>
      </div>
    ))
  ) : (
    <p style={{ textAlign: "center", width: "100%" }}>
      Aucun paiement trouvé
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
          <HeaderSec user={user} />
          <div className="main-content-eleves">
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
                  <option value="">-- Sélectionner une classe --</option>
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

            <div className="all-eleves">
              <div className="gauche">
                <h2>
                  {isEditing ? "Modifier un paiement" : "Nouveau paiement"}
                </h2>
                <form onSubmit={handleSubmit} className="form-container">
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
                    <label>Montant</label>
                    <input
                      type="number"
                      name="montant"
                      value={formData.montant}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Reste</label>
                    <input
                      type="text"
                      name="Reste"
                      value={formData.Reste}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Scolarité</label>
                    <input
                      type="text"
                      name="Scolarite"
                      value={formData.Scolarite}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Année scolaire</label>
                    <input
                      type="text"
                      name="annee_scolaire"
                      value={formData.annee_scolaire}
                      onChange={handleChange}
                    />
                  </div>
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
                <table className="table table-striped mt-4">
                  <thead>
                    <tr>
                      <th>Élève</th>
                      <th>Montant</th>
                      <th>Reste</th>
                      <th>Scolarité</th>
                      <th>Année</th>
                      <th>Modifier</th>
                      <th>Supprimer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scolarites.length ? (
                      scolarites.map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.nom} {p.prenom}
                          </td>
                          <td>{p.montant} Fcfa</td>
                          <td>{p.Reste} Fcfa</td>
                          <td>{p.Scolarite} Fcfa</td>
                          <td>{p.annee_scolaire}</td>
                          <td>
                            <button
                              className="btn btn-warning"
                              onClick={() => handleEdit(p)}
                            >
                              Modifier
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteClick(p.id)}
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          Aucun paiement trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Scolarites;
