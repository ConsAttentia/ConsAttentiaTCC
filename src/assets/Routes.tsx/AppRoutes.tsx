import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "../../pages/Register";
import Login from "../../pages/Login";
import Home from "../../pages/Home";
import Selecao from "../../pages/selecao";
import Explicacao from "../../pages/explicacao";
import Tohe from "../../pages/Tohe";


const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/selecao" element={<Selecao />} />
        <Route path="/explicacao" element={<Explicacao />} />
        <Route path="/tohe" element={<Tohe />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
