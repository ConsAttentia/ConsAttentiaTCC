import React, { useState } from "react";
import styles from "./Login.module.css";
import ModalMensagem from "../componentes/ModalMensagem";
import Gray from "../assets/Gray.png";
import FundoC from "../assets/fundoc.png";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setModalMessage("Preencha o email e a senha.");
      return;
    }

    if (!auth) {
      setModalMessage("Configure as variáveis do Firebase para continuar.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/home");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro no login!";

      setModalMessage(
        message.includes("invalid-credential") || message.includes("user-not-found")
          ? "Email ou senha inválidos."
          : message
      );
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.shapeTop}></div>
      <div className={styles.shapeBottom}></div>
      <div className={styles.logo}>
        <img src={FundoC} alt="ConsAttentia" />
      </div>

      <div className={styles.card}>
        <img src={Gray} alt="User Icon" className={styles.icon} />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSubmit} className={styles.button}>
          Login
        </button>
      </div>

 
      <button
        onClick={() => navigate("/register")}
        className={styles.createAccount}
      >
        Criar conta
      </button>

      {modalMessage && (
        <ModalMensagem
          message={modalMessage}
          onClose={() => setModalMessage(null)}
        />
      )}
    </div>
  );
};

export default Login;
