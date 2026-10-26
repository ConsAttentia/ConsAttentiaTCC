import { useNavigate } from "react-router-dom";
import { useAccessibility } from "../componentes/AcessibilidadeContext";
import logo from "../assets/fundoc.png";
import styles from "./BoasVindas.module.css";

export default function BoasVindas() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useAccessibility();

  const start = () => {
    localStorage.setItem("consattentia-welcome-completed", "true");
    navigate("/login");
  };

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.header}>
        <img className={styles.logo} src={logo} alt="ConsAttentia" />
        <span className={styles.headerNote}>Cuidado e atenção em cada etapa</span>
      </header>

      <section className={styles.intro} aria-labelledby="welcome-title">
        <p className={styles.eyebrow}>Um espaço feito para você</p>
        <h1 id="welcome-title">Bem-vindo ao ConsAttentia</h1>
        <p className={styles.description}>
          Explore atividades e acompanhe seu desenvolvimento em uma experiência
          acolhedora, com recursos que você pode adaptar às suas necessidades.
        </p>
      </section>

      <section className={styles.accessibility} aria-labelledby="accessibility-title">
        <div className={styles.accessibilityHeading}>
          <div>
            <p className={styles.eyebrow}>Sua experiência, do seu jeito</p>
            <h2 id="accessibility-title">Acessibilidade</h2>
          </div>
          <span className={styles.savedNote}>Suas escolhas ficam salvas neste dispositivo</span>
        </div>

        <div className={styles.controls}>
          <label className={styles.filterField}>
            Filtro de cores
            <select
              value={preferences.colorFilter}
              onChange={(event) => updatePreferences({ colorFilter: event.target.value as typeof preferences.colorFilter })}
            >
              <option value="none">Sem filtro</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
              <option value="monochromacy">Monocromia</option>
            </select>
          </label>

          <label className={styles.scaleField}>
            <span>Tamanho do texto <output>{preferences.textScale}%</output></span>
            <input
              type="range"
              min="100"
              max="140"
              step="10"
              value={preferences.textScale}
              onChange={(event) => updatePreferences({ textScale: Number(event.target.value) })}
              aria-label="Tamanho do texto"
            />
          </label>
        </div>

        <div className={styles.options}>
          <label className={styles.option}>
            <input type="checkbox" checked={preferences.wideLetters} onChange={(event) => updatePreferences({ wideLetters: event.target.checked })} />
            <span>Espaçamento entre letras</span>
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={preferences.wideLines} onChange={(event) => updatePreferences({ wideLines: event.target.checked })} />
            <span>Espaçamento entre linhas</span>
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={preferences.underlinedLinks} onChange={(event) => updatePreferences({ underlinedLinks: event.target.checked })} />
            <span>Sublinhar links</span>
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={preferences.highContrast} onChange={(event) => updatePreferences({ highContrast: event.target.checked })} />
            <span>Alto contraste</span>
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={preferences.dyslexiaFriendly} onChange={(event) => updatePreferences({ dyslexiaFriendly: event.target.checked })} />
            <span>Fonte de leitura alternativa</span>
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={preferences.reducedMotion} onChange={(event) => updatePreferences({ reducedMotion: event.target.checked })} />
            <span>Reduzir animações</span>
          </label>
          <label className={styles.option}>
            <input type="checkbox" checked={preferences.vlibras} onChange={(event) => updatePreferences({ vlibras: event.target.checked })} />
            <span>Tradutor para Libras (VLibras)</span>
          </label>
        </div>
      </section>

      <div className={styles.actions}>
        <button className={styles.startButton} type="button" onClick={start}>
          Começar
          <span aria-hidden="true">→</span>
        </button>
        <p>Você também pode ajustar essas preferências depois.</p>
      </div>
    </main>
  );
}
