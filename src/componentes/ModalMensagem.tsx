import React from "react";
import styles from "./ModalMensagem.module.css";

interface ModalProps {
  message: string;
  onClose: () => void;
}

const ModalMensagem: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default ModalMensagem;
