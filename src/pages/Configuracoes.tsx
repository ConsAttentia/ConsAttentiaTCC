import { useNavigate } from "react-router-dom";
import MenuConta from "../componentes/MenuConta";
import { useAccessibility } from "../componentes/AcessibilidadeContext";
import styles from "./PaginaConta.module.css";

export default function Configuracoes() {
  const navigate = useNavigate();
  const { preferences, updatePreferences, resetPreferences } = useAccessibility();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className={styles.brand} type="button" onClick={() => navigate("/home")}>ConsAttentia</button>
        <MenuConta />
      </header>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Preferências</p>
        <h1 className={styles.title}>Configurações de acessibilidade</h1>
        <p className={styles.description}>Ajustes aplicados às páginas do aplicativo e salvos neste dispositivo.</p>

        <div className={styles.layout}>
          <section className={styles.section}>
            <h2>Visão e leitura</h2>
            <label className={styles.field}>
              Filtro de cores
              <select className={styles.select} value={preferences.colorFilter} onChange={(event) => updatePreferences({ colorFilter: event.target.value as typeof preferences.colorFilter })}>
                <option value="none">Sem filtro</option>
                <option value="protanopia">Protanopia</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="tritanopia">Tritanopia</option>
              </select>
            </label>
            <label className={styles.rangeRow}>
              <span>Tamanho do texto</span>
              <output>{preferences.textScale}%</output>
              <input type="range" min="100" max="140" step="10" value={preferences.textScale} onChange={(event) => updatePreferences({ textScale: Number(event.target.value) })} aria-label="Tamanho do texto" />
            </label>
            <div className={styles.optionList}>
              <label className={styles.option}>
                <input type="checkbox" checked={preferences.wideLetters} onChange={(event) => updatePreferences({ wideLetters: event.target.checked })} />
                Espaçamento entre letras
              </label>
              <label className={styles.option}>
                <input type="checkbox" checked={preferences.highContrast} onChange={(event) => updatePreferences({ highContrast: event.target.checked })} />
                Alto contraste
              </label>
              <label className={styles.option}>
                <input type="checkbox" checked={preferences.dyslexiaFriendly} onChange={(event) => updatePreferences({ dyslexiaFriendly: event.target.checked })} />
                Fonte de leitura alternativa
              </label>
              <label className={styles.option}>
                <input type="checkbox" checked={preferences.reducedMotion} onChange={(event) => updatePreferences({ reducedMotion: event.target.checked })} />
                Reduzir animações
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2>VLibras</h2>
            <label className={styles.option}>
              <input type="checkbox" checked={preferences.vlibras} onChange={(event) => updatePreferences({ vlibras: event.target.checked })} />
              Ativar tradutor para Libras
            </label>
            <p className={styles.vlibrasNote}>O widget oficial do VLibras é carregado quando ativado e requer conexão com a internet.</p>
            <button className={styles.button} type="button" onClick={resetPreferences}>Restaurar padrões</button>
          </section>
        </div>
      </div>
    </main>
  );
}