import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BoasVindas from "../../pages/BoasVindas";
import Home from "../../pages/Home";
import Selecao from "../../pages/selecao";
import Tohe from "../../pages/Tohe";
import Configuracoes from "../../pages/Configuracoes";
import AATS from "../../pages/AATS";
import ADAA from "../../pages/ADAA";
import AATA from "../../pages/AATA";
import { AccessibilityProvider } from "../../componentes/Acessibilidade";
import { AuthProvider } from "../../componentes/AuthProvider";
import Vlibras from "../../componentes/Vlibras";

const Register = lazy(() => import("../../pages/Register"));
const Login = lazy(() => import("../../pages/Login"));
const Perfil = lazy(() => import("../../pages/Perfil"));

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <AuthProvider>
          <Suspense fallback={<p role="status">Carregando página...</p>}>
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
          </Suspense>
          <Vlibras />
        </AuthProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
