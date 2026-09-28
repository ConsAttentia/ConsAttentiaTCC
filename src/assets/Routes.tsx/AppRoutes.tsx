import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "../../pages/Register";
import Login from "../../pages/Login";
import Home from "../../pages/Home";
import Selecao from "../../pages/selecao";
import Tohe from "../../pages/Tohe";
import Perfil from "../../pages/Perfil";
import Configuracoes from "../../pages/Configuracoes";
import AATS from "../../pages/AATS";
import { AccessibilityProvider } from "../../componentes/Acessibilidade";
import Vlibras from "../../componentes/Vlibras";


const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/selecao" element={<Selecao />} />
          <Route path="/tohe" element={<Tohe />} />
          <Route path="/aats" element={<AATS />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
        <Vlibras />
      </AccessibilityProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
