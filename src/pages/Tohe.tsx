import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Tohe.module.css";
import fundoc from "../assets/fundoc.png";
import principal1 from "../assets/principal1.jpg";
import principal2 from "../assets/principal2.jpg";
import principal3 from "../assets/principal3.jpg";
import principal4 from "../assets/principal4.jpg";

const pieces = [
  { id: "principal1", image: principal1, alt: "Carta principal 1" },
  { id: "principal2", image: principal2, alt: "Carta principal 2" },
  { id: "principal3", image: principal3, alt: "Carta principal 3" },
  { id: "principal4", image: principal4, alt: "Carta principal 4" },
];

const Tohe: React.FC = () => {
  const navigate = useNavigate();
  const [placements, setPlacements] = React.useState<Record<number, string | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [draggedPiece, setDraggedPiece] = React.useState<string | null>(null);
  const [showPieces, setShowPieces] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [finishMessage, setFinishMessage] = React.useState("");

  const resetExperiment = () => {
    setPlacements({ 1: null, 2: null, 3: null, 4: null });
    setShowPieces(false);
    setIsComplete(false);
    setFinishMessage("");
  };

  const finishExperiment = () => {
    const isCorrect = [1, 2, 3, 4].every(
      (slot) => placements[slot] === `principal${slot}`
    );

    if (isCorrect) {
      setIsComplete(true);
      return;
    }

    setFinishMessage("Organize as imagens na ordem 1, 2, 3 e 4 para terminar.");
  };

  const placePiece = (slot: number) => {
    if (!draggedPiece) return;

    setPlacements((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        if (next[Number(key)] === draggedPiece) next[Number(key)] = null;
      });
      next[slot] = draggedPiece;
      return next;
    });
    setDraggedPiece(null);
  };

  return (
    <main className={styles.page}>
      {isComplete && (
        <section className={styles.successScreen} aria-live="polite">
          <div className={styles.successCard}>
            <span className={styles.successKicker}>ConsAttentia | TOHE</span>
            <h1>Parabéns!</h1>
            <p>Experimento terminado!</p>
            <button className={styles.successButton} onClick={() => navigate("/selecao")}>
              Voltar para seleção
            </button>
          </div>
        </section>
      )}
      <section className={styles.gameArea} aria-label="Experimento TOHE">
        <div className={styles.cards}>
          {[1, 2, 3, 4].map((slot) => {
            const placedPiece = pieces.find((piece) => piece.id === placements[slot]);

            return (
              <button
                key={slot}
                className={`${styles.card} ${placedPiece ? styles.cardFilled : ""}`}
                aria-label={`Quadrado ${slot}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => placePiece(slot)}
              >
                {placedPiece ? (
                  <img src={placedPiece.image} alt={placedPiece.alt} />
                ) : (
                  slot
                )}
              </button>
            );
          })}
        </div>

        {showPieces && (
          <div className={styles.pieces} aria-label="Cartas para arrastar">
            {pieces.map((piece) => (
              <img
                key={piece.id}
                className={styles.piece}
                src={piece.image}
                alt={piece.alt}
                draggable
                onDragStart={() => setDraggedPiece(piece.id)}
                onDragEnd={() => setDraggedPiece(null)}
              />
            ))}
          </div>
        )}

        <p className={styles.instructions}>
          Arraste as cartas para os quadrados e organize-as na ordem correta para formar uma história coerente.
        </p>

        {finishMessage && <p className={styles.finishMessage}>{finishMessage}</p>}

        <button className={styles.finishButton} onClick={finishExperiment}>
          Terminar experimento
        </button>

        <button
          className={styles.nextButton}
          aria-label="Mostrar imagens para arrastar"
          onClick={() => setShowPieces(true)}
        >
          <span></span>
          <span></span>
        </button>

        <button
          className={styles.resetButton}
          aria-label="Limpar imagens dos quadrados"
          onClick={resetExperiment}
        >
          ×
        </button>
      </section>

      <button className={styles.brand} onClick={() => navigate("/home")}>
        <img src={fundoc} alt="ConsAttentia" />
      </button>
    </main>
  );
};

export default Tohe;
