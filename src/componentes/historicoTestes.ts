import { createTestReportPdf, getTestReportFileName } from "./relatorioTeste";
import type { TestReport } from "./relatorioTeste";

export type TestHistoryEntry = {
  id: string;
  userName: string;
  email: string;
  testName: string;
  score: number;
  attempts: number;
  duration: string;
  details: Array<[string, string]>;
  completedAt: Date;
};

type StoredTestHistoryEntry = TestHistoryEntry & { userId: string };

const databaseName = "consattentia-local";
const storeName = "testHistory";
export const testHistoryUpdatedEvent = "consattentia:test-history-updated";

function openHistoryDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("O navegador não oferece suporte ao armazenamento local do histórico."));
      return;
    }

    const request = window.indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        const store = database.createObjectStore(storeName, { keyPath: "id" });
        store.createIndex("userId", "userId");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir o histórico local."));
    request.onblocked = () => reject(new Error("O histórico está bloqueado por outra aba. Feche as outras abas e tente novamente."));
  });
}

function runHistoryTransaction<T>(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    let result: T;

    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => reject(request.error ?? new Error("Não foi possível acessar o histórico local."));
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível salvar o histórico local."));
    transaction.onabort = () => reject(transaction.error ?? new Error("A operação do histórico local foi cancelada."));
  });
}

export async function getTestHistory(userId: string) {
  const database = await openHistoryDatabase();
  try {
    const records = await runHistoryTransaction(
      database,
      "readonly",
      (store) => store.index("userId").getAll(userId),
    );
    return (records as StoredTestHistoryEntry[])
      .map((entry) => ({
        id: entry.id,
        userName: entry.userName,
        email: entry.email,
        testName: entry.testName,
        score: entry.score,
        attempts: entry.attempts,
        duration: entry.duration,
        details: entry.details,
        completedAt: entry.completedAt,
      }))
      .sort((first, second) => second.completedAt.getTime() - first.completedAt.getTime());
  } finally {
    database.close();
  }
}

export async function recordCompletedTest(report: TestReport, historyId: string, userId: string) {
  const database = await openHistoryDatabase();
  try {
    const entry: StoredTestHistoryEntry = {
      id: historyId,
      userId,
      userName: report.userName,
      email: report.email,
      testName: report.testName,
      score: report.score,
      attempts: report.attempts,
      duration: report.duration,
      details: report.details ?? [],
      completedAt: new Date(),
    };
    await runHistoryTransaction(database, "readwrite", (store) => store.put(entry));
  } finally {
    database.close();
  }
  window.dispatchEvent(new CustomEvent(testHistoryUpdatedEvent, { detail: { userId } }));
}

export async function downloadTestHistoryPdf(entry: TestHistoryEntry) {
  const report: TestReport = {
    userName: entry.userName,
    email: entry.email,
    testName: entry.testName,
    score: entry.score,
    attempts: entry.attempts,
    duration: entry.duration,
    details: entry.details.length > 0 ? entry.details : undefined,
  };
  const pdf = await createTestReportPdf(report);
  const url = URL.createObjectURL(pdf);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = getTestReportFileName(entry.testName);
  window.document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
