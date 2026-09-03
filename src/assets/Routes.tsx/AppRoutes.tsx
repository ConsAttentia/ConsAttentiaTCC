import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "../../pages/Register";
import Login from "../../pages/Login";
import Home from "../../pages/Home";


const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
