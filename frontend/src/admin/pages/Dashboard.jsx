//=============== Dashboard.jsx ===============

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HeaderEdu from "../Lheader/HeaderEdu";
import HeaderEns from "../Lheader/HeaderEns";
import HeaderSec from "../Lheader/HeaderSec";
import Header from "../Lheader/Header";

import "../styles/barre.css";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [countEleves, setCountEleves] = useState(0);
  const [countClasses, setCountClasses] = useState(0);

  const [countRole2Users, setCountRole2Users] = useState(0);

  const [apprenants, setApprenants] = useState([]);
    const [eleves, setElveves] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchTopAbsencesApprenants = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/apprenants/top`,
          {
            params: { ecole_id: user.school_chif }, // 👈 très important !
            withCredentials: true,
          }
        );
        console.log("✅ Top apprenants reçus :", res.data);
        setElveves(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des apprenants:", error);
      }
    };

    fetchTopAbsencesApprenants();
  }, [user]);


  useEffect(() => {
    if (!user) return;

    const fetchTopApprenants = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/apprenants/top-sanctions`,
          {
            params: { ecole_id: user.school_chif }, // 👈 très important !
            withCredentials: true,
          }
        );
        console.log("✅ Top apprenants reçus :", res.data);
        setApprenants(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des apprenants:", error);
      }
    };

    fetchTopApprenants();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        // Apprenants
        const resEleves = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/apprenants/count`,
          { params: { ecole_id: user.school_chif } }
        );
        setCountEleves(resEleves.data.total);

        // Classes
        const resClasses = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/classrooms/count`,
          { params: { ecole_id: user.school_chif } }
        );
        setCountClasses(resClasses.data.totalClass);

        // Utilisateurs role_id = 2
        const resUsers = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/utilisateurs/count-role2`,
          { params: { ecole_id: user.school_chif } }
        );
        setCountRole2Users(resUsers.data.total);
      } catch (err) {
        console.error("Erreur lors de la récupération des compteurs :", err);
      }
    };

    fetchCounts();
  }, [user]);

  // Charger info User

  useEffect(() => {
    // Vérifier si l'utilisateurs est connecté
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/utilisateurs/me`,
          {
            withCredentials: true, // pour inclure les cookies/session
          }
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

  const Sharingan = Number(user?.identifiant);

  if (loading || !user) return <p>Chargement...</p>;

  return (
    <>
      {/* Domaine des Educateurs */}
      {Sharingan === 1 && (
        <>
          <div className="mes-barre">
            <div className="mes-barre">
              <HeaderEdu user={user} />
            </div>
          </div>
        </>
      )}

      {Sharingan === 2 && (
        <>
          <div className="mes-barre">
            <div className="mes-barre">
              <HeaderEns user={user} />
            </div>
          </div>
          <div className="main-content-dashboard" id="continer">
            <h1>Bienvenue a vous Mr {user?.nom_prenom} !</h1>
          </div>
        </>
      )}

      {Sharingan === 3 && (
        <>
          <div className="mes-barre">
            <div className="mes-barre">
              <HeaderSec user={user} />
            </div>
          </div>
          <div className="main-content-dashboard" id="continer">
            <h1>Bienvenue a vous Mr {user?.nom_prenom} !</h1>
          </div>
        </>
      )}

      {Sharingan === 4 && (
        <>
          <div className="mes-barre">
            <div className="mes-barre">
              <Header user={user} />
            </div>
          </div>
          <div className="main-content-dashboard" id="continer">
            <div className="compteur">
              <div className="elevescompt">
                <span>Nombre d'élèves</span>
                <p id="EC">
                  <span>{countEleves}</span>
                </p>
              </div>
              <div className="classecompt">
                <span>Nombre de classe</span>
                <p id="CC">
                  <span> {countClasses} </span>
                </p>
              </div>
              <div className="matierecompt">
                <span>Nombre d'enseignant</span>
                <p id="MC">
                  <span> {countRole2Users} </span>
                </p>
              </div>
            </div>
            <div className="deuxieme-dash">
              <div className="cote-droit">
                <div className="cinq-sanctions">
                  <h3>Top 5 des eleves sanctionnées</h3>
  <table className="min-w-full border-collapse bg-white shadow rounded-lg overflow-hidden">
    <tbody>
      {apprenants.map((a) => (
        <tr key={a.id} className="border-t hover:bg-gray-50">
          <th className="px-4 py-2">{a.nom}</th>
          <th className="px-4 py-2">{a.prenom}</th>
          <th className="px-4 py-2">{a.classe}</th>
          <th className="px-4 py-2 text-red-600 font-bold">{a.total_sanctions}</th>
        </tr>
      ))}
    </tbody>
  </table>


                </div>
                <div className="cinq-scolarites">
      <h4 className="text-xl font-bold mb-4">Top 5 eleves absent(e)s & Retards</h4>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
           
            <th className="border px-4 py-2">Nom</th>
            <th className="border px-4 py-2">Prénom</th>
            <th className="border px-4 py-2">Classe</th>
            <th className="border px-4 py-2">Abs</th>
            <th className="border px-4 py-2">Rtds</th>
          </tr>
        </thead>
        <tbody>
          {eleves.map((a) => (
            <tr key={a.id} className="text-center">
              <td className="border px-4 py-2">{a.nom}</td>
              <td className="border px-4 py-2">{a.prenom}</td>
              <td className="border px-4 py-2">{a.classe}</td>
              <td className="border px-4 py-2">{a.total_absences}</td>
              <td className="border px-4 py-2">{a.total_retards}</td>
            </tr>
          ))}
        </tbody>
      </table>
                </div>
              </div>
              <div className="cote-gauche">
                <div className="liste-connecte"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
