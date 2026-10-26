import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useAccessibility } from "./AcessibilidadeContext";
import styles from "./MenuConta.module.css";

export default function MenuConta() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { preferences } = useAccessibility();
  const accessibilityClasses = [
    "accessibility-widget",
    preferences.colorFilter !== "none" ? `accessibility-${preferences.colorFilter}` : "",
    preferences.highContrast ? "accessibility-high-contrast" : "",
  ].filter(Boolean);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);
//ME MATA DE UMA VEZ 
  const navigateTo = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      localStorage.removeItem("consattentia-user-name");
      navigate("/", { replace: true });
    } catch {
      setError("Não foi possível sair. Tente novamente.");
    }
  };

  return (
    <>
      <button
        className={styles.trigger}
        type="button"
        aria-label="Abrir menu da conta"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <span /><span /><span />
      </button>
      {isOpen && createPortal(
        <>
          <button
            className={styles.overlay}
            type="button"
            aria-label="Fechar menu da conta"
            onClick={() => setIsOpen(false)}
          />
          <aside className={`${styles.drawer} ${accessibilityClasses.join(" ")}`} role="dialog" aria-modal="true" aria-labelledby="account-menu-title">
            <div className={styles.header}>
              <div>
                <span className={styles.kicker}>ConsAttentia</span>
                <h2 id="account-menu-title">Sua conta</h2>
              </div>
              <button className={styles.close} type="button" aria-label="Fechar menu" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <nav className={styles.navigation} aria-label="Conta e preferências">
              <button type="button" onClick={() => navigateTo("/perfil")}>Perfil</button>
              <button type="button" onClick={() => navigateTo("/configuracoes")}>Configurações</button>
            </nav>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.logout} type="button" onClick={handleLogout}>Sair da conta</button>
          </aside>
        </>,
        document.body,
      )}
    </>
  );
}