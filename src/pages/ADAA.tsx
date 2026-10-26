import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import MenuConta from "../componentes/MenuConta";
import { shareTestReport } from "../componentes/relatorioTeste";
import type { TestReport } from "../componentes/relatorioTeste";
import { useRegistrarTesteConcluido } from "../componentes/useRegistrarTesteConcluido";
import styles from "./ADAA.module.css";
import logo from "../assets/fundoc.png";
import riverGrid from "../assets/RioGrade.png";
import autumnGrid from "../assets/OutonoGrade.png";
import cityGrid from "../assets/CidadeGrade.png";

const gridSize = 5;
const cropsPerLevel = 3;

const levels = [
  { name: "Floresta", difficulty: "Fácil", image: riverGrid, aspectRatio: "596 / 380" },
  { name: "Casa", difficulty: "Médio", image: autumnGrid, aspectRatio: "740 / 415" },
  { name: "Cidade", difficulty: "Difícil", image: cityGrid, aspectRatio: "16 / 9" },
] as const;

type Phase = "intro" | "playing" | "results";
type LevelAnswers = Array<number | null>;

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function createRandomCrops() {
  const cells = Array.from({ length: gridSize * gridSize }, (_, index) => index);
  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cells[index], cells[swapIndex]] = [cells[swapIndex], cells[index]];
  }
  return cells.slice(0, cropsPerLevel);
}

export default function ADAA() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [levelIndex, setLevelIndex] = useState(0);
  const [cropIndex, setCropIndex] = useState(0);
  const [targets, setTargets] = useState<number[][]>([]);
  const [answers, setAnswers] = useState<LevelAnswers[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [reportMessage, setReportMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const startTime = useRef<number | null>(null);
  const currentLevel = levels[levelIndex];
  const currentTargets = targets[levelIndex] ?? [];
  const currentAnswers = answers[levelIndex] ?? [];

  useEffect(() => {
    if (!startTime.current || phase !== "playing") return;
    const updateElapsed = () => setElapsed(Date.now() - startTime.current!);
    updateElapsed();
    const timerId = window.setInterval(updateElapsed, 250);
    return () => window.clearInterval(timerId);
  }, [phase]);

  useEffect(() => {
    if (phase === "results") void import("jspdf");
  }, [phase]);

  const beginTest = () => {
    startTime.current = Date.now();
    setElapsed(0);
    setLevelIndex(0);
    setCropIndex(0);
    setTargets(levels.map(() => createRandomCrops()));
    setAnswers(levels.map(() => Array(cropsPerLevel).fill(null)));
    setScore(0);
    setAttempts(0);
    setReportMessage("");
    setPhase("playing");
  };

  const answerCell = (cellIndex: number) => {
    const targetIndex = currentTargets[cropIndex];
    if (targetIndex === undefined || currentAnswers[cropIndex] !== null) return;

    setAnswers((previous) => {
      const next = previous.map((levelAnswers) => [...levelAnswers]);
      next[levelIndex][cropIndex] = cellIndex;
      return next;
    });
    setAttempts((count) => count + 1);
    if (cellIndex === targetIndex) setScore((count) => count + 1);

    if (cropIndex < cropsPerLevel - 1) setCropIndex((index) => index + 1);
  };

  const continueLevel = () => {
    if (levelIndex === levels.length - 1) {
      setPhase("results");
      return;
    }
    setLevelIndex((index) => index + 1);
    setCropIndex(0);
  };

  const resetTest = () => {
    startTime.current = null;
    setPhase("intro");
    setLevelIndex(0);
    setCropIndex(0);
    setTargets([]);
    setAnswers([]);
    setScore(0);
    setAttempts(0);
    setElapsed(0);
    setReportMessage("");
  };

  const report: TestReport = {
    userName: auth?.currentUser?.displayName || localStorage.getItem("consattentia-user-name") || "Não informado",
    email: auth?.currentUser?.email || "Não informado",
    testName: "ADAS - Atividade de Atenção Seletiva",
    score,
    attempts,
    duration: formatDuration(elapsed),
    details: [
      ["Pontuação", `${score} de ${levels.length * cropsPerLevel} pontos`],
      ["Recortes respondidos", `${attempts} de ${levels.length * cropsPerLevel}`],
      ["Resultado por nível", levels.map((level, index) => `${level.name}: ${answers[index]?.filter((answer, crop) => answer === targets[index]?.[crop]).length ?? 0}/3`).join(" · ")],
      ["Tempo total", formatDuration(elapsed)],
    ],
  };
  const historySave = useRegistrarTesteConcluido(report, phase === "results");

  const handleShare = async () => {
    setIsSharing(true);
    setReportMessage("");
    try {
      const result = await shareTestReport(report);
      setReportMessage(result === "shared" ? "Relatório enviado para compartilhamento." : "PDF baixado para o dispositivo.");
    } catch (error) {
      const cancelled = error instanceof Error && error.name === "AbortError";
      setReportMessage(cancelled ? "Compartilhamento cancelado." : "Não foi possível gerar ou compartilhar o PDF.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className={styles.brand} type="button" onClick={() => navigate("/home")} aria-label="Ir para o início">
          <img src={logo} alt="ConsAttentia" />
        </button>
        <MenuConta />
      </header>

      <section className={styles.content} aria-live="polite">
        {phase === "intro" && (
          <div className={styles.panel}>
            <span className={styles.kicker}>Atenção alternada</span>
            <h1>ADAS</h1>
            <p className={styles.lead}>
              Compare cada recorte com a grade e selecione o quadrado correspondente. Serão três recortes em cada um dos três níveis.
            </p>
            <ul className={styles.levelSummary}>
              {levels.map((level) => (
                <li key={level.name}>{level.difficulty}: {level.name}</li>
              ))}
            </ul>
            <button className={styles.primaryButton} type="button" onClick={beginTest}>Iniciar teste</button>
          </div>
        )}

        {phase === "playing" && currentLevel && (
          <div className={`${styles.panel} ${styles.gamePanel}`}>
            <span className={styles.kicker}>Nível {levelIndex + 1} de {levels.length} · {currentLevel.difficulty}</span>
            <h1>{currentLevel.name}</h1>
            <p className={styles.lead}>Selecione o quadrado da grade que corresponde ao recorte destacado.</p>

            <div className={styles.game}>
              <div className={styles.gridFrame} style={{ aspectRatio: currentLevel.aspectRatio }}>
                <img className={styles.gridImage} src={currentLevel.image} alt={`Imagem da ${currentLevel.name} dividida em uma grade de 5 por 5`} />
                <div className={styles.gridButtons}>
                  {Array.from({ length: gridSize * gridSize }, (_, cellIndex) => (
                    <button
                      key={cellIndex}
                      className={styles.gridCell}
                      type="button"
                      aria-label={`Selecionar linha ${Math.floor(cellIndex / gridSize) + 1}, coluna ${(cellIndex % gridSize) + 1}`}
                      onClick={() => answerCell(cellIndex)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.cropList} aria-label={`Recortes do nível ${currentLevel.name}`}>
                {currentTargets.map((targetCell, index) => (
                  <article
                    key={`${levelIndex}-${index}`}
                    className={`${styles.cropCard} ${index === cropIndex ? styles.activeCrop : ""} ${currentAnswers[index] !== null ? styles.answeredCrop : ""}`}
                    aria-current={index === cropIndex ? "step" : undefined}
                  >
                    <div
                      className={styles.cropImage}
                      role="img"
                      aria-label={`Recorte ${index + 1} de ${cropsPerLevel}`}
                      style={{
                        aspectRatio: currentLevel.aspectRatio,
                        backgroundImage: `url("${currentLevel.image}")`,
                        backgroundPosition: `${(targetCell % gridSize) * 25}% ${Math.floor(targetCell / gridSize) * 25}%`,
                      }}
                    />
                    <span>{currentAnswers[index] !== null ? "Respondido" : `Recorte ${index + 1}`}</span>
                  </article>
                ))}
              </div>
            </div>

            {cropIndex === cropsPerLevel - 1 && currentAnswers[cropIndex] !== null && (
              <div className={styles.actions}>
                {levelIndex < levels.length - 1 ? (
                  <button className={styles.primaryButton} type="button" onClick={continueLevel}>Próximo nível</button>
                ) : (
                  <button className={styles.primaryButton} type="button" onClick={continueLevel}>Ver resultado</button>
                )}
              </div>
            )}
            <p className={styles.progress} role="status">Recorte {Math.min(cropIndex + 1, cropsPerLevel)} de {cropsPerLevel}</p>
          </div>
        )}

        {phase === "results" && (
          <div className={styles.panel}>
            <span className={styles.kicker}>Resultado final</span>
            <h1>ADAS concluído</h1>
            <p className={styles.lead}>Atividade de Atenção Seletiva</p>
            <dl className={styles.results}>
              <div><dt>Pontuação total</dt><dd>{score} <span>/ {levels.length * cropsPerLevel} pontos</span></dd></div>
              <div><dt>Recortes respondidos</dt><dd>{attempts} <span>/ {levels.length * cropsPerLevel}</span></dd></div>
              <div><dt>Tempo total</dt><dd>{formatDuration(elapsed)}</dd></div>
            </dl>
            <div className={styles.resultActions}>
              <button className={styles.primaryButton} type="button" onClick={() => navigate("/selecao")}>Finalizar teste</button>
              <button className={styles.secondaryButton} type="button" onClick={resetTest}>Refazer teste</button>
              <button className={styles.shareButton} type="button" disabled={isSharing} onClick={handleShare}>{isSharing ? "Preparando PDF..." : "Compartilhar"}</button>
            </div>
            {historySave.status === "saving" && <p className={styles.feedback} role="status">Salvando teste e PDF no histórico...</p>}
            {historySave.status === "saved" && <p className={styles.feedback} role="status">Teste e PDF salvos no histórico do perfil.</p>}
            {historySave.status === "error" && (
              <p className={styles.feedback} role="alert">
                {historySave.error}{" "}
                <button className={styles.secondaryButton} type="button" onClick={historySave.retry}>Tentar salvar novamente</button>
              </p>
            )}
            {reportMessage && <p className={styles.feedback} role="status">{reportMessage}</p>}
          </div>
        )}
      </section>
      <footer className={styles.footer}>ConsAttentia · Atenção e foco</footer>
    </main>
  );
}
