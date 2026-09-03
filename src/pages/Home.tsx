import React, { useState } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import personagem from "../assets/personagem.png";
import fonte from "../assets/Fonte.png";

const Home: React.FC = () => {
  const userName = localStorage.getItem("consattentia-user-name") || "usuário";
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [colorFilter, setColorFilter] = useState("none");
  const [wideLetters, setWideLetters] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const pageClassName = [
    styles.page,
    colorFilter !== "none" ? styles[colorFilter] : "",
    wideLetters ? styles.wideLetters : "",
    highContrast ? styles.highContrast : "",
  ].filter(Boolean).join(" ");

  const handleLogout = () => {
    localStorage.removeItem("consattentia-user-name");
    navigate("/");
  };

  return (
    <main className={pageClassName}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src={fonte} alt="ConsAttentia" />
        </div>
        <div className={styles.headerRight}>
          <div className={styles.welcome}>
            <span>Bem-vindo,</span>
            <strong>{userName}</strong>
          </div>
          <button
            className={styles.menuButton}
            aria-label="Abrir configurações"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroLabel}>Foco que acompanha você</span>
          <p>
            O ConsAttentia é uma plataforma web desenvolvida com o objetivo principal de auxiliar pessoas que apresentam dificuldades relacionadas à atenção e à concentração, incluindo indivíduos com condições como o Transtorno do Déficit de Atenção e Hiperatividade (TDAH). A plataforma busca proporcionar aos usuários uma oportunidade de exercitar e desenvolver diferentes habilidades cognitivas por meio de atividades interativas e exercícios estruturados.
          </p>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            Voltar para login
          </button>
        </div>
        <div className={styles.heroArt}>
          <img src={personagem} alt="Pessoa realizando uma atividade no computador" />
        </div>
      </section>

      <div className={styles.sectionTitle}>Conheça a proposta</div>
      <section className={styles.cards}>
        <article className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon}>01</div>
            <span className={styles.cardTag}>Rotina</span>
          </div>
          <h2>Atenção no cotidiano</h2>
          <p>
            A ausência de estímulos e práticas voltadas ao desenvolvimento da atenção pode contribuir para dificuldades em manter o foco, procrastinação, problemas de organização, esquecimentos frequentes e aumento do estresse e da ansiedade. Isso pode afetar atividades acadêmicas, profissionais e pessoais.
          </p>
        </article>
        <article className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon}>02</div>
            <span className={styles.cardTag}>Acesso</span>
          </div>
          <h2>Acesso para todos</h2>
          <p>
            Muitas pessoas ainda não têm acesso a informações, ferramentas ou estratégias adequadas. O ConsAttentia busca contribuir com exercícios práticos, rápidos e acessíveis, desenvolvidos a partir de conhecimentos de psicologia e desenvolvimento de sistemas.
          </p>
        </article>
        <article className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon}>03</div>
            <span className={styles.cardTag}>Evolução</span>
          </div>
          <h2>Desenvolvimento contínuo</h2>
          <p>
            O aprimoramento da atenção pode aumentar a produtividade, melhorar a execução das tarefas e favorecer a retenção e organização das informações. Práticas consistentes também ajudam a reduzir distração, esquecimento e desorganização.
          </p>
        </article>
      </section>

      <footer className={styles.footer}>
        A atenção é uma habilidade cognitiva que pode ser estimulada e aprimorada continuamente.
      </footer>

      {isMenuOpen && (
        <>
          <button
            className={styles.drawerOverlay}
            aria-label="Fechar configurações"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className={styles.drawer} aria-label="Configurações de acessibilidade">
            <div className={styles.drawerHeader}>
              <div>
                <span className={styles.drawerKicker}>Personalize sua experiência</span>
                <h2>Configurações</h2>
              </div>
              <button
                className={styles.closeButton}
                aria-label="Fechar configurações"
                onClick={() => setIsMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <section className={styles.settingsSection}>
              <h3>Acessibilidade</h3>
              <div className={styles.settingGroup}>
                <span className={styles.settingLabel}>Filtros para daltonismo</span>
                <button className={colorFilter === "protanopia" ? styles.settingActive : styles.settingButton} onClick={() => setColorFilter(colorFilter === "protanopia" ? "none" : "protanopia")}>
                  Protanopia
                </button>
                <button className={colorFilter === "deuteranopia" ? styles.settingActive : styles.settingButton} onClick={() => setColorFilter(colorFilter === "deuteranopia" ? "none" : "deuteranopia")}>
                  Deuteranopia
                </button>
                <button className={colorFilter === "tritanopia" ? styles.settingActive : styles.settingButton} onClick={() => setColorFilter(colorFilter === "tritanopia" ? "none" : "tritanopia")}>
                  Tritanopia
                </button>
              </div>
              <button className={wideLetters ? styles.settingActive : styles.settingButton} onClick={() => setWideLetters(!wideLetters)}>
                Espaçamento entre letras
              </button>
              <button className={highContrast ? styles.settingActive : styles.settingButton} onClick={() => setHighContrast(!highContrast)}>
                Alto contraste
              </button>
            </section>

            <section className={styles.aboutSection}>
              <button className={styles.aboutButton} onClick={() => setIsAboutOpen(!isAboutOpen)}>
                <span>Sobre nós</span>
                <span>{isAboutOpen ? "−" : "+"}</span>
              </button>
              {isAboutOpen && (
                <p>
                  O ConsAttentia utiliza atividades interativas para estimular atenção, concentração e outras habilidades cognitivas de forma prática e acessível.
                </p>
              )}
            </section>

            <button className={styles.logoutButton} onClick={handleLogout}>
              Sair e voltar para o login
            </button>
          </aside>
        </>
      )}
    </main>
  );
};

export default Home;
