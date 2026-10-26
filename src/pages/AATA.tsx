import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import MenuConta from "../componentes/MenuConta";
import { shareTestReport } from "../componentes/relatorioTeste";
import type { TestReport } from "../componentes/relatorioTeste";
import { useRegistrarTesteConcluido } from "../componentes/useRegistrarTesteConcluido";
import styles from "./AATA.module.css";
import logo from "../assets/fundoc.png";
import blueA from "../assets/Letra A igual.png";
import blueB from "../assets/Letra B igual.png";
import blueC from "../assets/Letra C igual.png";
import blueD from "../assets/Letra D igual.png";
import yellowA from "../assets/Letra A dif.png";
import yellowB from "../assets/Letra B dif.png";
import yellowC from "../assets/Letra C dif.png";
import yellowD from "../assets/Letra D dif.png";

type Letter = "A" | "B" | "C" | "D";
type Rule = "equal" | "different";
type Phase = "intro" | "playing-blue" | "ready-yellow" | "playing-yellow" | "results";
type Trial = {
  rule: Rule;
  first: Letter;
  second: Letter;
  target: boolean;
};

const trialsPerPhase = 16;
const targetsPerPhase = trialsPerPhase / 2;
const trialDuration = 1800;
const letters: Letter[] = ["A", "B", "C", "D"];
const letterImages: Record<Rule, Record<Letter, string>> = {
  equal: { A: blueA, B: blueB, C: blueC, D: blueD },
  different: { A: yellowA, B: yellowB, C: yellowC, D: yellowD },
};

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function createTrials(rule: Rule): Trial[] {
  const targetStates = Array.from({ length: trialsPerPhase }, (_, index) => index < targetsPerPhase);
  for (let index = targetStates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [targetStates[index], targetStates[swapIndex]] = [targetStates[swapIndex], targetStates[index]];
  }

  return targetStates.map((target) => {
    const firstIndex = Math.floor(Math.random() * letters.length);
    const first = letters[firstIndex];
    const pairIsEqual = target ? rule === "equal" : rule === "different";
    const secondIndex = pairIsEqual
      ? firstIndex
      : (firstIndex + 1 + Math.floor(Math.random() * (letters.length - 1))) % letters.length;

    return { rule, first, second: letters[secondIndex], target };
  });
}

export default function AATA() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [blueTrials, setBlueTrials] = useState<Trial[]>([]);
  const [yellowTrials, setYellowTrials] = useState<Trial[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [blueCorrect, setBlueCorrect] = useState(0);
  const [yellowCorrect, setYellowCorrect] = useState(0);
  const [misses, setMisses] = useState(0);
  const [blueMisses, setBlueMisses] = useState(0);
  const [yellowMisses, setYellowMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [blueFalseAlarms, setBlueFalseAlarms] = useState(0);
  const [yellowFalseAlarms, setYellowFalseAlarms] = useState(0);
  const [inputErrors, setInputErrors] = useState(0);
  const [blueInputErrors, setBlueInputErrors] = useState(0);
  const [yellowInputErrors, setYellowInputErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState<{ trialIndex: number; text: string } | null>(null);
  const [reportMessage, setReportMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const startTime = useRef<number | null>(null);
  const answeredThisTrial = useRef(false);
  const isBluePhase = phase === "playing-blue";
  const activeTrials = isBluePhase ? blueTrials : yellowTrials;
  const currentTrial = activeTrials[trialIndex];

  const registerInputError = useCallback((message: string) => {
    setInputErrors((count) => count + 1);
    if (isBluePhase) setBlueInputErrors((count) => count + 1);
    else setYellowInputErrors((count) => count + 1);
    setFeedback({ trialIndex, text: message });
  }, [isBluePhase, trialIndex]);

  useEffect(() => {
    if ((phase !== "playing-blue" && phase !== "playing-yellow") || startTime.current === null) return;

    const intervalId = window.setInterval(() => {
      if (startTime.current !== null) setElapsed(Date.now() - startTime.current);
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [phase]);

  useEffect(() => {
    if (phase === "results") void import("jspdf");
  }, [phase]);

  useEffect(() => {
    if ((phase !== "playing-blue" && phase !== "playing-yellow") || !currentTrial) return;

    answeredThisTrial.current = false;
    const timeoutId = window.setTimeout(() => {
      if (!answeredThisTrial.current && currentTrial.target) {
        setMisses((count) => count + 1);
        if (isBluePhase) setBlueMisses((count) => count + 1);
        else setYellowMisses((count) => count + 1);
      }

      if (trialIndex === activeTrials.length - 1) {
        if (isBluePhase) {
          setTrialIndex(0);
          setPhase("ready-yellow");
        } else {
          if (startTime.current !== null) setElapsed(Date.now() - startTime.current);
          setPhase("results");
        }
      } else {
        setTrialIndex((index) => index + 1);
      }
    }, trialDuration);

    return () => window.clearTimeout(timeoutId);
  }, [activeTrials.length, currentTrial, isBluePhase, phase, trialIndex]);

  useEffect(() => {
    if ((phase !== "playing-blue" && phase !== "playing-yellow") || !currentTrial) return;

    const handleSpace = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code !== "Space") {
        if (!["Shift", "Control", "Alt", "Meta"].includes(event.key)) {
          registerInputError("Erro: use somente a tecla Espaço para responder.");
        }
        return;
      }

      event.preventDefault();
      if (answeredThisTrial.current) return;

      answeredThisTrial.current = true;
      setAttempts((count) => count + 1);
      if (currentTrial.target) {
        setScore((count) => count + 10);
        setCorrect((count) => count + 1);
        if (isBluePhase) setBlueCorrect((count) => count + 1);
        else setYellowCorrect((count) => count + 1);
        setFeedback({ trialIndex, text: "Acerto! +10 pontos" });
      } else {
        setFalseAlarms((count) => count + 1);
        if (isBluePhase) setBlueFalseAlarms((count) => count + 1);
        else setYellowFalseAlarms((count) => count + 1);
        setFeedback({ trialIndex, text: "Resposta fora da regra. Continue atento." });
      }
    };

    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [currentTrial, isBluePhase, phase, registerInputError, trialIndex]);

  const handleStimulusClick = useCallback(() => {
    if (!currentTrial.target) {
      registerInputError("Erro: não clique em um estímulo fora da regra.");
    }
  }, [currentTrial, registerInputError]);

  const beginTest = () => {
    startTime.current = Date.now();
    setBlueTrials(createTrials("equal"));
    setYellowTrials(createTrials("different"));
    setTrialIndex(0);
    setScore(0);
    setAttempts(0);
    setCorrect(0);
    setBlueCorrect(0);
    setYellowCorrect(0);
    setMisses(0);
    setBlueMisses(0);
    setYellowMisses(0);
    setFalseAlarms(0);
    setBlueFalseAlarms(0);
    setYellowFalseAlarms(0);
    setInputErrors(0);
    setBlueInputErrors(0);
    setYellowInputErrors(0);
    setElapsed(0);
    setFeedback(null);
    setReportMessage("");
    answeredThisTrial.current = false;
    setPhase("playing-blue");
  };

  const beginYellowPhase = () => {
    setTrialIndex(0);
    setFeedback(null);
    answeredThisTrial.current = false;
    setPhase("playing-yellow");
  };

  const resetTest = () => {
    startTime.current = null;
    setPhase("intro");
    setBlueTrials([]);
    setYellowTrials([]);
    setTrialIndex(0);
    setScore(0);
    setAttempts(0);
    setCorrect(0);
    setBlueCorrect(0);
    setYellowCorrect(0);
    setMisses(0);
    setBlueMisses(0);
    setYellowMisses(0);
    setFalseAlarms(0);
    setBlueFalseAlarms(0);
    setYellowFalseAlarms(0);
    setInputErrors(0);
    setBlueInputErrors(0);
    setYellowInputErrors(0);
    setElapsed(0);
    setFeedback(null);
    setReportMessage("");
  };

  const report: TestReport = {
    userName: auth?.currentUser?.displayName || localStorage.getItem("consattentia-user-name") || "Não informado",
    email: auth?.currentUser?.email || "Não informado",
    testName: "AATA - Atividade de Atenção Alternada",
    score,
    attempts,
    duration: formatDuration(elapsed),
    details: [
      ["Pontuação total", `${score} de ${targetsPerPhase * 2 * 10} pontos`],
      ["Fase azul — letras iguais", `${blueCorrect} de ${targetsPerPhase} alvos`],
      ["Omissões na fase azul", String(blueMisses)],
      ["Respostas fora da regra na fase azul", String(blueFalseAlarms)],
      ["Erros de interação na fase azul", String(blueInputErrors)],
      ["Fase amarela — letras diferentes", `${yellowCorrect} de ${targetsPerPhase} alvos`],
      ["Omissões na fase amarela", String(yellowMisses)],
      ["Respostas fora da regra na fase amarela", String(yellowFalseAlarms)],
      ["Erros de interação na fase amarela", String(yellowInputErrors)],
      ["Omissões", String(misses)],
      ["Respostas a estímulos fora da regra", String(falseAlarms)],
      ["Erros de interação", String(inputErrors)],
      ["Tentativas com a tecla Espaço", String(attempts)],
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
            <h1>AATA</h1>
            <p className={styles.lead}>
              Você fará duas fases, uma de cada vez. Na fase AZUL, pressione Espaço somente quando as duas letras forem iguais. Depois de concluir essa fase, começará a fase AMARELA; nela, pressione Espaço somente quando as letras forem diferentes. As mesmas letras podem aparecer em combinações iguais ou diferentes. Não pressione Espaço quando o par não corresponder à regra. Clicar em um estímulo fora da regra ou pressionar outra tecla será registrado como erro.
            </p>
            <div className={styles.instructions}>
              <strong>Fase 1 — azul</strong>
              <span className={styles.blueInstruction}>Observe as duas letras e pressione Espaço somente quando forem iguais.</span>
              <strong>Fase 2 — amarelo</strong>
              <span className={styles.yellowInstruction}>Depois de concluir a fase azul, inicie a fase amarela. Pressione Espaço somente quando as letras forem diferentes.</span>
              <span>Em ambas as fases, não pressione Espaço quando as letras não corresponderem à regra.</span>
            </div>
            <button className={styles.primaryButton} type="button" onClick={beginTest}>Iniciar teste</button>
          </div>
        )}

        {phase === "ready-yellow" && (
          <div className={styles.panel}>
            <span className={styles.kicker}>Fase 1 concluída</span>
            <h1>Fase 2 — amarelo</h1>
            <p className={styles.lead}>
              Agora a regra muda. Observe as duas letras e pressione Espaço somente quando forem diferentes. Se forem iguais, não pressione a tecla.
            </p>
            <div className={`${styles.ruleCue} ${styles.yellowCue}`}>
              <span>AMARELO · DIFERENTE</span>
            </div>
            <button className={styles.primaryButton} type="button" onClick={beginYellowPhase}>Iniciar fase amarela</button>
          </div>
        )}

        {(phase === "playing-blue" || phase === "playing-yellow") && currentTrial && (
          <div className={`${styles.panel} ${styles.gamePanel}`}>
            <span className={styles.kicker}>
              Fase {isBluePhase ? "1 de 2 · azul" : "2 de 2 · amarelo"} · Estímulo {trialIndex + 1} de {activeTrials.length}
            </span>
            <h1>{isBluePhase ? "Letras iguais" : "Letras diferentes"}</h1>
            <p className={styles.lead}>
              {isBluePhase
                ? "Pressione Espaço quando as duas letras forem iguais. Se forem diferentes, não pressione."
                : "Pressione Espaço quando as duas letras forem diferentes. Se forem iguais, não pressione."}
            </p>
            <div className={styles.scoreboard}>
              <span>{score} pontos</span>
              <span>Acertos: {correct}</span>
            </div>
            <div className={`${styles.ruleCue} ${isBluePhase ? styles.blueCue : styles.yellowCue}`}>
              <span>{isBluePhase ? "AZUL · IGUAL" : "AMARELO · DIFERENTE"}</span>
            </div>
            <div
              className={styles.stimulus}
              aria-label={`Compare as letras ${currentTrial.first} e ${currentTrial.second}`}
              onClick={handleStimulusClick}
            >
              <img src={letterImages[currentTrial.rule][currentTrial.first]} alt={`Letra ${currentTrial.first}`} />
              <span aria-hidden="true">×</span>
              <img src={letterImages[currentTrial.rule][currentTrial.second]} alt={`Letra ${currentTrial.second}`} />
            </div>
            <p className={styles.feedback} role="status">
              {feedback?.trialIndex === trialIndex ? feedback.text : "Observe as letras e siga a regra indicada."}
            </p>
          </div>
        )}

        {phase === "results" && (
          <div className={styles.panel}>
            <span className={styles.kicker}>Resultado final</span>
            <h1>AATA concluído</h1>
            <p className={styles.lead}>Atividade de Atenção Alternada — duas fases concluídas.</p>
            <dl className={styles.results}>
              <div><dt>Pontuação total</dt><dd>{score} <span>/ {targetsPerPhase * 2 * 10} pontos</span></dd></div>
              <div><dt>Fase azul · letras iguais</dt><dd>{blueCorrect} <span>/ {targetsPerPhase} acertos</span></dd></div>
              <div><dt>Fase amarela · letras diferentes</dt><dd>{yellowCorrect} <span>/ {targetsPerPhase} acertos</span></dd></div>
              <div><dt>Omissões</dt><dd>{misses}</dd></div>
              <div><dt>Respostas fora da regra</dt><dd>{falseAlarms}</dd></div>
              <div><dt>Erros de interação</dt><dd>{inputErrors}</dd></div>
              <div><dt>Tentativas com Espaço</dt><dd>{attempts}</dd></div>
              <div><dt>Tempo total</dt><dd>{formatDuration(elapsed)}</dd></div>
            </dl>
            <div className={styles.resultActions}>
              <button className={styles.primaryButton} type="button" onClick={() => navigate("/selecao")}>Finalizar teste</button>
              <button className={styles.secondaryButton} type="button" onClick={resetTest}>Refazer teste</button>
              <button className={styles.shareButton} type="button" disabled={isSharing} onClick={handleShare}>
                {isSharing ? "Preparando PDF..." : "Compartilhar"}
              </button>
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
