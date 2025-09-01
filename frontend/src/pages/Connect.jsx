import React, { useEffect, useState } from "react";
// import { Link } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./styles/Connect.css";

const Connect = () => {
  const navigate = useNavigate();

  const [livreurData, setLivreurData] = useState({
    email: "",
    password_hash: "",
  });

  const [message, setMessage] = useState("");
  const [messageL, setMessageL] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 4000);
      return () => clearTimeout(timer); // Nettoyage si le message change avant 4s
    }
  }, [message]);

  useEffect(() => {
    if (messageL) {
      const timer = setTimeout(() => {
        setMessageL("");
      }, 4000);
      return () => clearTimeout(timer); // Nettoyage si le message change avant 4s
    }
  }, [messageL]);

  const handleLivreurSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/utilisateurs/loginUser`,
        livreurData,
        {
          withCredentials: true,
        }
      );
      console.log("✅ Livreur connecté :", res.data);
      navigate("/admin/Dashboard");
    } catch (err) {
      setMessageL(err.response?.data?.message || "Erreur inconnue");
    }
  };

  return (
    <div className="connect-page">
      {/* <div className='acc-header'>
        <div className="logo">
          <Link to="/"><img src="/assets/logo/logo.png" alt="" /></Link>
        </div>

        <div className='insc-conn'>
          <div>
            <Link to="/inscrip">Inscription</Link>
          </div>
        </div>
      </div> */}

      <div className="giga">
        <div className="giga-form">
          <div className="all-form">
            <div className="lpm">
              {/* Mes carrés de design */}
              {/* <div className="un"></div>
                <div className="deux"></div>
                <div className="trois"></div> */}
              {/* Mes carrés de design */}
              <h1>Connexion</h1>
              <form onSubmit={handleLivreurSubmit}>
                <div className="tgh">
                  <div className="seul">
                    <div className="btn14">
                      {/* <label htmlFor="email">Email</label> */}
                      <i className="bi bi-envelope-fill"></i>
                      <input
                        type="email"
                        placeholder="Entrez votre email .."
                        name="email"
                        id="email"
                        value={livreurData.email}
                        onChange={(e) =>
                          setLivreurData({
                            ...livreurData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="meute">
                    <div className="btn1">
                      {/* <label htmlFor="password_hash">Mot de passe</label> */}
                      <i className="bi bi-lock-fill"></i>
                      <input
                        type="password"
                        placeholder="Mot de passe"
                        name="password_hash"
                        id="motdepasse_livreur"
                        value={livreurData.password_hash}
                        onChange={(e) =>
                          setLivreurData({
                            ...livreurData,
                            password_hash: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="btn2">
                    <input type="submit" value="Se connecter" />
                  </div>

                  {messageL && <p style={{ color: "red" }}>{messageL}</p>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
