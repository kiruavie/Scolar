import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Lheader/Header";

import "../styles/barre.css";
import "../styles/mot2passe.css";

const Inscrip = () => {
  const [roles, setRoles] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [filterMatiere, setFilterMatiere] = useState("");

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nom_prenom: "",
    email: "",
    telephone: "",
    role_id: "",
    ecole_id: "",
    matiere_id: "",
    password_hash: "",
    confirmation: "",
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

  useEffect(() => {
    if (!user) return;

    const fetchFilteredUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/utilisateurs/filtered`,
          {
            params: {
              ecole_id: user.school_chif,
              role_id: filterRole || undefined, // undefined si vide
              matiere_id: filterMatiere || undefined,
            },
            withCredentials: true,
          }
        );
        setUtilisateurs(res.data);
      } catch (err) {
        console.error(err);
        setUtilisateurs([]);
      }
    };

    fetchFilteredUsers();
  }, [user, filterRole, filterMatiere]);

  // Charger rôles, matières et utilisateurs
  const fetchData = async () => {
    try {
      const [rolesRes, matieresRes, usersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/roles`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/matieres`, {
          params: { ecole_id: user.school_chif },
          withCredentials: true,
        }),
        axios.get(
          `${import.meta.env.VITE_API_URL}/api/utilisateurs/ecole/${user.school_chif}`,
          { withCredentials: true }
        ),
      ]);
      setRoles(rolesRes.data);
      setMatieres(Array.isArray(matieresRes.data) ? matieresRes.data : []);
      setUtilisateurs(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Gestion formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ajouter ou modifier un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, ecole_id: user.school_chif };

      if (editingId) {
        // Update
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/utilisateurs/${editingId}`,
          dataToSend,
          { withCredentials: true }
        );
        setMessage("Utilisateur mis à jour !");
      } else {
        // Create
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/utilisateurs/registerUser`,
          dataToSend,
          { withCredentials: true }
        );
        setMessage(res.data.message || "Inscription réussie");
      }

      // Refresh + reset
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  // Supprimer

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?"))
  //     return;
  //   try {
  //     await axios.delete(
  //       `${import.meta.env.VITE_API_URL}/api/utilisateurs/${id}`,
  //       { withCredentials: true }
  //     );
  //     setMessage("Utilisateur supprimé !");
  //     fetchData();
  //   } catch (err) {
  //     console.error(err);
  //     setMessage("Erreur lors de la suppression");
  //   }
  // };

  // Pré-remplir pour modification
  const handleEdit = (utilisateur) => {
    setFormData({
      nom_prenom: utilisateur.nom_prenom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      role_id: utilisateur.role_id,
      ecole_id: utilisateur.ecole_id,
      matiere_id: utilisateur.matiere_id,
      password_hash: "",
      confirmation: "",
    });
    setEditingId(utilisateur.id);
  };

  const resetForm = () => {
    setFormData({
      nom_prenom: "",
      email: "",
      telephone: "",
      role_id: "",
      ecole_id: user.school_chif,
      matiere_id: "",
      password_hash: "",
      confirmation: "",
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
            <div className="selection-filtre">
              <div className="filters">
                <div className="team-mot2passes">
                  
                  <div className="form-group">
                        <select
                      value={filterRole}
                      onChange={(e) =>
                        setFilterRole(e.target.value ? Number(e.target.value) : "")
                      }
                    >
                      <option value="">-- Filtrer par rôle --</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                      <select
                      value={filterMatiere}
                      onChange={(e) =>
                        setFilterMatiere(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                    >
                      <option value="">-- Filtrer par matière --</option>
                      {matieres.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="all-eleves">
              {/* FORM */}

              {Sharingan === 4 && (
                <>
                  {editingId && (
                    <>
                      <div className="gauche">
                        <h2>Réinitialisation </h2>

                        <form
                          onSubmit={handleSubmit}
                          className="form-container"
                        >
                          {editingId && (
                            <>
                              <div className="team-mot2passes">
                                  <div className="form-group">
                                  <label>Nom complet</label>
                                  <input
                                    type="text"
                                    name="nom_prenom"
                                    value={formData.nom_prenom}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                  />
                                </div>

  

                                <div className="form-group">
                                  <label>Nouveau mot de passe</label>
                                  <input
                                    type="text"
                                    name="password_hash"
                                    value={formData.password_hash}
                                    onChange={handleChange}
                                    required
                                  />
                                </div>
                              </div>

                            </>
                          )}

                          {editingId && (
                            <>
                              <div className="envoie">
                                  <button
                                  type="button"
                                  className="btn-envoie2 btn-secondary ml-2"
                                  onClick={resetForm}
                                >
                                  Annuler
                                </button>

                                <button type="submit" className="btn-envoie btn-primary">
                                  Mettre a jour
                                </button>
                              </div>
                            </>
                          )}
                          {message && <p className="Message3rror">{message}</p>}
                        </form>
                      </div>
                    </>
                  )}
                

              {/* LISTE */}
              <div className="droite">
                <div className="liste-mot2passes">
  {utilisateurs
    .filter((u) => !filterRole || u.role_id === Number(filterRole))
    .filter((u) => !filterMatiere || u.matiere_id === Number(filterMatiere))
    .map((u) => (
      <div className="col-md-4 mb-3" key={u.id}>
        <div className="mot2passe-card card shadow-sm h-100">
          <div className="mot2pase-info">
            <h5 className="card-title">{u.nom_prenom}</h5>
            <p className="card-text text-muted">{u.role_nom}</p>
            <div className="mot2passe-actions">
                <button
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit(u)}
              >
                Modifier
              </button>
              {/* 
              <button 
                className="btn btn-danger btn-sm ms-2" 
                onClick={() => handleDelete(u.id)}
              >
                Supprimer
              </button> 
              */}
            </div>
          </div>
        </div>
      </div>
    ))}
</div>

              </div>
            </>
              )}
            </div>
            
          </div>
        </>
      )}
    </>
  );
};

export default Inscrip;
