import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase/firebase";
import { recordCompletedTest } from "./historicoTestes";
import type { TestReport } from "./relatorioTeste";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useRegistrarTesteConcluido(report: TestReport, completed: boolean) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const historyId = useRef<string | null>(null);
  const lastAttempt = useRef("");

  useEffect(() => {
    if (!completed) {
      historyId.current = null;
      lastAttempt.current = "";
      return;
    }

    const currentHistoryId = historyId.current ?? crypto.randomUUID();
    historyId.current = currentHistoryId;
    const currentAttempt = `${currentHistoryId}:${retryCount}`;
    if (lastAttempt.current === currentAttempt) return;
    lastAttempt.current = currentAttempt;

    void Promise.resolve().then(() => {
      setStatus("saving");
      setError("");
      const user = auth?.currentUser;
      if (!user) throw new Error("Entre na sua conta para salvar o histórico do teste neste navegador.");
      return recordCompletedTest(report, currentHistoryId, user.uid);
    }).then(
      () => setStatus("saved"),
      (saveError: unknown) => {
        setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar este teste no histórico.");
        setStatus("error");
      },
    );
  }, [completed, report, retryCount]);

  return {
    status: completed ? status : "idle",
    error,
    retry: () => setRetryCount((count) => count + 1),
  };
}
