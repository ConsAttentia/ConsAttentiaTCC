import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import MenuConta from "./MenuConta";
import { shareTestReport } from "./relatorioTeste";
import type { TestReport } from "./relatorioTeste";
import { useRegistrarTesteConcluido } from "./useRegistrarTesteConcluido";
import styles from "./TesteAtencao.module.css";
import logo from "../assets/fundoc.png";
import easyAudio from "../assets/ConsAttentia Áudio Letra P 2.0.mp3";
import mediumAudio from "../assets/ConsAttentia Áudio Roupa 2.0.mp3";

interface TesteAtencaoProps {
  testName: "TOHE" | "AATS";
  visualLevels?: boolean;
}
type Phase = "intro" | "visual-easy" | "visual-medium" | "visual-hard" | "ready-easy" | "playing-easy" | "ready-medium" | "playing-medium" | "results";
type VisualLevel = "easy" | "medium" | "hard";
type Piece = { id: string; image: string; alt: string };
type VisualStory = {
  id: string;
  level: VisualLevel;
  title: string;
  pieces: Piece[];
  correctOrder: string[];
};

const easyWords = ["pato", "casa", "leite", "peixe", "pássaro", "blusa", "carro", "loja", "sofá", "cama", "calça", "porco", "bermuda", "raquete", "celular", "lápis", "panda", "pipoca", "pão", "relógio", "copo", "taça", "chave", "leite", "banana", "vaso", "cueca", "sabão", "pera", "flor", "pimenta", "forno", "pastel", "mamão", "jaula", "pipa", "panela", "pente", "porta", "escova", "saia", "lenço", "pai", "pessoa", "escola", "paciência", "escolha", "paixão", "luz", "paz"];
const mediumWords = ["casa", "parque", "blusa", "carro", "loja", "sofá", "cama", "calça", "bermuda", "raquete", "celular", "lápis", "relógio", "copo", "taça", "chave", "leite", "banana", "vaso", "cueca", "sabão", "escova", "saia", "lenço", "mesa", "coração", "caderno"];
const clothingWords = new Set(["blusa", "calça", "bermuda", "cueca", "saia", "lenço"]);

const shuffleArray = <T,>(items: T[]) => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

const cartaOne = new URL("../assets/carta1.jpg", import.meta.url).href;
const cartaTwo = new URL("../assets/carta2.jpg", import.meta.url).href;
const cartaThree = new URL("../assets/carta3.jpg", import.meta.url).href;
const idosaOne = new URL("../assets/Idosa1.jpg", import.meta.url).href;
const idosaTwo = new URL("../assets/Idosa2.jpg", import.meta.url).href;
const idosaThree = new URL("../assets/Idosa3.jpg", import.meta.url).href;
const babyOne = new URL("../assets/Baby1.jpg", import.meta.url).href;
const babyTwo = new URL("../assets/Baby2.jpg", import.meta.url).href;
const babyThree = new URL("../assets/Baby3.jpg", import.meta.url).href;
const cachorroOne = new URL("../assets/cachorro1.jpg", import.meta.url).href;
const cachorroTwo = new URL("../assets/cachorro2.jpg", import.meta.url).href;
const cachorroThree = new URL("../assets/cachorro3.jpg", import.meta.url).href;
const cachorroFour = new URL("../assets/cachorro4.jpg", import.meta.url).href;
const loucaOne = new URL("../assets/louça1.jpg", import.meta.url).href;
const loucaTwo = new URL("../assets/louça2.jpg", import.meta.url).href;
const loucaThree = new URL("../assets/louça3.jpg", import.meta.url).href;
const loucaFour = new URL("../assets/louça4.jpg", import.meta.url).href;
const paredeOne = new URL("../assets/parede1.jpg", import.meta.url).href;
const paredeTwo = new URL("../assets/parede2.jpg", import.meta.url).href;
const paredeThree = new URL("../assets/parede3.jpg", import.meta.url).href;
const paredeFour = new URL("../assets/parede4.jpg", import.meta.url).href;
const paredeFive = new URL("../assets/parede5.jpg", import.meta.url).href;

const easyStories: VisualStory[] = [
  {
    id: "cartas",
    level: "easy",
    title: "Cartas",
    correctOrder: ["carta1", "carta2", "carta3"],
    pieces: [
      { id: "carta1", image: cartaOne, alt: "Carta 1" },
      { id: "carta2", image: cartaTwo, alt: "Carta 2" },
      { id: "carta3", image: cartaThree, alt: "Carta 3" },
    ],
  },
  {
    id: "idosa",
    level: "easy",
    title: "Idosa",
    correctOrder: ["idosa1", "idosa2", "idosa3"],
    pieces: [
      { id: "idosa1", image: idosaOne, alt: "Idosa 1" },
      { id: "idosa2", image: idosaTwo, alt: "Idosa 2" },
      { id: "idosa3", image: idosaThree, alt: "Idosa 3" },
    ],
  },
  {
    id: "baby",
    level: "easy",
    title: "Bebê",
    correctOrder: ["baby1", "baby2", "baby3"],
    pieces: [
      { id: "baby1", image: babyOne, alt: "Baby 1" },
      { id: "baby2", image: babyTwo, alt: "Baby 2" },
      { id: "baby3", image: babyThree, alt: "Baby 3" },
    ],
  },
];

const mediumStories: VisualStory[] = [
  {
    id: "cachorro",
    level: "medium",
    title: "Cachorro",
    correctOrder: ["cachorro1", "cachorro2", "cachorro3", "cachorro4"],
    pieces: [
      { id: "cachorro1", image: cachorroOne, alt: "Cachorro 1" },
      { id: "cachorro2", image: cachorroTwo, alt: "Cachorro 2" },
      { id: "cachorro3", image: cachorroThree, alt: "Cachorro 3" },
      { id: "cachorro4", image: cachorroFour, alt: "Cachorro 4" },
    ],
  },
  {
    id: "louca",
    level: "medium",
    title: "Louça",
    correctOrder: ["louca1", "louca2", "louca3", "louca4"],
    pieces: [
      { id: "louca1", image: loucaOne, alt: "Louça 1" },
      { id: "louca2", image: loucaTwo, alt: "Louça 2" },
      { id: "louca3", image: loucaThree, alt: "Louça 3" },
      { id: "louca4", image: loucaFour, alt: "Louça 4" },
    ],
  },
];

const hardStories: VisualStory[] = [
  {
    id: "parede",
    level: "hard",
    title: "Parede",
    correctOrder: ["parede1", "parede2", "parede3", "parede4", "parede5"],
    pieces: [
      { id: "parede1", image: paredeOne, alt: "Parede 1" },
      { id: "parede2", image: paredeTwo, alt: "Parede 2" },
      { id: "parede3", image: paredeThree, alt: "Parede 3" },
      { id: "parede4", image: paredeFour, alt: "Parede 4" },
      { id: "parede5", image: paredeFive, alt: "Parede 5" },
    ],
  },
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
  const [activeStory, setActiveStory] = useState<VisualStory | null>(null);
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
  const currentPieces = activeStory?.pieces ?? [];
  const slotCount = activeStory ? activeStory.pieces.length : 0;
  const audioSource = currentLevel === "easy" ? easyAudio : mediumAudio;

  const beginVisualLevel = useCallback((level: VisualLevel) => {
    const stories = level === "easy" ? easyStories : level === "medium" ? mediumStories : hardStories;
    const nextStory = stories[Math.floor(Math.random() * stories.length)];
    setActiveStory({
      ...nextStory,
      pieces: shuffleArray(nextStory.pieces),
      correctOrder: [...nextStory.correctOrder],
    });
    setPlacements({});
    setSelectedPiece(null);
    setMessage("");
    setMessageIsError(false);
  }, []);

  useEffect(() => {
    if (phase === "visual-easy") beginVisualLevel("easy");
    if (phase === "visual-medium") beginVisualLevel("medium");
    if (phase === "visual-hard") beginVisualLevel("hard");
  }, [beginVisualLevel, phase]);

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
    setActiveStory(null);
    setPlacements({});
    setSelectedPiece(null);
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
    const story = activeStory;
    if (!story) return;

    setAttempts((count) => count + 1);
    const correct = story.correctOrder.every((pieceId, index) => placements[index + 1] === pieceId);
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
    setSelectedPiece(null);
    setMessage("");
    if (phase === "visual-easy") setPhase("visual-medium");
    else if (phase === "visual-medium") setPhase("visual-hard");
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
          ["Níveis concluídos", `${completedVisualLevels.size} de 3`],
          ["Tentativas de organização", String(attempts)],
          ["Tempo total", formatDuration(elapsed)],
        ]
      : undefined,
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
    setActiveStory(null);
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
                ? "Organize as cenas em sequência nos níveis fácil, médio e difícil."
                : "Ouça as palavras com atenção e responda à regra de cada nível. O teste contém uma etapa fácil e uma etapa média."}
            </p>
            <div className={styles.levelSummary}>
              {visualLevels ? (
                <>
                  <span>Fácil: cartas, idosa ou bebê</span>
                  <span>Médio: cachorro ou louça</span>
                  <span>Difícil: parede</span>
                </>
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

        {(phase === "visual-easy" || phase === "visual-medium" || phase === "visual-hard") && activeStory && (
          <div className={`${styles.panel} ${styles.visualPanel}`}>
            <span className={styles.kicker}>{phase === "visual-easy" ? "Nível fácil" : phase === "visual-medium" ? "Nível médio" : "Nível difícil"}</span>
            <h1>Organize a sequência</h1>
            <p className={styles.lead}>História: {activeStory.title}. Arraste uma imagem para cada posição ou selecione a imagem e depois a posição.</p>
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
                  <div><dt>Níveis concluídos</dt><dd>{completedVisualLevels.size} <span>/ 3 níveis</span></dd></div>
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
            {historySave.status === "saving" && <p className={styles.feedback} role="status">Salvando teste e PDF no histórico...</p>}
            {historySave.status === "saved" && <p className={styles.feedback} role="status">Teste e PDF salvos no histórico do perfil.</p>}
            {historySave.status === "error" && (
              <p className={`${styles.feedback} ${styles.error}`} role="alert">
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