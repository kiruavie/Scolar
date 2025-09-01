import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/barre.css";

//const SOCKET_SERVER_URL = "http://localhost:3000"; // adapte à ton serveur

const Header = ({ user }) => {
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [ecoles, setEcoles] = useState([]);

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

  const handleLogout = () => {
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/utilisadestroy/logout`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log(res.data.message); // "Déconnecté avec succès"

        // Déconnexion socket
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        navigate("/connect"); // ✅ redirection gérée côté React
      })
      .catch((err) => {
        console.error("Erreur lors de la déconnexion", err);
      });
  };

  return (
    <>
      {/* Barre verticale */}
      <div className="all-barre-verticale">
        <div className="section-barre-verticale">
          <div className="corps-barre-verticale">
            <div className="logo">
              {ecoles.map((e) => (
                <div key={e.id} className="ecole-item">
                  {e.photoProfil ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/ecoles/${e.photoProfil}`}
                      alt={e.nom}
                      width={50}
                    />
                  ) : (
                    <img src="/assets/logo/scolar.jpg" alt="logo" width={50} />
                  )}
                  <div>{e.nom}</div>{" "}
                  
                </div>
              ))}

            </div>

            <div className="touche">
              <ul className="haut-touche">
                <li>
                  <Link to="/admin/dashboard">
                    <i className="bi bi-cart-check"></i> Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/eleves">
                    <i className="bi bi-truck"></i> Eleves
                  </Link>
                </li>
                {/* <li>
                  <Link to="/admin/sanctions">
                    <i className="bi bi-gear"></i> Sanction
                  </Link>
                </li> */}
                {/* <li>
                  <Link to="/admin/conduites">
                    <i className="bi bi-gear"></i> Conduite
                  </Link>
                </li> */}
                <li>
                  <Link to="/admin/classes">
                    <i className="bi bi-gear"></i> Classes
                  </Link>
                </li>
                <li>
                  <Link to="/admin/Matieres">
                    <i className="bi bi-gear"></i> Matieres
                  </Link>
                </li>
                <li>
                  <Link to="/admin/scolarites">
                    <i className="bi bi-gear"></i> Scolarite
                  </Link>
                </li>
                <li>
                  <Link to="/admin/ecoles">
                    <i className="bi bi-gear"></i> Ecoles
                  </Link>
                </li>
                <li>
                  <Link to="/admin/utilisateurs">
                    <i className="bi bi-gear"></i> Membres
                  </Link>
                </li>
                {/* <li>
                  <Link to="/admin/presences">
                    <i className="bi bi-gear"></i> Presences
                  </Link>
                </li> */}
                {/* <li>
                  <Link to="/admin/notes">
                    <i className="bi bi-gear"></i> Notes
                  </Link>
                </li> */}

                <li>
                  <Link to="/admin/mot_de_passe">
                    <i className="bi bi-gear"></i> Mot de passe
                  </Link>
                </li>
              </ul>

              <ul className="dead">
                <li>
                  <button
                    onClick={handleLogout}
                    className="btn btn-link text-danger"
                  >
                    <i className="bi bi-box-arrow-right"></i> Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Barre horizontale */}
      <div className="all-barre-horizontal">
        <div className="corps-horizontal">
          <div className="title-dash">
            <h1>Admin de {user?.school} </h1>
          </div>
          <div id="profil">
            <div id="conprofil">
              <span>{user?.nom_prenom}</span>
            </div>
            {/* <ul id="deco-profil">
              <li>
                <Link to="/user/pages/Parametres">
                  <i className="bi bi-gear"></i> Paramètre
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="btn btn-link text-danger"
                >
                  <i className="bi bi-box-arrow-right"></i> Déconnexion
                </button>
              </li>
            </ul> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
