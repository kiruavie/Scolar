import React from 'react';
import { Routes, Route } from 'react-router-dom';



import Dashboard from './admin/pages/Dashboard';
import Eleves from './admin/pages/Eleves'; 
import Sanctions from './admin/pages/Sanctions'; 
import Notes from './admin/pages/Notes'; 
import Presences from './admin/pages/Presences';
import Utilisateurs from './admin/pages/Utilisateurs';
import Ecoles from './admin/pages/Ecoles';
import Conduites from './admin/pages/Conduites'; 
import Classes from './admin/pages/Classes';
import Scolarites from './admin/pages/Scolarites'; 
import Matieres from './admin/pages/Matieres';
import Parametres from './admin/pages/Parametres';

import School from './pages/School';
import Connect from './pages/Connect';
import Inscrip from './pages/Inscrip';



const RoutesConfig = () => {
  return (
    <Routes>
      {/* Redirection racine */}
      <Route path="/" element={<Connect />} />

      {/* Pages publiques */}
      <Route path="/connect" element={<Connect />} />
      <Route path="/superAdmin/inscrip-school" element={<School />} />
      <Route path="/superAdmin/inscrip-admin" element={<Inscrip />} />


    {/* --------------------------------------- */}


 {/* Pages admin */}
  <Route path="/admin/dashboard" element={<Dashboard />} />
  <Route path="/admin/eleves" element={<Eleves />} />
  <Route path="/admin/scolarites" element={<Scolarites />} />
  <Route path="/admin/sanctions" element={<Sanctions />} />
  <Route path="/admin/presences" element={<Presences />} />
  <Route path="/admin/conduites" element={<Conduites />} />
  <Route path="/admin/notes" element={<Notes />} />
  <Route path="/admin/classes" element={<Classes />} />
  <Route path="/admin/Matieres" element={<Matieres />} />
  <Route path="/admin/mot_de_passe" element={<Parametres />} />
    <Route path="/admin/utilisateurs" element={<Utilisateurs />} />
  <Route path="/admin/ecoles" element={<Ecoles />} />

    </Routes>
  );
};

export default RoutesConfig;
