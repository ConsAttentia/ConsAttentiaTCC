import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../../pages/Register";
import Login from "../../pages/Login";
import BoasVindas from "../../pages/BoasVindas";
import Home from "../../pages/Home";
import Selecao from "../../pages/selecao";
import Tohe from "../../pages/Tohe";
import Perfil from "../../pages/Perfil";
import Configuracoes from "../../pages/Configuracoes";
import AATS from "../../pages/AATS";
import ADAA from "../../pages/ADAA";
import AATA from "../../pages/AATA";
import { AccessibilityProvider } from "../../componentes/Acessibilidade";
import Vlibras from "../../componentes/Vlibras";


const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <Routes>
          <Route
            path="/"
            element={localStorage.getItem("consattentia-welcome-completed") === "true" ? <Navigate to="/login" replace /> : <BoasVindas />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/selecao" element={<Selecao />} />
          <Route path="/tohe" element={<Tohe />} />
          <Route path="/aats" element={<AATS />} />
          <Route path="/adaa" element={<ADAA />} />
          <Route path="/aata" element={<AATA />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
        <Vlibras />
      </AccessibilityProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
