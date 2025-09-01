import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Lheader/Header";
import HeaderSec from "../Lheader/HeaderSec";

import "../styles/barre.css";
import "../styles/matieres.css";

const MatieresPage = () => {
  const [matieres, setMatieres] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nom: "",
    coefficient: "",
    ecole_id: "",
  });

  const navigate = useNavigate();

  // Effacer les messages
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

  // Charger toutes les matières

  
const fetchMatieres = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/matieres`,
      {
        params: { ecole_id: user.school_chif }, // 🔥 filtrage par école
        withCredentials: true,
      }
    );
    setMatieres(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Erreur lors du chargement des matières :", err);
    setMatieres([]);
  }
};

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (user) {
    fetchMatieres();
  }
}, [user]);


  // Formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, ecole_id: user.school_chif };

      let res;
      if (isEditing && editId) {
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/matieres/${editId}`,
          dataToSend,
          { withCredentials: true }
        );
        setIsEditing(false);
        setEditId(null);
      } else {
        res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/matieres`,
          dataToSend,
          { withCredentials: true }
        );
      }
      setMessage(res.data.message || "Action réussie");
      fetchMatieres();
      setFormData({ nom: "", coefficient: "", ecole_id: user.school_chif });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  const handleEdit = (matiere) => {
    setFormData({
      nom: matiere.nom || "",
      coefficient: matiere.coefficient || "",
      ecole_id: user.school_chif || "",
    });
    setIsEditing(true);
    setEditId(matiere.id);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/matieres/${deleteId}`,
        { withCredentials: true }
      );
      fetchMatieres();
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
          <div className="main-content-matieres">

            <div className="all-matieres">
              <div className="gauche">
                <h2>{isEditing ? "Modifier une matière" : "Ajouter une matière"}</h2>
                <form onSubmit={handleSubmit} className="form-container">

                  <div className="team-matieres">
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
                      <label>Coefficient</label>
                      <input
                        type="number"
                        name="coefficient"
                        value={formData.coefficient}
                        onChange={handleChange}
                        required
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

              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette matière ?</p>
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
<div className="liste-matieres">
  {Array.isArray(matieres) && matieres.length > 0 ? (
    matieres.map((m) => (
      <div key={m.id} className="matiere-card">
        <h4>{m.nom}</h4>
        {/* <p><strong>Coefficient:</strong> {m.coefficient}</p> */}

        <div className="matiere-actions">
          <button
            className="btn btn-warning"
            onClick={() => handleEdit(m)}
          >
            Modifier
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDeleteClick(m.id)}
          >
            Supprimer
          </button>
        </div>
      </div>
    ))
  ) : (
    <p style={{ textAlign: "center", width: "100%" }}>
      Aucune matière trouvée
    </p>
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
          <div className="main-content-matieres">
            <div className="all-matieres">
              <div className="gauche">
                <h2>{isEditing ? "Modifier une matière" : "Ajouter une matière"}</h2>
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
                    <label>Coefficient</label>
                    <input
                      type="number"
                      name="coefficient"
                      value={formData.coefficient}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    {isEditing ? "Mettre à jour" : "Enregistrer"}
                  </button>
                  {message && <p className="Message3rror">{message}</p>}
                </form>
              </div>

              <div className="droite">
                {showConfirm && (
                  <div className="popup-overlay">
                    <div className="popup">
                      <p>⚠️ Voulez-vous vraiment supprimer cette matière ?</p>
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
                  <table className="table table-striped mt-4">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Coefficient</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(matieres) && matieres.length > 0 ? (
                        matieres.map((m) => (
                          <tr key={m.id}>
                            <td>{m.nom}</td>
                            <td>{m.coefficient}</td>
                            <td>
                              <button
                                className="btn btn-warning"
                                onClick={() => handleEdit(m)}
                              >
                                Modifier
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteClick(m.id)}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: "center" }}>
                            Aucune matière trouvée
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
    </>
  );
};

export default MatieresPage;
