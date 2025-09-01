import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../Lheader/Header";

import "../styles/barre.css";
import "../styles/utilisateurs.css";

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
          <div className="main-content-utilisateurs">
            <div className="selection-filtre">
              <div className="filters">
                <div className="team-utilisateurs">
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
            <div className="all-utilisateurs">
              {/* FORM */}
              <div className="gauche">
                <h2>{editingId ? "Modifier" : "Ajouter"} un utilisateur</h2>
                <form onSubmit={handleSubmit} className="form-container">
                  <div className="team-utilisateurs">
                    <div className="form-group">
                      <label>Nom complet</label>
                      <input
                        type="text"
                        name="nom_prenom"
                        value={formData.nom_prenom}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Téléphone</label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="team-utilisateurs">
                      <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Statut</label>
                      <select
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Sélectionner un statut --</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="team-utilisateurs">
                                      {/* Afficher Matière seulement si Enseignant est sélectionné */}
                  {roles.find((r) => r.id === parseInt(formData.role_id))
                    ?.nom === "Enseignant" && (
                    <div className="form-group">
                      <label>Matière</label>
                      <select
                        name="matiere_id"
                        value={formData.matiere_id}
                        onChange={handleChange}
                      >
                        <option value="">-- Sélectionner une matière --</option>
                        {matieres.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  </div>

                  <div className="team-utilisateurs">
                    {!editingId && (
                    <>
                      <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                          type="password"
                          name="password_hash"
                          value={formData.password_hash}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Confirmation</label>
                        <input
                          type="password"
                          name="confirmation"
                          value={formData.confirmation}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </>
                  )}
                  </div>

                  <div className="envoie">
                      <button type="submit" className="btn-envoie btn-primary">
                      {editingId ? "Mettre à jour" : "S'enregistrer"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn-envoie2 btn-secondary ml-2"
                        onClick={resetForm}
                      >
                        Annuler
                      </button>
                    )}
                  </div>


                  {message && <p className="Message3rror">{message}</p>}
                </form>
              </div>

              {/* LISTE */}
              <div className="droite">
            
                <div className="liste-utilisateurs">
  {utilisateurs
    .filter((u) => !filterRole || u.role_id === Number(filterRole))
    .filter((u) => !filterMatiere || u.matiere_id === Number(filterMatiere))
    .length > 0 ? (
    utilisateurs
      .filter((u) => !filterRole || u.role_id === Number(filterRole))
      .filter((u) => !filterMatiere || u.matiere_id === Number(filterMatiere))
      .map((u) => {
        const role = roles.find((r) => r.id === u.role_id);
        const matiere = matieres.find((m) => m.id === u.matiere_id);

        return (
          <div key={u.id} className="utilisateur-card">
            <h4>{u.nom_prenom}</h4>
            <p><strong>Email:</strong> {u.email}</p>
            <p><strong>Téléphone:</strong> {u.telephone}</p>
            <p><strong>Matière:</strong> {matiere ? matiere.nom : "Aucune"}</p>
            <p><strong>Rôle:</strong> {role ? role.nom : "—"}</p>

            <div className="utilisateur-actions">
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit(u)}
              >
                Modifier
              </button>
              {/* <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(u.id)}
              >
                Supprimer
              </button> */}
            </div>
          </div>
        );
      })
  ) : (
    <p style={{ textAlign: "center", width: "100%" }}>
      Aucun utilisateur trouvé
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

export default Inscrip;
