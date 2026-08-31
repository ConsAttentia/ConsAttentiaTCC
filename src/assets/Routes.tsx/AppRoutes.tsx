import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "../../Pages.tsx/Register";
import Login from "../../Pages.tsx/Login";


const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
