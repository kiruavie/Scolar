import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Lheader/Header";

import "../styles/barre.css";
import "../styles/ecoles.css";

const Ecoles = () => {
  const [user, setUser] = useState(null);
  const [ecoles, setEcoles] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    addresse: "",
    telephone_1: "",
    telephone_2: "",
    photoProfil: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Effacer messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Récupérer utilisateur connecté
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

  // Récupérer les écoles
  useEffect(() => {
    if (!user?.school_chif) return;

    const fetchEcoles = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/ecoles`,
          {
            params: { ecole_id: user.school_chif },
            withCredentials: true,
          }
        );
        setEcoles(res.data);
      } catch (err) {
        console.error(err);
        setEcoles([]);
      }
    };

    fetchEcoles();
  }, [user]);

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photoProfil") {
      setFormData((prev) => ({ ...prev, photoProfil: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Ajouter ou modifier une école
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) formPayload.append(key, formData[key]);
      });

      if (editingId) {
        // Update
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/ecoles/${editingId}`,
          formPayload,
          { withCredentials: true }
        );
        setMessage("École mise à jour !");
      } else {
        // Vérifier si l'utilisateur a déjà une école
        if (ecoles.length > 0) {
          setMessage("Vous ne pouvez pas créer une autre école !");
          return;
        }

        // Create
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/ecoles`,
          formPayload,
          { withCredentials: true }
        );
        setMessage(res.data.message || "École créée !");
      }

      //   fetchEcoles();
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  //   const handleDelete = async (id) => {
  //     if (!window.confirm("Voulez-vous vraiment supprimer cette école ?")) return;
  //     try {
  //       await axios.delete(
  //         `${import.meta.env.VITE_API_URL}/api/ecoles/${id}`,
  //         { withCredentials: true }
  //       );
  //       setMessage("École supprimée !");
  //       fetchEcoles();
  //     } catch (err) {
  //       console.error(err);
  //       setMessage("Erreur lors de la suppression");
  //     }
  //   };

  const handleEdit = (ecole) => {
    setFormData({
      nom: ecole.nom,
      addresse: ecole.addresse || "",
      telephone_1: ecole.telephone_1 || "",
      telephone_2: ecole.telephone_2 || "",
      photoProfil: null,
    });
    setEditingId(ecole.id);
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      addresse: "",
      telephone_1: "",
      telephone_2: "",
      photoProfil: null,
    });
    setEditingId(null);
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
                <h2>{editingId ? "Modifier" : "Ajouter"} une école</h2>
                <form
                  onSubmit={handleSubmit}
                  className="form-container"
                  encType="multipart/form-data"
                >
                  <div className="team-ecoles">
                      <div className="form-group">
                      <label>Photo</label>
                      <input
                        type="file"
                        name="photoProfil"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="team-ecoles">
                    <div className="form-group">
                      <label>Nom de l'école</label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Addresse</label>
                      <input
                        type="text"
                        name="addresse"
                        value={formData.addresse}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="team-ecoles">
                    <div className="form-group">
                      <label>Téléphone 1</label>
                      <input
                        type="tel"
                        name="telephone_1"
                        value={formData.telephone_1}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Téléphone 2</label>
                      <input
                        type="tel"
                        name="telephone_2"
                        value={formData.telephone_2}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="envoie">
                                        <button type="submit" className="btn-envoie btn-primary">
                      {editingId ? "Mettre à jour" : "Ajouter"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn-envoie btn-secondary ml-2"
                        onClick={resetForm}
                      >
                        Annuler
                      </button>
                    )}
                  </div>

                  {message && <p className="Message3rror">{message}</p>}
                </form>
              </div>

              <div className="droite">
              
<div className="liste-ecoles">
  {ecoles.length ? (
    ecoles.map((e) => (
      <div key={e.id} className="ecole-card">
        <div className="ecole-photo">
          {e.photoProfil ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/uploads/ecoles/${e.photoProfil}`}
              alt={e.nom}
              width={100}
            />
          ) : (
            "—"
          )}
        </div>
        <h4>{e.nom}</h4>
        <p><strong>Adresse:</strong> {e.addresse || "—"}</p>
        <p><strong>Téléphone 1:</strong> {e.telephone_1 || "—"}</p>
        <p><strong>Téléphone 2:</strong> {e.telephone_2 || "—"}</p>

        

        <div className="ecole-actions">
          <button
            className="btn btn-warning btn-sm"
            onClick={() => handleEdit(e)}
          >
            Modifier
          </button>
          {/* Si tu veux, tu peux aussi ajouter le bouton Supprimer ici */}
        </div>
      </div>
    ))
  ) : (
    <p style={{ textAlign: "center", width: "100%" }}>
      Aucune école trouvée
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

export default Ecoles;
