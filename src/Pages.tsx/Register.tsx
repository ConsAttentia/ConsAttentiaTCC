import React, { useState } from "react";
import styles from "./Login.module.css"; 
import ModalMensagem from "../Componentes.tsx/ModalMensagem";
import Gray from "../assets/Gray.png";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setModalMessage("Preencha nome, email e senha.");
      return;
    }

    if (!auth) {
      setModalMessage("Configure as variáveis do Firebase para continuar.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      setModalMessage("Cadastro concluído ✅");
      setName("");
      setEmail("");
      setPassword("");
      setTimeout(() => navigate("/"), 1200);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro no cadastro!";

      setModalMessage(
        message.includes("email-already-in-use")
          ? "Este email já está cadastrado."
          : message.includes("weak-password")
            ? "A senha deve ter pelo menos 6 caracteres."
            : message
      );
    }
  };

  return (
    
    <div className={styles.background}>
      <div className={styles.shapeTop}></div>
      <div className={styles.shapeBottom}></div>

<div className={styles.logo}>
  <span className={styles.logoGreen}>Cons</span>
  <span className={styles.logoBlue}>Attentia</span>
</div>



      <div className={styles.card}>
        <img src={Gray} alt="User Icon" className={styles.icon} />
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSubmit} className={styles.button}>
          Cadastrar
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        className={styles.createAccount}
      >
        Já tenho uma conta
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

export default Register;
