import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Explicacao.module.css";
import homeStyles from "./Home.module.css";
import brain from "../assets/TCCbosta2.png";
import fundoc from "../assets/fundoc.png";

const Explicacao: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [colorFilter, setColorFilter] = React.useState("none");
  const [wideLetters, setWideLetters] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);

  const pageClassName = [
    styles.page,
    colorFilter !== "none" ? homeStyles[colorFilter] : "",
    wideLetters ? homeStyles.wideLetters : "",
    highContrast ? homeStyles.highContrast : "",
  ].filter(Boolean).join(" ");

  const handleLogout = () => {
    localStorage.removeItem("consattentia-user-name");
    navigate("/");
  };

  return (
    <main className={pageClassName}>
      <img className={styles.backgroundArt} src={brain} alt="" />
      <div className={styles.overlay} />
      <header className={styles.header}>
        <button className={styles.brand} onClick={() => navigate("/home")}>
          <img src={fundoc} alt="ConsAttentia" />
        </button>
        <button
          className={styles.menuButton}
          aria-label="Abrir configurações"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <span></span><span></span><span></span>
        </button>
      </header>

      <section className={styles.content}>
        <h1>TOHE</h1>
        <p className={styles.introduction}>
          O teste consistirá em uma atividade constituída por 10 conjuntos de
          cartas. Cada conjunto contém cartas com desenhos/imagens/cenas que
          contam uma estória para que você possa organizar na ordem correta,
          dentro de um tempo determinado.
        </p>
        <p className={styles.details}>
          Tal atividade envolve principalmente a discriminação perceptiva
          visual (capacidade de identificar, diferenciar e comparar
          características visuais de objetos, formas, cores, tamanhos e letras)
          e raciocínio visual (habilidade de mover os olhos de forma coordenada
          para acompanhar objetos, analisar o ambiente e focar em detalhes).
        </p>
        <button className={styles.startButton} onClick={() => navigate("/tohe")}>
          Iniciar
        </button>
      </section>

      {isMenuOpen && (
        <>
          <button
            className={homeStyles.drawerOverlay}
            aria-label="Fechar configurações"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className={homeStyles.drawer} aria-label="Configurações de acessibilidade">
            <div className={homeStyles.drawerHeader}>
              <div>
                <span className={homeStyles.drawerKicker}>Personalize sua experiência</span>
                <h2>Configurações</h2>
              </div>
              <button
                className={homeStyles.closeButton}
                aria-label="Fechar configurações"
                onClick={() => setIsMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <section className={homeStyles.settingsSection}>
              <h3>Acessibilidade</h3>
              <div className={homeStyles.settingGroup}>
                <span className={homeStyles.settingLabel}>Filtros para daltonismo</span>
                <button className={colorFilter === "protanopia" ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setColorFilter(colorFilter === "protanopia" ? "none" : "protanopia")}>Protanopia</button>
                <button className={colorFilter === "deuteranopia" ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setColorFilter(colorFilter === "deuteranopia" ? "none" : "deuteranopia")}>Deuteranopia</button>
                <button className={colorFilter === "tritanopia" ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setColorFilter(colorFilter === "tritanopia" ? "none" : "tritanopia")}>Tritanopia</button>
              </div>
              <button className={wideLetters ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setWideLetters(!wideLetters)}>
                Espaçamento entre letras
              </button>
              <button className={highContrast ? homeStyles.settingActive : homeStyles.settingButton} onClick={() => setHighContrast(!highContrast)}>
                Alto contraste
              </button>
            </section>

            <button className={homeStyles.logoutButton} onClick={handleLogout}>
              Sair e voltar para o login
            </button>
          </aside>
        </>
      )}
    </main>
  );
};

export default Explicacao;
