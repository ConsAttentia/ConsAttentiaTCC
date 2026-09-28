import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import MenuConta from "./MenuConta";
import { shareTestReport } from "./relatorioTeste";
import type { TestReport } from "./relatorioTeste";
import styles from "./TesteAtencao.module.css";
import logo from "../assets/fundoc.png";
import easyAudio from "../assets/ConsAttentia Áudio Letra P 2.0.mp3";
import mediumAudio from "../assets/ConsAttentia Áudio Roupa 2.0.mp3";
import easyOne from "../assets/facil1.jpeg";
import easyTwo from "../assets/facil2.jpeg";
import easyThree from "../assets/facil3.jpeg";
import principalOne from "../assets/principal1.jpg";
import principalTwo from "../assets/principal2.jpg";
import principalThree from "../assets/principal3.jpg";
import principalFour from "../assets/principal4.jpg";

type TesteAtencaoProps = { testName: "TOHE" | "AATS"; visualLevels?: boolean };
type Phase = "intro" | "visual-easy" | "visual-medium" | "ready-easy" | "playing-easy" | "ready-medium" | "playing-medium" | "results";
type Piece = { id: string; image: string; alt: string };

const easyWords = ["pato", "casa", "leite", "peixe", "pássaro", "blusa", "carro", "loja", "sofá", "cama", "calça", "porco", "bermuda", "raquete", "celular", "lápis", "panda", "pipoca", "pão", "relógio", "copo", "taça", "chave", "leite", "banana", "vaso", "cueca", "sabão", "pera", "flor", "pimenta", "forno", "pastel", "mamão", "jaula", "pipa", "panela", "pente", "porta", "escova", "saia", "lenço", "pai", "pessoa", "escola", "paciência", "escolha", "paixão", "luz", "paz"];
const mediumWords = ["casa", "parque", "blusa", "carro", "loja", "sofá", "cama", "calça", "bermuda", "raquete", "celular", "lápis", "relógio", "copo", "taça", "chave", "leite", "banana", "vaso", "cueca", "sabão", "escova", "saia", "lenço", "mesa", "coração", "caderno"];
const clothingWords = new Set(["blusa", "calça", "bermuda", "cueca", "saia", "lenço"]);
const easyPieces: Piece[] = [
  { id: "facil1", image: easyOne, alt: "Cena fácil 1" },
  { id: "facil2", image: easyTwo, alt: "Cena fácil 2" },
  { id: "facil3", image: easyThree, alt: "Cena fácil 3" },
];
const mediumPieces: Piece[] = [
  { id: "principal1", image: principalOne, alt: "Carta principal 1" },
  { id: "principal2", image: principalTwo, alt: "Carta principal 2" },
  { id: "principal3", image: principalThree, alt: "Carta principal 3" },
  { id: "principal4", image: principalFour, alt: "Carta principal 4" },
];

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function TesteAtencao({ testName, visualLevels = false }: TesteAtencaoProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [placements, setPlacements] = useState<Record<number, string | null>>({});
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [completedVisualLevels, setCompletedVisualLevels] = useState<Set<string>>(() => new Set());
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [reportMessage, setReportMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const startTime = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wordIndexRef = useRef(0);
  const answeredWords = useRef(new Set<string>());
  const currentLevel = phase.includes("medium") ? "medium" : "easy";
  const currentWords = currentLevel === "easy" ? easyWords : mediumWords;
  const currentTargets = useMemo(
    () => currentLevel === "easy"
      ? new Set(easyWords.filter((word) => word.toLocaleLowerCase("pt-BR").startsWith("p")))
      : clothingWords,
    [currentLevel],
  );
  const totalCorrectWords = easyWords.filter((word) => word.startsWith("p")).length + clothingWords.size;
  const currentPieces = phase === "visual-easy" ? easyPieces : mediumPieces;
  const slotCount = phase === "visual-easy" ? 3 : 4;
  const audioSource = currentLevel === "easy" ? easyAudio : mediumAudio;

  useEffect(() => {
    if (!startTime.current || phase === "results" || phase === "intro") return;
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
    setPhase(visualLevels ? "visual-easy" : "ready-easy");
  };

  const placePiece = (slot: number, pieceId = selectedPiece) => {
    if (!pieceId) return;
    setPlacements((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        if (next[Number(key)] === pieceId) next[Number(key)] = null;
      });
      next[slot] = pieceId;
      return next;
    });
    setSelectedPiece(null);
    setMessage("");
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>, slot: number) => {
    event.preventDefault();
    placePiece(slot, event.dataTransfer.getData("text/plain"));
  };

  const validateVisualLevel = () => {
    setAttempts((count) => count + 1);
    const correct = Array.from({ length: slotCount }, (_, index) => index + 1)
      .every((slot) => placements[slot] === `${phase === "visual-easy" ? "facil" : "principal"}${slot}`);
    if (!correct) {
      setMessage(`Organize as ${slotCount} imagens na ordem correta para continuar.`);
      setMessageIsError(true);
      return;
    }
    setCompletedVisualLevels((levels) => new Set(levels).add(phase));
    setMessage("Sequência correta. Nível concluído.");
    setMessageIsError(false);
  };

  const continueVisualLevel = () => {
    setPlacements({});
    setMessage("");
    if (phase === "visual-easy") setPhase("visual-medium");
    else setPhase("results");
  };

  const startAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setFeedback("");
    setMessage("");
    setCurrentWordIndex(0);
    setAudioPlaying(false);
    wordIndexRef.current = 0;
    answeredWords.current.clear();
    try {
      await audio.play();
      setPhase(currentLevel === "easy" ? "playing-easy" : "playing-medium");
    } catch {
      setMessage("Não foi possível reproduzir o áudio. Verifique o volume e tente novamente.");
      setMessageIsError(true);
    }
  };

  const completeLevel = () => {
    setAudioPlaying(false);
    setFeedback("");
    if (phase === "playing-easy") setPhase("ready-medium");
    else setPhase("results");
  };

  const onAudioTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const index = Math.min(currentWords.length - 1, Math.floor((audio.currentTime / audio.duration) * currentWords.length));
    wordIndexRef.current = index;
    setCurrentWordIndex(index);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const handleSpace = useCallback((event: globalThis.KeyboardEvent) => {
    if (event.code !== "Space" || event.repeat || !audioPlaying || !(phase === "playing-easy" || phase === "playing-medium")) return;
    event.preventDefault();
    setAttempts((count) => count + 1);
    const word = currentWords[wordIndexRef.current];
    const answerKey = `${currentLevel}-${wordIndexRef.current}`;
    if (currentTargets.has(word) && !answeredWords.current.has(answerKey)) {
      answeredWords.current.add(answerKey);
      setScore((points) => points + 10);
      setFeedback("Resposta correta: +10 pontos");
    } else {
      setFeedback("Resposta registrada");
    }
  }, [audioPlaying, currentLevel, currentTargets, currentWords, phase]);

  useEffect(() => {
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [handleSpace]);

  const report: TestReport = {
    userName: auth?.currentUser?.displayName || localStorage.getItem("consattentia-user-name") || "Não informado",
    email: auth?.currentUser?.email || "Não informado",
    testName: testName === "TOHE" ? "TOHE - Organização de Histórias Emocionais" : "AATS - Atividade de Atenção Sustentada",
    score,
    attempts,
    duration: formatDuration(elapsed),
    details: visualLevels
      ? [
          ["Níveis concluídos", `${completedVisualLevels.size} de 2`],
          ["Tentativas de organização", String(attempts)],
          ["Tempo total", formatDuration(elapsed)],
        ]
      : undefined,
  };

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

  const resetTest = () => {
    startTime.current = null;
    setPhase("intro");
    setPlacements({});
    setScore(0);
    setAttempts(0);
    setCompletedVisualLevels(new Set());
    setElapsed(0);
    setMessage("");
    setReportMessage("");
    setSelectedPiece(null);
  };

  const handleAudioKeyDown = (event: ReactKeyboardEvent<HTMLAudioElement>) => {
    if (event.code === "Space") event.preventDefault();
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
            <span className={styles.kicker}>{testName === "TOHE" ? "Organização e atenção" : "Atenção sustentada"}</span>
            <h1>{testName === "TOHE" ? "Teste TOHE" : "AATS"}</h1>
            <p className={styles.lead}>
              {visualLevels
                ? "Organize as cenas em sequência nos níveis fácil e médio."
                : "Ouça as palavras com atenção e responda à regra de cada nível. O teste contém uma etapa fácil e uma etapa média."}
            </p>
            <div className={styles.levelSummary}>
              {visualLevels ? (
                <span>Níveis fácil e médio: organização visual</span>
              ) : (
                <>
                  <span>Fácil: palavras iniciadas com P</span>
                  <span>Médio: roupas e acessórios</span>
                </>
              )}
            </div>
            <button className={styles.primaryButton} type="button" onClick={beginTest}>Iniciar teste</button>
          </div>
        )}

        {(phase === "visual-easy" || phase === "visual-medium") && (
          <div className={`${styles.panel} ${styles.visualPanel}`}>
            <span className={styles.kicker}>{phase === "visual-easy" ? "Nível fácil" : "Nível médio"}</span>
            <h1>Organize a sequência</h1>
            <p className={styles.lead}>Arraste uma imagem para cada posição ou selecione a imagem e depois a posição.</p>
            <div className={styles.slots}>
              {Array.from({ length: slotCount }, (_, index) => {
                const slot = index + 1;
                const piece = currentPieces.find((item) => item.id === placements[slot]);
                return (
                  <button key={slot} className={`${styles.slot} ${piece ? styles.filledSlot : ""}`} type="button" aria-label={`Posição ${slot}`} onClick={() => placePiece(slot)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, slot)}>
                    {piece ? <img src={piece.image} alt={piece.alt} /> : <span>{slot}</span>}
                  </button>
                );
              })}
            </div>
            <div className={styles.pieces} aria-label="Imagens para organizar">
              {currentPieces.map((piece) => (
                <button key={piece.id} type="button" className={`${styles.pieceButton} ${selectedPiece === piece.id ? styles.selectedPiece : ""}`} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", piece.id)} onClick={() => setSelectedPiece(piece.id)} aria-label={`Selecionar ${piece.alt}`}>
                  <img src={piece.image} alt={piece.alt} />
                </button>
              ))}
            </div>
            {message && <p className={`${styles.feedback} ${messageIsError ? styles.error : ""}`} role={messageIsError ? "alert" : "status"}>{message}</p>}
            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={validateVisualLevel}>Conferir sequência</button>
              {!messageIsError && message && <button className={styles.secondaryButton} type="button" onClick={continueVisualLevel}>Próximo nível</button>}
            </div>
          </div>
        )}

        {(phase === "ready-easy" || phase === "ready-medium") && (
          <div className={styles.panel}>
            <span className={styles.kicker}>{phase === "ready-easy" ? "Nível fácil" : "Nível médio"}</span>
            <h1>{phase === "ready-easy" ? "Letra P" : "Roupas e acessórios"}</h1>
            <p className={styles.lead}>Antes de iniciar, prepare-se para ouvir a sequência. Durante a reprodução, pressione <kbd>Espaço</kbd> somente quando a palavra atender ao critério.</p>
            <p className={styles.rule}>
              {phase === "ready-easy" ? "Pressione Espaço quando ouvir uma palavra que começa com a letra P." : "Pressione Espaço quando ouvir uma peça de roupa ou um acessório."}
            </p>
            <audio ref={audioRef} className={styles.audio} src={audioSource} preload="metadata" onKeyDown={handleAudioKeyDown} />
            {message && <p className={`${styles.feedback} ${styles.error}`} role="alert">{message}</p>}
            <button className={styles.primaryButton} type="button" onClick={startAudio}>Iniciar nível {phase === "ready-easy" ? "fácil" : "médio"}</button>
          </div>
        )}

        {(phase === "playing-easy" || phase === "playing-medium") && (
          <div className={styles.panel}>
            <span className={styles.kicker}>{phase === "playing-easy" ? "Nível fácil" : "Nível médio"}</span>
            <h1>{phase === "playing-easy" ? "Atenção à letra P" : "Atenção às roupas"}</h1>
            <p className={styles.lead}>Pressione <kbd>Espaço</kbd> somente nas palavras corretas. Respostas incorretas não retiram pontos.</p>
            <div className={styles.liveStats}>
              <span>Palavra {currentWordIndex + 1} de {currentWords.length}</span>
              <span>{score} pontos</span>
              <span>{formatDuration(elapsed)}</span>
            </div>
            <audio ref={audioRef} className={styles.audioEngine} src={audioSource} autoPlay aria-label={`Áudio do nível ${currentLevel}`} onPlay={() => setAudioPlaying(true)} onPause={() => setAudioPlaying(false)} onTimeUpdate={onAudioTimeUpdate} onEnded={completeLevel} onKeyDown={handleAudioKeyDown} />
            <div className={styles.playbackControls}>
              <span role="status">{audioPlaying ? "Áudio em reprodução" : "Áudio pausado"}</span>
              <button className={styles.secondaryButton} type="button" onClick={toggleAudio} onKeyDown={(event) => {
                if (event.code === "Space") event.preventDefault();
              }}>
                {audioPlaying ? "Pausar áudio" : "Continuar áudio"}
              </button>
            </div>
            <p className={styles.feedback} role="status">{feedback || "O áudio está tocando. Ouça com atenção."}</p>
          </div>
        )}

        {phase === "results" && (
          <div className={styles.panel}>
            <span className={styles.kicker}>Resultado final</span>
            <h1>{visualLevels ? "TOHE concluído" : "AATS concluído"}</h1>
            <p className={styles.lead}>{testName === "TOHE" ? "TOHE" : "AATS — Atividade de Atenção Sustentada"}</p>
            <dl className={styles.results}>
              {visualLevels ? (
                <>
                  <div><dt>Níveis concluídos</dt><dd>{completedVisualLevels.size} <span>/ 2 níveis</span></dd></div>
                  <div><dt>Tentativas de organização</dt><dd>{attempts}</dd></div>
                  <div><dt>Tempo total</dt><dd>{formatDuration(elapsed)}</dd></div>
                </>
              ) : (
                <>
                  <div><dt>Pontuação total</dt><dd>{score} <span>/ {totalCorrectWords * 10} pontos</span></dd></div>
                  <div><dt>Tentativas</dt><dd>{attempts}</dd></div>
                  <div><dt>Tempo total</dt><dd>{formatDuration(elapsed)}</dd></div>
                  <div><dt>Resultado</dt><dd>{Math.round((score / (totalCorrectWords * 10)) * 100)}% de acertos pontuáveis</dd></div>
                </>
              )}
            </dl>
            <div className={styles.resultActions}>
              <button className={styles.primaryButton} type="button" onClick={() => navigate("/selecao")}>Finalizar teste</button>
              <button className={styles.secondaryButton} type="button" onClick={resetTest}>Refazer teste</button>
              <button className={styles.shareButton} type="button" disabled={isSharing} onClick={handleShare}>{isSharing ? "Preparando PDF..." : "Compartilhar"}</button>
            </div>
            {reportMessage && <p className={styles.feedback} role="status">{reportMessage}</p>}
          </div>
        )}
      </section>
      <footer className={styles.footer}>ConsAttentia · Atenção e foco</footer>
    </main>
  );
}